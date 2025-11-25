import { useQuery, useMutation } from "@tanstack/react-query";
import { listListings, verifyListing } from "@/api/listings";
import { useToastContext } from "@/contexts/ToastContext";
import { queryClient } from "@/app/query";

export default function AdminApproval() {
  const { success, error } = useToastContext();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: () => listListings({ page: 1, limit: 100 }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "VERIFIED" | "REJECTED" }) => 
      verifyListing(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      success(variables.status === "VERIFIED" ? "Đã duyệt tin đăng" : "Đã từ chối tin đăng");
    },
    onError: () => {
      error("Có lỗi xảy ra. Vui lòng thử lại.");
    },
  });

  const pendingListings = data?.items.filter(item => item.verification_status === "PENDING") || [];
  const verifiedListings = data?.items.filter(item => item.verification_status === "VERIFIED") || [];
  const rejectedListings = data?.items.filter(item => item.verification_status === "REJECTED") || [];

  const handleVerify = (id: string, status: "VERIFIED" | "REJECTED") => {
    if (confirm(`Bạn có chắc muốn ${status === "VERIFIED" ? "duyệt" : "từ chối"} tin đăng này?`)) {
      verifyMutation.mutate({ id, status });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Duyệt bài đăng</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                {pendingListings.length}
              </span>
              Chờ duyệt
            </h2>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : pendingListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingListings.map((listing) => (
                  <div key={listing._id} className="card p-0 overflow-hidden">
                    {listing.images?.[0] && (
                      <div className="w-full h-40 overflow-hidden">
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{listing.title}</div>
                        <span className="badge">{(listing.price ?? 0).toLocaleString()} đ</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-3 line-clamp-2">{listing.desc || "—"}</div>
                      <div className="text-xs text-gray-400 mb-3">
                        Diện tích: {listing.area || "—"} m²
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(listing._id, "VERIFIED")}
                          disabled={verifyMutation.isPending}
                          className="btn btn-primary flex-1 text-sm"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleVerify(listing._id, "REJECTED")}
                          disabled={verifyMutation.isPending}
                          className="btn bg-red-500 hover:bg-red-600 text-white flex-1 text-sm"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-600">Không có tin đăng chờ duyệt</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                {verifiedListings.length}
              </span>
              Đã duyệt
            </h2>
            {verifiedListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {verifiedListings.map((listing) => (
                  <div key={listing._id} className="card p-0 overflow-hidden opacity-75">
                    {listing.images?.[0] && (
                      <div className="w-full h-40 overflow-hidden">
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{listing.title}</div>
                        <span className="badge bg-green-500">{(listing.price ?? 0).toLocaleString()} đ</span>
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">{listing.desc || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-600">Chưa có tin đăng nào được duyệt</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {rejectedListings.length}
              </span>
              Đã từ chối
            </h2>
            {rejectedListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedListings.map((listing) => (
                  <div key={listing._id} className="card p-0 overflow-hidden opacity-50">
                    {listing.images?.[0] && (
                      <div className="w-full h-40 overflow-hidden">
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{listing.title}</div>
                        <span className="badge bg-red-500">{(listing.price ?? 0).toLocaleString()} đ</span>
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">{listing.desc || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-600">Chưa có tin đăng nào bị từ chối</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
