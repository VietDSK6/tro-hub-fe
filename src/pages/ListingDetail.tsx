import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListing, deleteListing } from "@/api/listings";
import { addFavorite } from "@/api/favorites";
import { checkConnection, createConnection, getConnectionsByListing, updateConnectionStatus } from "@/api/connections";
import { createReport } from "@/api/reports";
import { meProfile } from "@/api/profiles";
import { apiSendVerification } from "@/api/auth";
import { useToastContext } from "@/contexts/ToastContext";
import { useAddress } from "@/hooks/useAddress";
import { AxiosError } from "axios";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Building, Edit, Trash2, User, Users, MessageCircle, Phone, Heart, Share2, AlertTriangle, UserPlus, Mail, X, CheckCircle2, Loader2 } from "lucide-react";
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

function AddressDisplay({ address, coordinates }: { address?: string; coordinates?: [number, number] }) {
  const { address: fetchedAddress, isLoading } = useAddress(address ? null : coordinates);
  const displayAddress = address || fetchedAddress;
  
  return (
    <div className="flex items-center gap-2 text-gray-600 mb-4">
      <MapPin className="w-5 h-5 flex-shrink-0" />
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <span className="text-sm">{displayAddress || "Chưa có địa chỉ"}</span>
      )}
    </div>
  );
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
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

  const reportMutation = useMutation({
    mutationFn: () => createReport(id, reportReason),
    onSuccess: () => {
      success("Đã gửi báo cáo. Cảm ơn bạn đã phản hồi!");
      setShowReportModal(false);
      setReportReason("");
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Gửi báo cáo thất bại";
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
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-6 h-6" />
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
              
              <AddressDisplay address={listing.address} coordinates={listing.location?.coordinates as [number, number]} />

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
                        <CheckCircle2 className="w-4 h-4" />
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
                        <Building className="w-6 h-6 text-blue-600" />
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
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                      </Link>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
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
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
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
                                  <User className="w-5 h-5 text-gray-400" />
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
                                      <Mail className="w-3 h-3" />
                                      {conn.from_user.email}
                                    </a>
                                    {conn.from_user.phone && (
                                      <a href={`tel:${conn.from_user.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                        <Phone className="w-3 h-3" />
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
                    <User className="w-8 h-8 text-teal-600" />
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
                  <MessageCircle className="w-5 h-5" />
                  Chat qua Zalo
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">Tương tác</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fav.mutate()}
                    disabled={fav.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">{fav.isPending ? "Đang lưu..." : "Lưu tin"}</span>
                  </button>

                  <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>

                  <button 
                    onClick={() => {
                      if (!userId) {
                        error("Vui lòng đăng nhập để báo cáo");
                        return;
                      }
                      if (!isVerified) {
                        error("Bạn cần xác thực email trước khi báo cáo");
                        return;
                      }
                      setShowReportModal(true);
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    title="Báo cáo vi phạm"
                  >
                    <AlertTriangle className="w-5 h-5 text-gray-600 hover:text-red-500" />
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
                                <User className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">{connectionStatus.owner_contact.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-green-600" />
                                <a href={`mailto:${connectionStatus.owner_contact.email}`} className="text-blue-600 hover:underline">
                                  {connectionStatus.owner_contact.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-600" />
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
                          <UserPlus className="w-5 h-5" />
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
                <X className="w-6 h-6" />
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
                <X className="w-6 h-6" />
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

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Báo cáo tin đăng
              </h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Vui lòng cho chúng tôi biết lý do bạn báo cáo tin đăng này. Báo cáo sẽ được admin xem xét.
            </p>

            <div className="space-y-3 mb-4">
              {["Thông tin sai sự thật", "Nội dung không phù hợp", "Lừa đảo / Scam", "Tin trùng lặp", "Khác"].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {reportReason === "Khác" && (
              <textarea
                value={reportReason === "Khác" ? "" : reportReason}
                onChange={(e) => setReportReason(e.target.value || "Khác")}
                placeholder="Mô tả chi tiết lý do..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => reportMutation.mutate()}
                disabled={reportMutation.isPending || !reportReason}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {reportMutation.isPending ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
