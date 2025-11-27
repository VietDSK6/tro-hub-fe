import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "@/api/notifications";
import { useNavigate } from "react-router-dom";
import type { Notification } from "@/types";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "CONNECTION_REQUEST":
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      );
    case "CONNECTION_ACCEPTED":
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "CONNECTION_REJECTED":
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
  }
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(1, 10),
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    }
  });

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      markReadMutation.mutate(notif._id);
    }
    
    if (notif.metadata?.listing_id) {
      navigate(`/listings/${notif.metadata.listing_id}`);
      onClose();
    } else if (notif.type === "CONNECTION_REQUEST") {
      navigate("/connections");
      onClose();
    }
  };

  if (!isOpen) return null;

  const notifications = data?.items || [];

  return (
    <div className="absolute top-14 right-4 w-96 bg-white rounded-2xl shadow-lg border z-50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Thông báo</h3>
            {data?.unread_count ? (
              <span className="text-xs text-gray-500">{data.unread_count} chưa đọc</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {data?.unread_count ? (
              <button 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-blue-600 hover:text-blue-700"
                disabled={markAllReadMutation.isPending}
              >
                Đọc tất cả
              </button>
            ) : null}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có thông báo mới
          </div>
        ) : (
          notifications.map((notif: Notification) => (
            <div 
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition flex gap-3 ${
                !notif.read ? 'bg-blue-50/50' : ''
              }`}
            >
              {getNotificationIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.content}</p>
                <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(notif.created_at)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 border-t text-center">
        <button 
          onClick={() => {
            navigate("/connections");
            onClose();
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Quản lý kết nối
        </button>
      </div>
    </div>
  );
}
