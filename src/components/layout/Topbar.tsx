import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { meProfile } from "@/api/profiles";
import { getUnreadCount } from "@/api/notifications";
import NotificationModal from "./NotificationModal";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Bell, ChevronDown, User, Users, Building2, LogOut } from "lucide-react";

export default function Topbar(){
  const { isAuthed, isAdmin, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const { openLoginModal, openRegisterModal } = useAuthModal();
  const [userName, setUserName] = useState("");

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-count"],
    queryFn: getUnreadCount,
    enabled: isAuthed,
    refetchInterval: 30000
  });

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
    <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-8 h-16 flex items-center gap-8">
        <Link to="/" className="text-6xl flex-shrink-0" style={{fontFamily: 'Bowlby, sans-serif'}}>
          Troj Hub
        </Link>
        
        <nav className="flex gap-1 text-sm items-center flex-1">
          <Link to="/listings" className="btn btn-ghost">Phòng trọ cho bạn</Link>
          <Link to="/analytics" className="btn btn-ghost">Phân tích thị trường</Link>
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
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isAdmin ? (
                <Link to="/admin/approval" className="btn btn-ghost">
                  Duyệt bài
                </Link>
              ) : (
                <Link to="/listings/new" className="btn btn-ghost">
                  Đăng tin
                </Link>
              )}

              <div className="relative group">
                <button className="btn btn-ghost flex items-center gap-1">
                  {userName}
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>

                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Hồ sơ của tôi
                    </div>
                  </Link>
                  <Link 
                    to="/connections" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Kết nối của tôi
                    </div>
                  </Link>
                  {!isAdmin && (
                    <Link 
                      to="/my-listings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Tin của tôi
                      </div>
                    </Link>
                  )}
                  <div className="border-t my-1"></div>
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </div>
                  </button>
                </div>
              </div>
              
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
