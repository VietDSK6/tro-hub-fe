import { useMutation } from "@tanstack/react-query";
import { createListing } from "@/api/listings";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MapPicker from "@/components/map/MapPicker";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(4),
  desc: z.string().optional(),
  price: z.coerce.number().min(0),
  lng: z.coerce.number(),
  lat: z.coerce.number()
});
type FormData = z.infer<typeof schema>;

export default function NewListing(){
  const [point, setPoint] = useState<[number,number]|null>(null);
  const { register, handleSubmit, setValue, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const mutation = useMutation({
    mutationFn: (data:FormData) => createListing({
      title: data.title,
      desc: data.desc,
      price: data.price,
      location: { type: "Point", coordinates: [data.lng, data.lat] }
    } as any),
    onSuccess: ()=> { alert("Đã tạo tin"); location.href="/"; }
  });

  const onPick = (lng:number, lat:number)=>{ setPoint([lng,lat]); setValue("lng", lng); setValue("lat", lat); };

  return (
    <div className="container-app p-4 max-w-2xl space-y-3">
      <h1 className="h1">Đăng tin</h1>
      <form className="card p-4 space-y-3" onSubmit={handleSubmit((d)=> mutation.mutate(d))}>
        <div>
          <div className="label">Tiêu đề</div>
          <input className="input" placeholder="Phòng trọ Q3..." {...register("title")}/>
          {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title.message}</div>}
        </div>
        <div>
          <div className="label">Mô tả</div>
          <textarea className="input h-28" placeholder="Chi tiết..." {...register("desc")}/>
        </div>
        <div>
          <div className="label">Giá (đ)</div>
          <input className="input" type="number" step="1000" {...register("price")}/>
          {errors.price && <div className="text-xs text-red-600 mt-1">{errors.price.message}</div>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="label">Lng</div>
            <input className="input" {...register("lng")}/>
            {errors.lng && <div className="text-xs text-red-600 mt-1">{errors.lng.message as any}</div>}
          </div>
          <div>
            <div className="label">Lat</div>
            <input className="input" {...register("lat")}/>
            {errors.lat && <div className="text-xs text-red-600 mt-1">{errors.lat.message as any}</div>}
          </div>
        </div>
        <MapPicker value={point} onChange={onPick}/>
        <div className="pt-2">
          <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>Tạo</button>
        </div>
      </form>
    </div>
  );
}
