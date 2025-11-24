import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthModal } from "@/contexts/AuthModalContext";

export function RequireAuth(){
  const uid = localStorage.getItem("userId");
  const loc = useLocation();
  const navigate = useNavigate();
  const { openLoginModal } = useAuthModal();
  
  useEffect(() => {
    if (!uid) {
      openLoginModal();
      navigate("/", { replace: true, state: { from: loc.pathname } });
    }
  }, [uid, openLoginModal, navigate, loc.pathname]);
  
  if (!uid) return null;
  return <Outlet/>;
}
