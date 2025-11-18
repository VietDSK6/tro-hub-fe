import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { matchRoommates } from "@/api/matching";
import { useToastContext } from "@/contexts/ToastContext";
import { useEffect, useRef } from "react";

export default function Matching(){
  const navigate = useNavigate();
  const { error: showError } = useToastContext();
  const toastShownRef = useRef(false);
  
  const { data, isLoading, error, isError } = useQuery({ 
    queryKey:["matching"], 
    queryFn: ()=> matchRoommates(10),
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
    <div className="container-app p-4 space-y-4">
      <div>
        <h1 className="h1 mb-2">Gợi ý bạn ở ghép</h1>
        <p className="text-sm text-gray-600">Những người có thói quen và ngân sách phù hợp với bạn</p>
      </div>
      
      {isLoading && <div className="text-sm text-gray-500">Đang tìm kiếm...</div>}
      
      {isError && (
        <div className="card p-8 text-center space-y-4">
          <div className="text-red-600">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold">Chưa thể sử dụng tính năng này</p>
            <p className="text-sm mt-2 text-gray-600">
              Bạn cần hoàn thiện hồ sơ cá nhân để chúng tôi có thể tìm những người phù hợp với bạn!
            </p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="btn-primary px-6 py-2 rounded-lg mx-auto"
          >
            Đi đến Hồ sờg          </button>
        </div>
      )}
      
      {!isLoading && !isError && data?.items?.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          <p>Chưa tìm thấy người phù hợp</p>
          <p className="text-sm mt-2">Hãy cập nhật hồ sơ để có gợi ý tốt hơn!</p>
        </div>
      )}
      
      {!isLoading && !isError && data?.items && data.items.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.items.map((x:any)=>(
            <div key={x.profile._id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="font-semibold text-lg mb-2">{x.profile.user_id}</div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Độ phù hợp:</span>
                  <span className="font-medium text-green-600">{(x.score * 100).toFixed(0)}%</span>
                </div>
                
                {x.distance_km != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khoảng cách:</span>
                    <span className="font-medium">{x.distance_km.toFixed(1)} km</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân sách:</span>
                  <span className="font-medium">{x.profile.budget?.toLocaleString('vi-VN')} đ</span>
                </div>
                
                {x.profile.bio && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-600 line-clamp-2">{x.profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
