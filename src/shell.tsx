import { Outlet } from "react-router-dom";
import Topbar from "@/components/layout/Topbar";

export default function Shell(){
  return (
    <div className="min-h-dvh">
      <Topbar/>
      <Outlet/>
    </div>
  );
}
