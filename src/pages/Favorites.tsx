import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "@/api/favorites";

export default function Favorites(){
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey:["favorites"], queryFn: ()=> listFavorites() });
  const rm = useMutation({
    mutationFn: (id:string)=> removeFavorite(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:["favorites"] })
  });
  return (
    <div className="container-app p-4">
      <h1 className="h1 mb-3">Tin đã lưu</h1>
      <ul className="space-y-2">
        {data?.items?.map((f:any)=> (
          <li key={f._id} className="card p-3 flex items-center justify-between">
            <div>{f.listing_id}</div>
            <button className="btn" onClick={()=>rm.mutate(f.listing_id)}>Xoá</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
