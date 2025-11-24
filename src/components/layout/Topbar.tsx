import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { meProfile } from "@/api/profiles";
import NotificationModal from "./NotificationModal";
import { useAuthModal } from "@/contexts/AuthModalContext";

export default function Topbar(){
  const { isAuthed, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { openLoginModal, openRegisterModal } = useAuthModal();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (isAuthed) {
      meProfile().then(profile => {
        setUserName(profile.full_name || "User");
      }).catch(() => {
        setUserName("User");
      });
    }
  }, [isAuthed]);

  return (
    <div className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-8 h-16 flex items-center gap-8">
        <Link to="/" className="text-6xl flex-shrink-0" style={{fontFamily: 'Bowlby, sans-serif'}}>
          Troj Hub
        </Link>
        
        <nav className="flex gap-1 text-sm items-center flex-1">
          <Link to="/listings" className="btn btn-ghost">Phòng trọ cho bạn</Link>
          <Link to="/reviews" className="btn btn-ghost">Phân tích, đánh giá</Link>
          <Link to="/matching" className="btn btn-ghost">Gợi ý</Link>
          <Link to="/favorites" className="btn btn-ghost">Yêu thích</Link>
          <Link to="/guide" className="btn btn-ghost">Cẩm nang phòng trọ</Link>
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0 relative">
          {isAuthed ? (
            <>
              <button 
                className="btn btn-ghost p-2 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <Link to="/listings/new" className="btn btn-ghost">
                Đăng tin
              </Link>

              <button 
                onClick={() => navigate("/profile")}
                className="btn btn-ghost"
              >
                {userName}
              </button>

              <button className="btn btn-primary" onClick={logout}>
                Đăng xuất
              </button>
              
              <NotificationModal 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            </>
          ) : (
            <>
              <button onClick={openLoginModal} className="btn btn-ghost">
                Đăng nhập
              </button>
              
              <button onClick={openRegisterModal} className="btn btn-primary">
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
