import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getIncomingConnections, getOutgoingConnections, updateConnectionStatus } from "@/api/connections";
import { useToastContext } from "@/contexts/ToastContext";
import { Users, Image, User, Mail, Phone } from "lucide-react";
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
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
                    <Image className="w-8 h-8 text-gray-400" />
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
                        <User className="w-4 h-4" />
                        <span>Từ: </span>
                        <Link 
                          to={`/users/${conn.from_user_id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {conn.from_user?.name || "Người dùng"}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Đến: </span>
                        <Link 
                          to={`/users/${conn.to_user_id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {conn.to_user?.name || "Chủ phòng"}
                        </Link>
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
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                        )}
                        {conn.to_user.phone && (
                          <a href={`tel:${conn.to_user.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Phone className="w-4 h-4" />
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
