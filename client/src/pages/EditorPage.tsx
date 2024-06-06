import ACTIONS from "@/actions";
import Editor from "@/components/Editor";
import Logo from "@/components/Logo";
import User from "@/components/User";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { initSocket } from "@/socket";
import { Copy, LogOut, Sidebar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

type clientType = {
  username: string;
  socketId: string;
};

let username: string;
const EditorPage = () => {
  const [clients, setClients] = useState<clientType[]>([]);
  const [lang, setLang] = useState("java");
  const [openSidebar, setOpenSidebar] = useState(false);

  const socketRef = useRef<Socket>(null!);
  const codeRef = useRef<string | null>(null);

  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!searchParams.get("username")) {
    username = `user-${Math.floor(Math.random() * 9999)}`;
  }

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err.message));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: searchParams.get("username") || username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== (searchParams.get("username") || username)) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);

  function handleErrors(e: string) {
    console.log("socket error", e);
    toast.error("Socket connection failed, try again later.");
    navigate("/");
  }

  function handleLeave() {
    toast.success("Room leaved successfully");
    navigate("/");
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId!);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  return (
    <div className="flex relative">
      <aside
        className={cn(
          "w-[300px] border-r h-screen p-4 flex flex-col max-md:absolute -left-[400px] top-0 z-30 bg-background duration-500",
          openSidebar && "left-0 relative"
        )}
      >
        <div className="py-4 border-b-2 hidden md:block">
          <Logo />
        </div>
        <div className="space-y-5 mt-4 flex-1">
          <p>Connected</p>
          <div className="space-y-4">
            {clients.map((client) => (
              <User key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Button onClick={copyRoomId}>
            <Copy size={15} className="mr-4" /> Copy Room Id
          </Button>
          <Button variant={"destructive"} onClick={handleLeave}>
            {" "}
            <LogOut size={15} className="mr-4" /> Leave Room
          </Button>
        </div>
        <div
          onClick={() => setOpenSidebar(!openSidebar)}
          className={cn(
            "absolute top-6 cursor-pointer hover:scale-125 duration-300 -right-3 md:hidden",
            !openSidebar && "-right-[150px]"
          )}
        >
          <Sidebar />
        </div>
      </aside>
      <div className="flex-1 flex flex-col h-screen">
        {/* NAVBAR */}
        <div className="p-4 border-b-2 flex items-center justify-between md:justify-end">
          <div className="md:hidden pl-[100px]">
            <Logo />
          </div>
          <div>
            <Select
              value={lang}
              onValueChange={(value: string) => setLang(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="javascript">Javascript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">Css</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CODE EDITOR */}
        <div className="flex-1 w-full">
          <Editor
            lang={lang}
            code={codeRef.current!}
            socket={socketRef.current}
            onCodeChange={(code) => (codeRef.current = code)}
            roomId={roomId!}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
