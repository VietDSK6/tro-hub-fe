import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "@/api/favorites";
import { useToastContext } from "@/contexts/ToastContext";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bookmark } from "lucide-react";
import type { Favorite } from "@/types";

export default function Favorites() {
  const qc = useQueryClient();
  const { success, error } = useToastContext();
  
  const { data, isLoading } = useQuery({ 
    queryKey: ["favorites"], 
    queryFn: () => listFavorites() 
  });
  
  const rm = useMutation({
    mutationFn: (id: string) => removeFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      success("Đã xóa tin khỏi danh sách yêu thích!");
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      const message = err.response?.data?.detail || "Xóa tin thất bại. Vui lòng thử lại.";
      error(message);
    }
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app px-8 py-6">
        <h1 className="text-2xl font-bold mb-2">Tin đã lưu</h1>
        <p className="text-gray-600 mb-6">
          {data?.items?.length ?? 0} tin yêu thích
        </p>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}
        
        {!isLoading && data?.items?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Bạn chưa lưu tin nào</p>
            <p className="text-sm text-gray-500 mt-1">Hãy lưu những tin yêu thích để xem sau!</p>
            <Link to="/listings" className="btn btn-primary mt-4 inline-block">
              Khám phá phòng trọ
            </Link>
          </div>
        )}
        {!isLoading && data?.items && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((f: Favorite) => {
              const listing = f.listing;
              if (!listing) {
                return (
                  <div key={f._id} className="card p-4 bg-gray-100">
                    <p className="text-gray-500 text-center">Tin đã bị xóa</p>
                    <button
                      className="btn btn-ghost text-red-600 w-full mt-2"
                      onClick={() => rm.mutate(f.listing_id)}
                      disabled={rm.isPending}
                    >
                      Xóa khỏi danh sách
                    </button>
                    </div>
                );
              } 
              const firstImage = listing.images?.[0];
              return (
                <div key={f._id} className="card p-0 overflow-hidden hover:shadow-md transition relative group">
                  <Link to={`/listings/${listing._id}`} className="block">
                    <div className="w-full h-40 overflow-hidden bg-gray-100">
                      {firstImage ? (
                        <img 
                          src={firstImage} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold line-clamp-1">{listing.title}</div>
                        <span className="badge flex-shrink-0 ml-2">
                          {(listing.price ?? 0).toLocaleString()} đ
                        </span>
                      </div>
                      {listing.address && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{listing.address}</span>
                        </div>
                      )}
                      {listing.desc && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.desc}</div>
                      )}
                    </div>
                  </Link>
                  
                  <button
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      rm.mutate(f.listing_id);
                    }}
                    disabled={rm.isPending}
                    title="Xóa khỏi yêu thích"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}