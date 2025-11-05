import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "@/api/favorites";
import { useToastContext } from "@/contexts/ToastContext";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";

export default function Favorites(){
  const qc = useQueryClient();
  const { success, error } = useToastContext();
  
  const { data, isLoading } = useQuery({ queryKey:["favorites"], queryFn: ()=> listFavorites() });
  
  const rm = useMutation({
    mutationFn: (id:string)=> removeFavorite(id),
    onSuccess: ()=> {
      qc.invalidateQueries({ queryKey:["favorites"] });
      success("Đã xóa tin khỏi danh sách yêu thích!");
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Xóa tin thất bại. Vui lòng thử lại.";
      error(message);
    }
  });
  
  return (
    <div className="container-app p-4">
      <h1 className="h1 mb-3">Tin đã lưu</h1>
      
      {isLoading && <div className="text-sm text-gray-500">Đang tải...</div>}
      
      {!isLoading && data?.items?.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          <p>Bạn chưa lưu tin nào</p>
          <p className="text-sm mt-2">Hãy lưu những tin yêu thích để xem sau!</p>
        </div>
      )}
      
      <ul className="space-y-2">
        {data?.items?.map((f:any)=> (
          <li key={f._id} className="card p-3 flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{f.listing.title}</div>
            </div>
            <button 
              className="btn btn-ghost text-red-600" 
              onClick={()=>rm.mutate(f.listing_id)}
              disabled={rm.isPending}
            >
              {rm.isPending ? "Đang xóa..." : "✕ Xóa"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
