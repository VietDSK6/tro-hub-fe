import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAuth(){
  const uid = localStorage.getItem("userId");
  const loc = useLocation();
  if (!uid) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return <Outlet/>;
}
