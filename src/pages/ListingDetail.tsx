import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getListing } from "@/api/listings";
import { addFavorite } from "@/api/favorites";
import { useToastContext } from "@/contexts/ToastContext";
import { AxiosError } from "axios";
import { useState } from "react";

export default function ListingDetail(){
  const { id="" } = useParams();
  const { success, error } = useToastContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  
  const { data: listing } = useQuery({ queryKey:["listing", id], queryFn: ()=> getListing(id) });

  const fav = useMutation({ 
    mutationFn: ()=> addFavorite(id), 
    onSuccess: ()=> success("Đã lưu tin yêu thích!"),
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Lưu tin thất bại. Vui lòng thử lại.";
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
            <div className="sticky top-4 space-y-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
