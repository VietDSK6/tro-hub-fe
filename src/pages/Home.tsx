import { useQuery } from "@tanstack/react-query";
import { listListings } from "@/api/listings";
import { useState } from "react";
import ListingCard from "@/components/layout/ListingCard";

export default function Home(){
  const [q,setQ]=useState(""); const [lng,setLng]=useState<string>(""); const [lat,setLat]=useState<string>(""); const [radius,setRadius]=useState<string>("5");
  const { data, isLoading } = useQuery({
    queryKey: ["listings", q, lng, lat, radius],
    queryFn: ()=> listListings({
      q: q || undefined,
      lng: lng? Number(lng): undefined,
      lat: lat? Number(lat): undefined,
      radius_km: radius? Number(radius): undefined,
      limit: 20
    })
  });

  return (
    <div className="container-app p-4 space-y-4">
      <div className="card p-4 grid md:grid-cols-5 gap-2">
        <input className="input" placeholder="Từ khoá" value={q} onChange={e=>setQ(e.target.value)}/>
        <input className="input" placeholder="Lng" value={lng} onChange={e=>setLng(e.target.value)}/>
        <input className="input" placeholder="Lat" value={lat} onChange={e=>setLat(e.target.value)}/>
        <input className="input" placeholder="Bán kính (km)" value={radius} onChange={e=>setRadius(e.target.value)}/>
        <div className="flex items-center text-sm text-gray-600">{data?.total ?? 0} kết quả</div>
      </div>

      {isLoading && <div className="text-sm text-gray-500">Đang tải…</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.items?.map((l:any)=> <ListingCard key={l._id} listing={l}/>)}
      </div>
    </div>
  );
}
