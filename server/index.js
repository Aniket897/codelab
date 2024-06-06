const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const cors = require("cors");
require("dotenv").config();

const ACTIONS = require("./actions");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.get("/health", (req, resp) => {
  resp.status(200).json({
    message: "Server running",
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});
redisClient
  .connect()
  .then(() => {
    console.log("redis client conneted successfully");
  })
  .catch((error) => {
    console.log("failed to connect redis client", error);
  });

io.on("connection", (socket) => {
  console.log("socket connected :", socket.id);

  socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
    // Store user data in Redis
    await redisClient.hSet(`socket:${socket.id}`, "username", username);
    socket.join(roomId);

    // Get all connected clients in the room
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const clientData = await Promise.all(
      clients.map(async (socketId) => {
        const username = await redisClient.hGet(
          `socket:${socketId}`,
          "username"
        );
        return { socketId, username };
      })
    );

    clientData.forEach((client) => {
      io.to(client.socketId).emit("joined", {
        clients: clientData,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit("code-change", { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
    io.to(socketId).emit("code-change", { code });
  });

  socket.on("disconnecting", async () => {
    const rooms = [...socket.rooms];
    const username = await redisClient.hGet(`socket:${socket.id}`, "username");

    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: username,
      });
      socket.leave(roomId);
    });

    // Remove user data from Redis
    await redisClient.del(`socket:${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
