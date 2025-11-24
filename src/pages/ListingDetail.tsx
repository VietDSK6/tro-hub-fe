import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListing } from "@/api/listings";
import { listReviews, summaryReviews, createReview } from "@/api/reviews";
import { addFavorite } from "@/api/favorites";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastContext } from "@/contexts/ToastContext";
import { AxiosError } from "axios";

const schema = z.object({
  content: z.string().min(10, "Nội dung đánh giá phải có ít nhất 10 ký tự"),
  security: z.coerce.number().min(1, "Điểm tối thiểu là 1").max(5, "Điểm tối đa là 5"),
  cleanliness: z.coerce.number().min(1, "Điểm tối thiểu là 1").max(5, "Điểm tối đa là 5"),
  utilities: z.coerce.number().min(1, "Điểm tối thiểu là 1").max(5, "Điểm tối đa là 5"),
  landlordAttitude: z.coerce.number().min(1, "Điểm tối thiểu là 1").max(5, "Điểm tối đa là 5"),
});

const metricLabels: Record<string, string> = {
  security: "An ninh",
  cleanliness: "Vệ sinh",
  utilities: "Tiện ích",
  landlordAttitude: "Thái độ chủ nhà"
};

export default function ListingDetail(){
  const { id="" } = useParams();
  const qc = useQueryClient();
  const { success, error } = useToastContext();
  
  const { data: listing } = useQuery({ queryKey:["listing", id], queryFn: ()=> getListing(id) });
  const reviews = useQuery({ queryKey:["reviews", id], queryFn: ()=> listReviews({ listing_id:id, page:1, limit:20 }) });
  const summary = useQuery({ queryKey:["summary", id], queryFn: ()=> summaryReviews(id) });

  const fav = useMutation({ 
    mutationFn: ()=> addFavorite(id), 
    onSuccess: ()=> success("Đã lưu tin yêu thích!"),
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Lưu tin thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const { register, handleSubmit, formState:{errors}, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { security:4, cleanliness:4, utilities:4, landlordAttitude:4, content:"" }
  });
  
  const create = useMutation({
    mutationFn: (d:any)=> createReview({ 
      listing_id:id, 
      scores:{ 
        security:d.security, 
        cleanliness:d.cleanliness, 
        utilities:d.utilities, 
        landlordAttitude:d.landlordAttitude 
      }, 
      content:d.content 
    }),
    onSuccess: ()=> { 
      reset(); 
      qc.invalidateQueries({ queryKey:["reviews", id] }); 
      qc.invalidateQueries({ queryKey:["summary", id] });
      success("Đánh giá của bạn đã được gửi!");
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Gửi đánh giá thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  if (!listing) return <div className="container-app p-4">Đang tải...</div>;

  return (
    <div className="container-app p-4 space-y-4">
      {listing.images && listing.images.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
            {listing.images.map((img: string, i: number) => (
              <img 
                key={i} 
                src={img} 
                alt={`${listing.title} - ${i + 1}`}
                className="w-full h-48 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="card p-4 flex justify-between items-start">
        <div className="flex-1">
          <div className="h1 mb-2">{listing.title}</div>
          <div className="text-gray-600 mb-3">{listing.desc || "Chưa có mô tả"}</div>
          <div className="text-2xl font-bold text-blue-600">
            {listing.price?.toLocaleString('vi-VN')} đ/tháng
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={()=>fav.mutate()}
          disabled={fav.isPending}
        >
          {fav.isPending ? "Đang lưu..." : "Lưu tin"}
        </button>
      </div>

      <form className="card p-4 space-y-3" onSubmit={handleSubmit((d)=>create.mutate(d))}>
        <div className="h2 mb-2">Viết đánh giá</div>
        <p className="text-sm text-gray-600 mb-3">Đánh giá từ 1-5 sao (có thể dùng 0.5 sao)</p>
        
        {(["security","cleanliness","utilities","landlordAttitude"] as const).map((k)=>(
          <label key={k} className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="w-full md:w-40 text-sm font-medium">{metricLabels[k]}</span>
            <input 
              className="input flex-1" 
              type="number" 
              min={1} 
              max={5} 
              step={0.5}
              placeholder="1-5"
              {...register(k as any)}
            />
            {errors[k as keyof typeof errors] && (
              <span className="text-xs text-red-600">
                {String((errors as any)[k]?.message || "")}
              </span>
            )}
          </label>
        ))}
        
        <div>
          <label className="label">Nội dung đánh giá *</label>
          <textarea 
            className="input w-full h-24" 
            placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..." 
            {...register("content")}
          />
          {errors.content && <div className="text-xs text-red-600 mt-1">{String(errors.content.message)}</div>}
        </div>
        
        <button 
          className="btn btn-primary w-full mt-2" 
          type="submit"
          disabled={create.isPending}
        >
          {create.isPending ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </form>

      <div className="card p-4">
        <div className="h2 mb-3">Tổng kết điểm đánh giá</div>
        <div className="text-3xl font-bold text-blue-600 mb-4">
          {summary.data?.overall ? (
            <>
              {summary.data.overall}
              <span className="text-yellow-500">★</span>
              <span className="text-lg text-gray-600">/5</span>
            </>
          ) : "Chưa có đánh giá"}
        </div>
        <ul className="grid md:grid-cols-2 gap-2">
          {summary.data?.metrics?.map((m:any)=> (
            <li key={m.metric} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-sm">{metricLabels[m.metric] || m.metric}</span>
              <span className="font-medium text-blue-600">
                {m.avg.toFixed(1)}<span className="text-yellow-500">★</span> 
                <span className="text-xs text-gray-500">({m.count} đánh giá)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <div className="h2 mb-3">Đánh giá gần đây ({reviews.data?.total || 0})</div>
        {reviews.data?.items?.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        ) : (
          <ul className="space-y-3">
            {reviews.data?.items?.map((r:any)=>(
              <li key={r._id} className="border rounded-xl p-3 hover:shadow-sm transition-shadow">
                <div className="text-sm text-gray-600 mb-1">
                  Đánh giá bởi: <span className="font-medium">{r.author_id}</span>
                </div>
                <p className="text-gray-800">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
