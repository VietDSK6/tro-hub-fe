import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "@/api/favorites";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import { AxiosError } from "axios";

export default function Favorites(){
  const qc = useQueryClient();
  const { toasts, success, error, removeToast } = useToast();
  
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
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
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
              <div className="font-medium">{f.listing_id}</div>
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
