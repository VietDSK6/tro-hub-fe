import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { matchRooms } from "@/api/matching";
import { useToastContext } from "@/contexts/ToastContext";
import { useEffect, useRef } from "react";
import ListingCard from "@/components/layout/ListingCard";

export default function Matching(){
  const navigate = useNavigate();
  const { error: showError } = useToastContext();
  const toastShownRef = useRef(false);
  
  const { data, isLoading, error, isError } = useQuery({ 
    queryKey:["matching"], 
    queryFn: ()=> matchRooms(20),
    retry: false
  });

  useEffect(() => {
    if (data) {
      console.log("Matching data:", data);
    }
  }, [data]);

  useEffect(() => {
    if (isError && error && !toastShownRef.current) {
      const err = error as any;
      console.error("Matching error:", err);
      if (err?.response?.status === 400 || err?.status === 400) {
        showError("Vui lòng hoàn thiện hồ sơ của bạn để sử dụng tính năng gợi ý!");
        toastShownRef.current = true;
      }
    }
  }, [isError, error, showError]);
  
  return (
    <div className="container-app p-4 space-y-4">
      <div>
        <h1 className="h1 mb-2">Gợi ý phòng trọ phù hợp</h1>
        <p className="text-sm text-gray-600">Những phòng trọ phù hợp với ngân sách và vị trí của bạn</p>
      </div>
      
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-600">Đang tìm kiếm phòng trọ phù hợp...</p>
        </div>
      )}
      
      {isError && (
        <div className="card p-8 text-center space-y-4">
          <div className="text-red-600">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold">Chưa thể sử dụng tính năng này</p>
            <p className="text-sm mt-2 text-gray-600">
              Bạn cần hoàn thiện hồ sơ cá nhân (ngân sách và vị trí) để chúng tôi có thể tìm phòng trọ phù hợp!
            </p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="btn-primary px-6 py-2 rounded-lg mx-auto"
          >
            Đi đến Hồ sơ của tôi
          </button>
        </div>
      )}
      
      {!isLoading && !isError && data?.items?.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          <p>Chưa tìm thấy phòng trọ phù hợp</p>
          <p className="text-sm mt-2">Hiện tại chưa có phòng trọ nào phù hợp với ngân sách và vị trí của bạn. Hãy thử điều chỉnh hồ sơ hoặc quay lại sau!</p>
        </div>
      )}
      
      {!isLoading && !isError && data?.items && data.items.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Tìm thấy {data.items.length} phòng trọ phù hợp</p>
                <p className="text-sm text-blue-700 mt-1">
                  Các phòng trọ được sắp xếp theo độ phù hợp với ngân sách và vị trí của bạn
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((match: any) => {
              if (!match?.listing?._id) {
                console.warn("Invalid match item:", match);
                return null;
              }
              
              return (
                <div key={match.listing._id} className="relative">
                  <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {((match.score || 0) * 100).toFixed(0)}% phù hợp
                  </div>
                  
                  <ListingCard listing={match.listing} />
                  
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phù hợp giá:</span>
                      <span className="font-medium text-green-600">{((match.price_match || 0) * 100).toFixed(0)}%</span>
                    </div>
                    {match.distance_km != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Khoảng cách:</span>
                        <span className="font-medium">{match.distance_km.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

