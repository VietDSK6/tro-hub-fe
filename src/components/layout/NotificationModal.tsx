import { useState } from "react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const notifications = [
    { id: 1, title: "Thông báo mới", message: "Bạn có tin nhắn mới từ người tìm phòng", time: "5 phút trước" },
    { id: 2, title: "Cập nhật", message: "Tin đăng của bạn đã được duyệt", time: "1 giờ trước" },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-4 w-80 bg-white rounded-2xl shadow-lg border z-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Thông báo</h3>
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
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không có thông báo mới
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id}
                className="p-4 border-b hover:bg-gray-50 cursor-pointer transition"
              >
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 border-t text-center">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Xem tất cả thông báo
          </button>
        </div>
      </div>
  );
}
