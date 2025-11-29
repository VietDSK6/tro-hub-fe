import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { matchRooms } from "@/api/matching";
import { useToastContext } from "@/contexts/ToastContext";
import { useEffect, useRef } from "react";
import { AlertTriangle, Info, MapPin, Sparkles, Target } from "lucide-react";

interface MatchItem {
  listing: {
    _id: string;
    title: string;
    desc?: string;
    price?: number;
    images?: string[];
    address?: string;
  };
  score: number;
  price_match: number;
  distance_km?: number;
}

export default function Matching() {
  const navigate = useNavigate();
  const { error: showError } = useToastContext();
  const toastShownRef = useRef(false);
  
  const { data, isLoading, error, isError } = useQuery({ 
    queryKey: ["matching"], 
    queryFn: () => matchRooms(20),
    retry: false
  });

  useEffect(() => {
    if (isError && error && !toastShownRef.current) {
      const err = error as any;
      if (err?.response?.status === 400 || err?.status === 400) {
        showError("Vui lòng hoàn thiện hồ sơ của bạn để sử dụng tính năng gợi ý!");
        toastShownRef.current = true;
      }
    }
  }, [isError, error, showError]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app px-8 py-6">
        <h1 className="text-2xl font-bold mb-2">Gợi ý phòng trọ phù hợp</h1>
        <p className="text-gray-600 mb-6">
          Những phòng trọ phù hợp với ngân sách và vị trí của bạn
        </p>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm phòng trọ phù hợp...</p>
          </div>
        )}
        
        {isError && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-800 font-medium">Chưa thể sử dụng tính năng này</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Bạn cần hoàn thiện hồ sơ cá nhân (ngân sách và vị trí) để chúng tôi có thể tìm phòng trọ phù hợp!
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-primary mt-4"
            >
              Đi đến Hồ sơ của tôi
            </button>
          </div>
        )}
        
        {!isLoading && !isError && data?.items?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div><p className="text-gray-600 font-medium">Chưa tìm thấy phòng trọ phù hợp</p>
            <p className="text-sm text-gray-500 mt-1">Hãy thử điều chỉnh hồ sơ hoặc quay lại sau!</p>
            <Link to="/listings" className="btn btn-primary mt-4 inline-block">
              Xem tất cả phòng trọ
            </Link>
          </div>
        )}
        
        {!isLoading && !isError && data?.items && data.items.length > 0 && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Tìm thấy {data.items.length} phòng trọ phù hợp</div>
                <div className="text-sm text-gray-600">
                  Các phòng trọ được sắp xếp theo độ phù hợp với ngân sách và vị trí của bạn
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((match: MatchItem) => {
                if (!match?.listing?._id) return null;
                
                const listing = match.listing;
                const firstImage = listing.images?.[0];
                const scorePercent = ((match.score || 0) * 100).toFixed(0);
                const pricePercent = ((match.price_match || 0) * 100).toFixed(0);
                
                return (
                  <Link 
                    key={listing._id} 
                    to={`/listings/${listing._id}`}
                    className="card p-0 overflow-hidden hover:shadow-md transition relative group"
                  >
                    <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {scorePercent}%
                    </div>
                    
                    <div className="w-full h-40 overflow-hidden bg-gray-100 relative">
                      {firstImage ? (
                        <img 
                          src={firstImage} 
                          alt={listing.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Không có ảnh
                        </div>
                      )}<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <div className="text-white text-xs space-y-1 w-full">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              Phù hợp giá
                            </span>
                            <span className="font-bold">{pricePercent}%</span>
                          </div>
                          {match.distance_km != null && (
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Khoảng cách
                              </span>
                              <span className="font-bold">{match.distance_km.toFixed(1)} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold line-clamp-1">{listing.title}</div>
                        <span className="badge flex-shrink-0 ml-2">
                          {(listing.price ?? 0).toLocaleString()} đ
                        </span>
                      </div>
                      {listing.address && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{listing.address}</span>
                        </div>
                      )}
                      {listing.desc && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.desc}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}