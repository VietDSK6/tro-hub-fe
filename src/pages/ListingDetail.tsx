import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListing, deleteListing } from "@/api/listings";
import { addFavorite } from "@/api/favorites";
import { checkConnection, createConnection, getConnectionsByListing, updateConnectionStatus } from "@/api/connections";
import { meProfile } from "@/api/profiles";
import { apiSendVerification } from "@/api/auth";
import { useToastContext } from "@/contexts/ToastContext";
import { AxiosError } from "axios";
import { useState } from "react";
import type { ListingConnection } from "@/types";

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

export default function ListingDetail(){
  const { id="" } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const userId = localStorage.getItem("userId");
  
  const { data: listing } = useQuery({ queryKey:["listing", id], queryFn: ()=> getListing(id) });
  const { data: profile } = useQuery({ queryKey: ["me"], queryFn: meProfile, enabled: !!userId });
  const isVerified = profile?.is_verified;
  
  const isOwnListing = listing?.owner_id === userId;

  const sendVer = useMutation({
    mutationFn: () => apiSendVerification(),
    onSuccess: (res) => success(res.message || "Đã gửi email xác thực"),
    onError: () => error("Gửi email thất bại")
  });

  const { data: connectionStatus } = useQuery({
    queryKey: ["connection", id],
    queryFn: () => checkConnection(id),
    enabled: !!userId && !!listing && !isOwnListing
  });

  const { data: listingConnections, isLoading: loadingConnections } = useQuery({
    queryKey: ["listing-connections", id],
    queryFn: () => getConnectionsByListing(id),
    enabled: !!userId && isOwnListing
  });

  const fav = useMutation({ 
    mutationFn: ()=> addFavorite(id), 
    onSuccess: ()=> success("Đã lưu tin yêu thích!"),
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Lưu tin thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const connectMutation = useMutation({
    mutationFn: () => createConnection(id, connectMessage),
    onSuccess: () => {
      success("Đã gửi yêu cầu kết nối! Chủ phòng sẽ nhận được thông báo.");
      setShowConnectModal(false);
      setConnectMessage("");
      queryClient.invalidateQueries({ queryKey: ["connection", id] });
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const updateConnectionMutation = useMutation({
    mutationFn: ({ connectionId, status }: { connectionId: string; status: "ACCEPTED" | "REJECTED" }) =>
      updateConnectionStatus(connectionId, status),
    onSuccess: (_, variables) => {
      success(variables.status === "ACCEPTED" ? "Đã chấp nhận yêu cầu kết nối" : "Đã từ chối yêu cầu");
      queryClient.invalidateQueries({ queryKey: ["listing-connections", id] });
    },
    onError: () => {
      error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  });

  const deleteListingMutation = useMutation({
    mutationFn: () => deleteListing(id),
    onSuccess: () => {
      success("Đã xóa tin đăng");
      navigate("/my-listings");
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Xóa tin thất bại";
      error(message);
    }
  });

  if (!listing) return <div className="container-app p-4">Đang tải...</div>;

  const images = listing.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (hasImages) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (hasImages) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const amenitiesLabels: Record<string, string> = {
    ac: "Điều hòa",
    wifi: "Wifi",
    parking: "Chỗ để xe",
    water_heater: "Nóng lạnh",
    kitchen: "Bếp",
    washing_machine: "Máy giặt",
    fridge: "Tủ lạnh",
    security: "An ninh 24/7"
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-app max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {hasImages && (
              <div className="relative bg-white rounded-lg overflow-hidden shadow-sm group">
                <div className="relative h-[500px]">
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${listing.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>

                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
                    {images.map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                          i === currentImageIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">
                  {listing.location?.coordinates?.[1]?.toFixed(4)}, {listing.location?.coordinates?.[0]?.toFixed(4)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Giá thuê</div>
                  <div className="text-2xl font-bold text-red-600">
                    {listing.price?.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-xs text-gray-500">~{Math.round((listing.price || 0) / 1000)}K/tháng</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Diện tích</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.area || 0} m²
                  </div>
                  <div className="text-xs text-gray-500">5 tầng</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Phòng ngủ</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.amenities?.includes("private_room") ? "1" : "Chung"} PN
                  </div>
                  <div className="text-xs text-gray-500">{listing.status || "ACTIVE"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Mô tả chi tiết</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {listing.desc || "Chưa có mô tả chi tiết"}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đặc điểm bất động sản</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Loại hình:</span>
                  <span className="font-medium">Phòng trọ</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Diện tích:</span>
                  <span className="font-medium">{listing.area || 0} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Giá thuê:</span>
                  <span className="font-medium text-red-600">{listing.price?.toLocaleString('vi-VN')} đ/tháng</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${listing.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                    {listing.status === 'ACTIVE' ? 'Đang cho thuê' : listing.status === 'RENTED' ? 'Đã cho thuê' : 'Ẩn'}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-3">Tiện ích & Quy định</h3>
              
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tiện nghi:</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity: string) => (
                      <span key={amenity} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {amenitiesLabels[amenity] || amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {listing.rules && Object.keys(listing.rules).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quy định:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {listing.rules.pet !== undefined && (
                      <div className="flex items-center gap-2">
                        {listing.rules.pet ? (
                          <span className="text-green-600 text-sm">✓ Cho phép nuôi thú cưng</span>
                        ) : (
                          <span className="text-red-600 text-sm">✗ Không cho phép nuôi thú cưng</span>
                        )}
                      </div>
                    )}
                    {listing.rules.smoke !== undefined && (
                      <div className="flex items-center gap-2">
                        {listing.rules.smoke ? (
                          <span className="text-green-600 text-sm">✓ Cho phép hút thuốc</span>
                        ) : (
                          <span className="text-red-600 text-sm">✗ Không cho phép hút thuốc</span>
                        )}
                      </div>
                    )}
                    {listing.rules.cook !== undefined && (
                      <div className="flex items-center gap-2">
                        {listing.rules.cook ? (
                          <span className="text-green-600 text-sm">✓ Cho phép nấu ăn</span>
                        ) : (
                          <span className="text-red-600 text-sm">✗ Không cho phép nấu ăn</span>
                        )}
                      </div>
                    )}
                    {listing.rules.visitor !== undefined && (
                      <div className="flex items-center gap-2">
                        {listing.rules.visitor ? (
                          <span className="text-green-600 text-sm">✓ Cho phép khách</span>
                        ) : (
                          <span className="text-red-600 text-sm">✗ Không cho phép khách</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {isOwnListing ? (
                <>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">Tin đăng của bạn</div>
                        <div className="text-sm opacity-90">Quản lý tin đăng</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/listings/${id}/edit`}
                        className="flex-1 bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Chỉnh sửa
                      </Link>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Yêu cầu kết nối</h3>
                      {listingConnections?.pending_count ? (
                        <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                          {listingConnections.pending_count} mới
                        </span>
                      ) : null}
                    </div>

                    {loadingConnections ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    ) : !listingConnections?.items?.length ? (
                      <div className="text-center py-6 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm">Chưa có yêu cầu kết nối</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {listingConnections.items.map((conn: ListingConnection) => (
                          <div key={conn._id} className="border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                {conn.from_profile?.avatar ? (
                                  <img src={conn.from_profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <Link 
                                    to={`/users/${conn.from_user_id}`}
                                    className="font-medium text-gray-900 text-sm truncate hover:text-blue-600"
                                  >
                                    {conn.from_profile?.full_name || conn.from_user?.name || "Người dùng"}
                                  </Link>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    conn.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                    conn.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {conn.status === "PENDING" ? "Chờ" : conn.status === "ACCEPTED" ? "Đã nhận" : "Từ chối"}
                                  </span>
                                </div>
                                {conn.message && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{conn.message}"</p>
                                )}
                                <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(conn.created_at)}</div>

                                {conn.status === "PENDING" && (
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => updateConnectionMutation.mutate({ connectionId: conn._id, status: "ACCEPTED" })}
                                      disabled={updateConnectionMutation.isPending}
                                      className="flex-1 text-xs bg-green-600 text-white py-1.5 px-2 rounded hover:bg-green-700 transition-colors"
                                    >
                                      Chấp nhận
                                    </button>
                                    <button
                                      onClick={() => updateConnectionMutation.mutate({ connectionId: conn._id, status: "REJECTED" })}
                                      disabled={updateConnectionMutation.isPending}
                                      className="flex-1 text-xs border border-gray-300 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors"
                                    >
                                      Từ chối
                                    </button>
                                  </div>
                                )}

                                {conn.status === "ACCEPTED" && conn.from_user && (
                                  <div className="mt-2 pt-2 border-t space-y-1">
                                    <a href={`mailto:${conn.from_user.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      {conn.from_user.email}
                                    </a>
                                    {conn.from_user.phone && (
                                      <a href={`tel:${conn.from_user.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {conn.from_user.phone}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link 
                      to="/connections" 
                      className="block text-center text-sm text-blue-600 hover:underline mt-4 pt-3 border-t"
                    >
                      Xem tất cả kết nối →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl">{listing.owner?.name || "Chủ nhà"}</div>
                    <div className="text-sm opacity-90">{listing.owner?.email || ""}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Tham gia</div>
                    <div className="font-semibold">Trọ Hub</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Tin đăng</div>
                    <div className="font-semibold">1 tin</div>
                  </div>
                </div>

                <button className="w-full bg-white text-teal-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat qua Zalo
                </button>

                {showPhoneNumber ? (
                  <a 
                    href={`tel:${listing.owner?.phone}`}
                    className="w-full bg-teal-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {listing.owner?.phone || "0972 454 ***"}
                  </a>
                ) : (
                  <button 
                    onClick={() => setShowPhoneNumber(true)}
                    className="w-full bg-teal-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {listing.owner?.phone?.slice(0, 8) || "0972 454"} *** - Hiện số
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">Tương tác</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fav.mutate()}
                    disabled={fav.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">{fav.isPending ? "Đang lưu..." : "Lưu tin"}</span>
                  </button>

                  <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>

                  <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </button>
                </div>

                {!isOwnListing && userId && (
                  <div className="mt-4 pt-4 border-t">
                    {connectionStatus?.connected ? (
                      <div className="space-y-3">
                        {connectionStatus.status === "PENDING" && (
                          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
                            <div className="font-medium">Đang chờ phản hồi</div>
                            <div className="text-yellow-600 mt-1">Yêu cầu kết nối của bạn đang được chủ phòng xem xét</div>
                          </div>
                        )}
                        {connectionStatus.status === "ACCEPTED" && connectionStatus.owner_contact && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="font-medium text-green-800 mb-2">Đã kết nối thành công!</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-gray-700">{connectionStatus.owner_contact.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${connectionStatus.owner_contact.email}`} className="text-blue-600 hover:underline">
                                  {connectionStatus.owner_contact.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${connectionStatus.owner_contact.phone}`} className="text-blue-600 hover:underline">
                                  {connectionStatus.owner_contact.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                        {connectionStatus.status === "REJECTED" && (
                          <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
                            <div className="font-medium">Yêu cầu bị từ chối</div>
                            <div className="text-red-600 mt-1">Chủ phòng đã từ chối yêu cầu kết nối của bạn</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      userId && !isVerified ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                          <div className="font-semibold text-yellow-800 text-sm">Xác thực email để kết nối</div>
                          <button className="btn btn-outline btn-sm w-full" onClick={() => sendVer.mutate()} disabled={sendVer.isPending}>
                            {sendVer.isPending ? 'Đang gửi...' : 'Gửi email xác thực'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowConnectModal(true)}
                          className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Kết nối với chủ phòng
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">Thông tin bổ sung</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã tin:</span>
                    <span className="font-medium">#{id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái xác minh:</span>
                    <span className={`font-medium ${
                      listing.verification_status === 'VERIFIED' ? 'text-green-600' :
                      listing.verification_status === 'PENDING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {listing.verification_status === 'VERIFIED' ? 'Đã xác minh' :
                       listing.verification_status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại tin:</span>
                    <span className="font-medium text-blue-600">Tin thường</span>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Gửi yêu cầu kết nối</h3>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Gửi tin nhắn cho chủ phòng để thể hiện sự quan tâm của bạn. Khi chủ phòng chấp nhận, bạn sẽ nhận được thông tin liên hệ của họ.
            </p>

            <textarea
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder="Xin chào, tôi quan tâm đến phòng trọ này..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {connectMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa tin</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteListingMutation.mutate()}
                disabled={deleteListingMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteListingMutation.isPending ? "Đang xóa..." : "Xóa tin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
