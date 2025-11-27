import { http } from "@/app/client";
import type { NotificationsResponse } from "@/types";

export async function getNotifications(page = 1, limit = 20, unreadOnly = false) {
  const { data } = await http.get<NotificationsResponse>("/notifications", {
    params: { page, limit, unread_only: unreadOnly }
  });
  return data;
}

export async function getUnreadCount() {
  const { data } = await http.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markAsRead(notificationId: string) {
  const { data } = await http.patch(`/notifications/${notificationId}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await http.patch("/notifications/read-all");
  return data;
}

export async function deleteNotification(notificationId: string) {
  const { data } = await http.delete(`/notifications/${notificationId}`);
  return data;
}
