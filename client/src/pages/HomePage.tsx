import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HomePage = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = () => {
    toast.success("ROOM ID create successfully");
    setRoomId(v4());
  };

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomId || !username) {
      return toast.error("ROOM ID and username is required");
    }
    navigate(`/editor/${roomId}?username=${username}`, {
      state: {
        username,
      },
    });
  };

  return (
    <div>
      <div className="p-4 pt-7 w-[90vw] mx-auto">
        <Logo />
      </div>
      <div className="text-center space-y-9 min-h-[80vh] flex items-center justify-center flex-col w-[90vw] sm:w-[80vw] md:w-[70vw] mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-8xl">
          Collaborate and Code <br /> in Real-Time
        </h1>
        <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Our powerful time code collaborator and code compiler empowers teams
          to build faster and more efficiently than ever before.
        </p>
        {/* CREATE ROOM DIALOG */}
        <Dialog>
          <DialogTrigger className="mt-5" asChild>
            <Button className="w-[300px]">Create or Join a Room</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 py-4">
                <Lock /> Start or join a Room
              </DialogTitle>
              <DialogDescription>
                Create your new room in one-click.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={joinRoom} className="space-y-9">
              <div className="grid w-full items-center gap-9">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="roomId" className="text-xs">
                    * Room Id
                  </Label>
                  <Input
                    id="roomId"
                    placeholder="Enter your room id"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    * Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full mt-4" type="submit">
                Continue
              </Button>
            </form>
            <DialogFooter>
              <p
                onClick={generateRoomId}
                className="text-xs cursor-pointer hover:underline"
              >
                Generate a unique room id
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HomePage;
