import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getIncomingConnections, getOutgoingConnections, updateConnectionStatus } from "@/api/connections";
import { useToastContext } from "@/contexts/ToastContext";
import type { Connection } from "@/types";

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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800"
  };
  const labels = {
    PENDING: "Chờ phản hồi",
    ACCEPTED: "Đã chấp nhận",
    REJECTED: "Đã từ chối"
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function Connections() {
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const { success, error } = useToastContext();
  const queryClient = useQueryClient();

  const { data: incoming, isLoading: loadingIncoming } = useQuery({
    queryKey: ["connections", "incoming"],
    queryFn: () => getIncomingConnections(1, 50)
  });

  const { data: outgoing, isLoading: loadingOutgoing } = useQuery({
    queryKey: ["connections", "outgoing"],
    queryFn: () => getOutgoingConnections(1, 50)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "REJECTED" }) =>
      updateConnectionStatus(id, status),
    onSuccess: (_, variables) => {
      success(variables.status === "ACCEPTED" ? "Đã chấp nhận yêu cầu kết nối" : "Đã từ chối yêu cầu");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  });

  const isLoading = tab === "incoming" ? loadingIncoming : loadingOutgoing;
  const connections = tab === "incoming" ? incoming?.items : outgoing?.items;
  const pendingCount = incoming?.items?.filter((c: Connection) => c.status === "PENDING").length || 0;

  return (
    <div className="container-app p-4 space-y-6">
      <div>
        <h1 className="h1 mb-2">Quản lý kết nối</h1>
        <p className="text-sm text-gray-600">Xem và quản lý các yêu cầu kết nối của bạn</p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("incoming")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "incoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yêu cầu đến
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "outgoing"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yêu cầu đã gửi
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : !connections || connections.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>
            {tab === "incoming" 
              ? "Chưa có yêu cầu kết nối nào" 
              : "Bạn chưa gửi yêu cầu kết nối nào"}
          </p>
          {tab === "outgoing" && (
            <Link to="/listings" className="btn-primary mt-4 inline-block px-4 py-2 rounded-lg">
              Tìm phòng trọ
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((conn: Connection) => (
            <div key={conn._id} className="card p-4">
              <div className="flex gap-4">
                {conn.listing?.images?.[0] ? (
                  <img 
                    src={conn.listing.images[0]} 
                    alt={conn.listing.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link 
                        to={`/listings/${conn.listing_id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {conn.listing?.title || "Tin đăng"}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {conn.listing?.price?.toLocaleString("vi-VN")} đ/tháng
                      </p>
                    </div>
                    <StatusBadge status={conn.status} />
                  </div>

                  <div className="mt-2 text-sm">
                    {tab === "incoming" ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Từ: <strong>{conn.from_user?.name || "Người dùng"}</strong></span>
                        {conn.status === "PENDING" && conn.from_user?.email && (
                          <span className="text-gray-400">({conn.from_user.email})</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Đến: <strong>{conn.to_user?.name || "Chủ phòng"}</strong></span>
                      </div>
                    )}
                  </div>

                  {conn.message && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded italic">
                      "{conn.message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{formatTimeAgo(conn.created_at)}</span>

                    {tab === "incoming" && conn.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateMutation.mutate({ id: conn._id, status: "REJECTED" })}
                          disabled={updateMutation.isPending}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: conn._id, status: "ACCEPTED" })}
                          disabled={updateMutation.isPending}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Chấp nhận
                        </button>
                      </div>
                    )}

                    {tab === "outgoing" && conn.status === "ACCEPTED" && conn.to_user && (
                      <div className="flex items-center gap-3 text-sm">
                        {conn.to_user.email && (
                          <a href={`mailto:${conn.to_user.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </a>
                        )}
                        {conn.to_user.phone && (
                          <a href={`tel:${conn.to_user.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {conn.to_user.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
