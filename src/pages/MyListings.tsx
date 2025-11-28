import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getMyListings, deleteListing, updateListing } from "@/api/listings";
import { useToastContext } from "@/contexts/ToastContext";
import { Plus, Building, Image, Edit, Settings, Trash2, Maximize } from "lucide-react";
import type { Listing, ListingStatus } from "@/types";

function StatusBadge({ status, verificationStatus }: { status: string; verificationStatus: string }) {
  if (verificationStatus === "PENDING") {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Chờ duyệt
      </span>
    );
  }
  if (verificationStatus === "REJECTED") {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Bị từ chối
      </span>
    );
  }
  
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    HIDDEN: "bg-gray-100 text-gray-800",
    RENTED: "bg-blue-100 text-blue-800"
  };
  const labels: Record<string, string> = {
    ACTIVE: "Đang hiển thị",
    HIDDEN: "Đã ẩn",
    RENTED: "Đã cho thuê"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      {labels[status] || status}
    </span>
  );
}

export default function MyListings() {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ id: string; current: ListingStatus } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => getMyListings(1, 50)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      success("Đã xóa tin đăng");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      setDeleteConfirm(null);
    },
    onError: () => {
      error("Xóa tin đăng thất bại");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) => 
      updateListing(id, { status }),
    onSuccess: () => {
      success("Đã cập nhật trạng thái");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      setStatusModal(null);
    },
    onError: () => {
      error("Cập nhật thất bại");
    }
  });

  const listings = data?.items || [];
  const stats = {
    total: listings.length,
    active: listings.filter((l: Listing) => l.status === "ACTIVE" && l.verification_status === "VERIFIED").length,
    pending: listings.filter((l: Listing) => l.verification_status === "PENDING").length,
    hidden: listings.filter((l: Listing) => l.status === "HIDDEN").length
  };

  return (
    <div className="container-app p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h1 mb-2">Tin đăng của tôi</h1>
          <p className="text-sm text-gray-600">Quản lý các tin đăng phòng trọ của bạn</p>
        </div>
        <Link to="/listings/new" className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Đăng tin mới
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Tổng tin</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Đang hiển thị</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Chờ duyệt</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.hidden}</div>
          <div className="text-sm text-gray-500">Đã ẩn</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-8 text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Bạn chưa có tin đăng nào</p>
          <Link to="/listings/new" className="btn-primary px-6 py-2 rounded-lg inline-block">
            Đăng tin ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing: Listing) => (
            <div key={listing._id} className="card p-4">
              <div className="flex gap-4">
                {listing.images?.[0] ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  />
                ) : (
                  <div 
                    className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  >
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link 
                        to={`/listings/${listing._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-lg font-bold text-red-600 mt-1">
                        {listing.price?.toLocaleString("vi-VN")} đ/tháng
                      </p>
                    </div>
                    <StatusBadge status={listing.status || "ACTIVE"} verificationStatus={listing.verification_status} />
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Maximize className="w-4 h-4" />
                      {listing.area} m²
                    </span>
                    <span>Mã tin: #{listing._id.slice(0, 8)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/listings/${listing._id}/edit`)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>

                    <button
                      onClick={() => setStatusModal({ id: listing._id, current: listing.status || "ACTIVE" })}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Trạng thái
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(listing._id)}
                      className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h3>
            <div className="space-y-2">
              {[
                { value: "ACTIVE", label: "Đang hiển thị", desc: "Tin đăng hiển thị với mọi người" },
                { value: "HIDDEN", label: "Ẩn tin", desc: "Tin đăng tạm ẩn, không ai thấy" },
                { value: "RENTED", label: "Đã cho thuê", desc: "Đánh dấu phòng đã được thuê" }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateStatusMutation.mutate({ id: statusModal.id, status: opt.value as ListingStatus })}
                  disabled={updateStatusMutation.isPending}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    statusModal.current === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStatusModal(null)}
              className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
