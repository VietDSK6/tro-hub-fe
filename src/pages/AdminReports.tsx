import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, resolveReport, ReportItem } from "@/api/reports";
import { meProfile } from "@/api/profiles";
import { useToastContext } from "@/contexts/ToastContext";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { AlertTriangle, Trash2, X, Eye, CheckCircle, XCircle, Loader2, Filter } from "lucide-react";

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function AdminReports() {
  const { success, error } = useToastContext();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ report: ReportItem; action: "delete_listing" | "dismiss" } | null>(null);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["me"],
    queryFn: meProfile
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["admin-reports", statusFilter],
    queryFn: () => getReports({ status: statusFilter || undefined }),
    enabled: profile?.role === "ADMIN"
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: "delete_listing" | "dismiss" }) =>
      resolveReport(reportId, action),
    onSuccess: (data, variables) => {
      success(variables.action === "delete_listing" ? "Đã xóa tin đăng" : "Đã bỏ qua báo cáo");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setConfirmAction(null);
      setSelectedReport(null);
    },
    onError: () => {
      error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  });

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (profile?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const reports = reportsData?.items || [];
  const openCount = reportsData?.open_count || 0;

  return (
    <div className="container-app max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-500" />
            Quản lý báo cáo
          </h1>
          <p className="text-gray-600 mt-1">Xem và xử lý các báo cáo vi phạm từ người dùng</p>
        </div>
        {openCount > 0 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
            {openCount} báo cáo chờ xử lý
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {[
              { value: "OPEN", label: "Chờ xử lý", color: "yellow" },
              { value: "RESOLVED", label: "Đã xử lý", color: "green" },
              { value: "DISMISSED", label: "Đã bỏ qua", color: "gray" },
              { value: "", label: "Tất cả", color: "blue" }
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status.value
                    ? status.color === "yellow" ? "bg-yellow-100 text-yellow-800" :
                      status.color === "green" ? "bg-green-100 text-green-800" :
                      status.color === "gray" ? "bg-gray-200 text-gray-800" :
                      "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có báo cáo nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {report.listing?.images?.[0] ? (
                      <img src={report.listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {report.listing?.title || "Tin đăng đã bị xóa"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Giá: {report.listing?.price?.toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        report.status === "OPEN" ? "bg-yellow-100 text-yellow-800" :
                        report.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                        "bg-gray-200 text-gray-800"
                      }`}>
                        {report.status === "OPEN" ? "Chờ xử lý" :
                         report.status === "RESOLVED" ? "Đã xử lý" : "Đã bỏ qua"}
                      </span>
                    </div>

                    <div className="mt-2 p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-800">
                        <span className="font-medium">Lý do:</span> {report.reason}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Báo cáo bởi: {report.reporter?.name || report.reporter?.email || "Ẩn danh"} • {formatDate(report.created_at)}
                      </div>
                    </div>

                    {report.status === "OPEN" && (
                      <div className="flex gap-2 mt-3">
                        <Link
                          to={`/listings/${report.listing_id}`}
                          target="_blank"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Xem tin
                        </Link>
                        <button
                          onClick={() => setConfirmAction({ report, action: "delete_listing" })}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa tin
                        </button>
                        <button
                          onClick={() => setConfirmAction({ report, action: "dismiss" })}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Bỏ qua
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {confirmAction.action === "delete_listing" ? "Xác nhận xóa tin" : "Xác nhận bỏ qua"}
              </h3>
              <button onClick={() => setConfirmAction(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {confirmAction.action === "delete_listing" 
                ? "Bạn có chắc chắn muốn xóa tin đăng này? Tất cả báo cáo liên quan sẽ được đánh dấu đã xử lý."
                : "Bạn có chắc chắn muốn bỏ qua báo cáo này? Tin đăng sẽ không bị ảnh hưởng."}
            </p>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <div className="font-medium text-gray-900">{confirmAction.report.listing?.title}</div>
              <div className="text-sm text-gray-500 mt-1">Lý do: {confirmAction.report.reason}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => resolveMutation.mutate({ reportId: confirmAction.report._id, action: confirmAction.action })}
                disabled={resolveMutation.isPending}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  confirmAction.action === "delete_listing"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {resolveMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
