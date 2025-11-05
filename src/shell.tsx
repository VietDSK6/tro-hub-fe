import { Outlet } from "react-router-dom";
import Topbar from "@/components/layout/Topbar";
import { ToastProvider } from "@/contexts/ToastContext";

export default function Shell(){
  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <Topbar/>
        <Outlet/>
      </div>
    </ToastProvider>
  );
}
