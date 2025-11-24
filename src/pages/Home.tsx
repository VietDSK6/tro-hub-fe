import { useQuery } from "@tanstack/react-query";
import { listListings } from "@/api/listings";
import ListingCard from "@/components/layout/ListingCard";

export default function Home(){
  const { data, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: ()=> listListings({ limit: 50 })
  });

  return (
    <div className="container-app p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="h1">Tất cả phòng trọ</h1>
        <p className="text-gray-600">{data?.total ?? 0} phòng trọ có sẵn</p>
      </div>

      {isLoading && <div className="text-sm text-gray-500">Đang tải…</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items?.map((l:any)=> <ListingCard key={l._id} listing={l}/>)}
      </div>
    </div>
  );
}
