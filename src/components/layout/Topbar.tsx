import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { meProfile } from "@/api/profiles";
import { getUnreadCount } from "@/api/notifications";
import NotificationModal from "./NotificationModal";
import { useAuthModal } from "@/contexts/AuthModalContext";

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
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
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Hồ sơ của tôi
                    </div>
                  </Link>
                  <Link 
                    to="/connections" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Kết nối của tôi
                    </div>
                  </Link>
                  {!isAdmin && (
                    <Link 
                      to="/my-listings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
