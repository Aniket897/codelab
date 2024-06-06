import ACTIONS from "@/actions";
import MonacoEditor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

type editorProps = {
  lang: string;
  code: string;
  socket: Socket;
  roomId: string;
  onCodeChange: (code: string) => void;
};

const Editor = ({ lang, code, socket, roomId, onCodeChange }: editorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null!);

  useEffect(() => {
    if (socket) {
      socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          onCodeChange(code);
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socket]);

  function handleCodeChange(ev: editor.IModelContentChangedEvent) {
    if (!ev.isFlush) {
      const code = editorRef.current.getValue();
      onCodeChange(code);
      socket.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code,
      });
    }
  }

  return (
    <div className="w-full">
      <MonacoEditor
        height="90vh"
        language={lang}
        value={code}
        theme="vs-dark"
        onChange={(_, ev) => handleCodeChange(ev)}
        onMount={(editor) => (editorRef.current = editor)}
        options={{
          lineHeight: 30,
          fontFamily: "Oxygen mono",
          cursorBlinking: "blink",
          codeLens: false,
        }}
      />
    </div>
  );
};

export default Editor;
