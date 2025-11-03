import { useQuery } from "@tanstack/react-query";
import { matchRoommates } from "@/api/matching";

export default function Matching(){
  const { data, isLoading } = useQuery({ queryKey:["matching"], queryFn: ()=> matchRoommates(10) });
  return (
    <div className="container-app p-4">
      <h1 className="h1 mb-3">Gợi ý bạn ở ghép</h1>
      {isLoading && "Đang tính…"}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.items?.map((x:any)=>(
          <div key={x.profile._id} className="card p-3">
            <div className="font-semibold">{x.profile.user_id}</div>
            <div className="text-sm text-gray-600">Score: {x.score}</div>
            <div className="text-sm text-gray-600">Distance: {x.distance_km ?? "—"} km</div>
            <div className="text-sm text-gray-600">Budget: {x.profile.budget}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
