import { useQuery } from "@tanstack/react-query";
import { listListings } from "@/api/listings";
import { useState } from "react";
import ListingCard from "@/components/layout/ListingCard";
import MapPicker from "@/components/map/MapPicker";

export default function Home(){
  const [q,setQ]=useState(""); 
  const [location, setLocation] = useState<[number,number]|null>(null);
  const [radius,setRadius]=useState<string>("5");
  const [showMap, setShowMap] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ["listings", q, location?.[0], location?.[1], radius],
    queryFn: ()=> listListings({
      q: q || undefined,
      lng: location?.[0],
      lat: location?.[1],
      radius_km: radius? Number(radius): undefined,
      limit: 20
    })
  });

  const onPickLocation = (lng: number, lat: number) => {
    setLocation([lng, lat]);
    setShowMap(false);
  };

  const clearLocation = () => {
    setLocation(null);
  };

  return (
    <div className="container-app p-4 space-y-4">
      <div className="card p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-2">
          <input className="input" placeholder="Từ khoá tìm kiếm..." value={q} onChange={e=>setQ(e.target.value)}/>
          <input className="input" placeholder="Bán kính (km)" value={radius} onChange={e=>setRadius(e.target.value)}/>
          <div className="flex items-center text-sm text-gray-600">{data?.total ?? 0} kết quả</div>
        </div>
        
        <div>
          <button 
            type="button"
            className="btn btn-ghost text-sm" 
            onClick={() => setShowMap(!showMap)}
          >
            {location ? "📍 Đã chọn vị trí - Click để thay đổi" : "📍 Chọn vị trí tìm kiếm"}
          </button>
          {location && (
            <button 
              type="button"
              className="btn btn-ghost text-sm ml-2" 
              onClick={clearLocation}
            >
              ✕ Xóa vị trí
            </button>
          )}
        </div>
        
        {showMap && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Chọn vị trí trên bản đồ</p>
            <MapPicker value={location} onChange={onPickLocation}/>
          </div>
        )}
      </div>

      {isLoading && <div className="text-sm text-gray-500">Đang tải…</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.items?.map((l:any)=> <ListingCard key={l._id} listing={l}/>)}
      </div>
    </div>
  );
}
