import {useEffect} from 'react'
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import EditorPage from "@/pages/EditorPage";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const App = () => {

  useEffect(() => {
    upInstance();
  } , [])

  const upInstance = async () => {
    let response  = await fetch("https://codelab-th59.onrender.com/health");
    response = await response.JSON();
    console.log(response);
  }

  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
        <Route path="*" element={<Navigate to={"/"} />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
