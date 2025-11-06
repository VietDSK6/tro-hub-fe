import { useMutation } from "@tanstack/react-query";
import { createListing } from "@/api/listings";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MapPicker from "@/components/map/MapPicker";
import ImageUpload from "@/components/ui/ImageUpload";
import { useState } from "react";
import { useToastContext } from "@/contexts/ToastContext";
import { AxiosError } from "axios";

const schema = z.object({
  title: z.string().min(4, "Tiêu đề phải có ít nhất 4 ký tự"),
  desc: z.string().optional(),
  price: z.coerce.number().min(0, "Giá phải lớn hơn 0"),
  lng: z.coerce.number(),
  lat: z.coerce.number()
});
type FormData = z.infer<typeof schema>;

export default function NewListing(){
  const [point, setPoint] = useState<[number,number]|null>(null);
  const [images, setImages] = useState<string[]>([]);
  const { success, error } = useToastContext();
  
  const { register, handleSubmit, setValue, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const mutation = useMutation({
    mutationFn: (data:FormData) => createListing({
      title: data.title,
      desc: data.desc,
      price: data.price,
      images: images,
      location: { type: "Point", coordinates: [data.lng, data.lat] }
    } as any),
    onSuccess: ()=> { 
      success("Đã tạo tin thành công!"); 
      setTimeout(() => location.href="/", 1500);
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Tạo tin thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const onPick = (lng:number, lat:number)=>{ setPoint([lng,lat]); setValue("lng", lng); setValue("lat", lat); };

  return (
    <div className="container-app p-4 max-w-2xl space-y-3">
      <h1 className="h1">Đăng tin</h1>
      <form className="card p-4 space-y-3" onSubmit={handleSubmit((d)=> mutation.mutate(d))}>
        <div>
          <label className="label">Tiêu đề *</label>
          <input className="input w-full" placeholder="Phòng trọ Quận 3, gần trường..." {...register("title")}/>
          {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title.message}</div>}
        </div>
        <div>
          <label className="label">Mô tả chi tiết</label>
          <textarea className="input w-full h-28" placeholder="Giới thiệu về phòng trọ, tiện ích, quy định..." {...register("desc")}/>
        </div>
        <div>
          <label className="label">Giá thuê (VNĐ/tháng) *</label>
          <input className="input w-full" type="number" step="100000" placeholder="3000000" {...register("price")}/>
          {errors.price && <div className="text-xs text-red-600 mt-1">{errors.price.message}</div>}
        </div>
        <div>
          <label className="label">Hình ảnh</label>
          <ImageUpload value={images} onChange={setImages} maxImages={5} />
        </div>
        <div>
          <label className="label">Vị trí *</label>
          <p className="text-xs text-gray-500 mb-2">Chọn vị trí chính xác trên bản đồ</p>
          <MapPicker value={point} onChange={onPick}/>
          {(errors.lng || errors.lat) && <div className="text-xs text-red-600 mt-1">Vui lòng chọn vị trí trên bản đồ</div>}
        </div>
        <div className="pt-2">
          <button className="btn btn-primary w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang tạo tin..." : "Đăng tin"}
          </button>
        </div>
      </form>
    </div>
  );
}
