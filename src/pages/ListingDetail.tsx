import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListing } from "@/api/listings";
import { listReviews, summaryReviews, createReview } from "@/api/reviews";
import { addFavorite } from "@/api/favorites";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  content: z.string().min(1),
  security: z.coerce.number().min(1).max(5),
  cleanliness: z.coerce.number().min(1).max(5),
  utilities: z.coerce.number().min(1).max(5),
  landlordAttitude: z.coerce.number().min(1).max(5),
});

export default function ListingDetail(){
  const { id="" } = useParams();
  const qc = useQueryClient();
  const { data: listing } = useQuery({ queryKey:["listing", id], queryFn: ()=> getListing(id) });
  const reviews = useQuery({ queryKey:["reviews", id], queryFn: ()=> listReviews({ listing_id:id, page:1, limit:20 }) });
  const summary = useQuery({ queryKey:["summary", id], queryFn: ()=> summaryReviews(id) });

  const fav = useMutation({ mutationFn: ()=> addFavorite(id), onSuccess: ()=> alert("Đã lưu tin") });

  const { register, handleSubmit, formState:{errors}, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { security:4, cleanliness:4, utilities:4, landlordAttitude:4, content:"" }
  });
  const create = useMutation({
    mutationFn: (d:any)=> createReview({ listing_id:id, scores:{ security:d.security, cleanliness:d.cleanliness, utilities:d.utilities, landlordAttitude:d.landlordAttitude }, content:d.content }),
    onSuccess: ()=> { reset(); qc.invalidateQueries({ queryKey:["reviews", id] }); qc.invalidateQueries({ queryKey:["summary", id] }); }
  });

  if (!listing) return <div className="p-4">Loading…</div>;

  return (
    <div className="container-app p-4 space-y-4">
      <div className="card p-4 flex justify-between items-start">
        <div>
          <div className="h1">{listing.title}</div>
          <div className="text-gray-600">{listing.desc}</div>
        </div>
        <button className="btn btn-primary" onClick={()=>fav.mutate()}>Lưu tin</button>
      </div>

      <form className="card p-4 space-y-2" onSubmit={handleSubmit((d)=>create.mutate(d))}>
        <div className="h2 mb-2">Viết đánh giá</div>
        {["security","cleanliness","utilities","landlordAttitude"].map((k)=>(
          <label key={k} className="flex items-center gap-3">
            <span className="w-40 capitalize">{k}</span>
            <input className="input" type="number" min={1} max={5} step={0.5} {...register(k as any)}/>
            {errors[k as keyof typeof errors] && <span className="text-xs text-red-600">{String((errors as any)[k]?.message || "")}</span>}
          </label>
        ))}
        <textarea className="input h-24" placeholder="Chia sẻ trải nghiệm..." {...register("content")}/>
        {errors.content && <div className="text-xs text-red-600">{String(errors.content.message)}</div>}
        <button className="btn btn-primary mt-2" type="submit">Gửi đánh giá</button>
      </form>

      <div className="card p-4">
        <div className="h2 mb-2">Tổng kết điểm: {summary.data?.overall ?? "—"}</div>
        <ul className="grid md:grid-cols-2 gap-1">
          {summary.data?.metrics?.map((m:any)=> <li key={m.metric} className="flex justify-between"><span>{m.metric}</span><span className="font-medium">{m.avg} ({m.count})</span></li>)}
        </ul>
      </div>

      <div className="card p-4">
        <div className="h2 mb-2">Đánh giá gần đây</div>
        <ul className="space-y-2">
          {reviews.data?.items?.map((r:any)=>(<li key={r._id} className="border rounded-xl p-2">{r.content}</li>))}
        </ul>
      </div>
    </div>
  );
}
