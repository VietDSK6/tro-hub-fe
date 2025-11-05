import { useQuery } from "@tanstack/react-query";
import { matchRoommates } from "@/api/matching";

export default function Matching(){
  const { data, isLoading } = useQuery({ queryKey:["matching"], queryFn: ()=> matchRoommates(10) });
  
  return (
    <div className="container-app p-4 space-y-4">
      <div>
        <h1 className="h1 mb-2">Gợi ý bạn ở ghép</h1>
        <p className="text-sm text-gray-600">Những người có thói quen và ngân sách phù hợp với bạn</p>
      </div>
      
      {isLoading && <div className="text-sm text-gray-500">Đang tìm kiếm...</div>}
      
      {!isLoading && data?.items?.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          <p>Chưa tìm thấy người phù hợp</p>
          <p className="text-sm mt-2">Hãy cập nhật hồ sơ để có gợi ý tốt hơn!</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.items?.map((x:any)=>(
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
    </div>
  );
}
