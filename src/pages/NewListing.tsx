import { useMutation, useQuery } from "@tanstack/react-query";
import { createListing } from "@/api/listings";
import { meProfile } from "@/api/profiles";
import { apiSendVerification } from "@/api/auth";
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
  area: z.coerce.number().min(0, "Diện tích phải lớn hơn 0"),
  lng: z.coerce.number(),
  lat: z.coerce.number()
});
type FormData = z.infer<typeof schema>;

export default function NewListing(){
  const [point, setPoint] = useState<[number,number]|null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState({
    pet: false,
    smoke: false,
    cook: true,
    visitor: true
  });
  const { success, error } = useToastContext();

  const { data: profile, isLoading: profileLoading } = useQuery({ queryKey: ["me"], queryFn: meProfile });
  const isVerified = profile?.is_verified;

  const sendVer = useMutation({
    mutationFn: () => apiSendVerification(),
    onSuccess: (res) => success(res.message || "Đã gửi email xác thực"),
    onError: () => error("Gửi email thất bại")
  });
  
  const { register, handleSubmit, setValue, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const mutation = useMutation({
    mutationFn: (data:FormData) => createListing({
      title: data.title,
      desc: data.desc,
      price: data.price,
      area: data.area,
      images: images,
      amenities: amenities,
      rules: rules,
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
    <div className="container-app p-4 max-w-7xl space-y-3">
      <h1 className="h1">Đăng tin</h1>
      {profileLoading ? null : !isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold text-yellow-800">Xác thực email để đăng tin</div>
            <div className="text-sm text-yellow-700">Bạn cần xác thực email trước khi đăng tin.</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => sendVer.mutate()} disabled={sendVer.isPending}>
            {sendVer.isPending ? 'Đang gửi...' : 'Gửi email'}
          </button>
        </div>
      )}
      <form className="space-y-3" onSubmit={handleSubmit((d)=> mutation.mutate(d))}>
        <div>
          <label className="label">Vị trí *</label>
          <p className="text-xs text-gray-500 mb-2">Chọn vị trí chính xác trên bản đồ</p>
          <MapPicker value={point} onChange={onPick}>
            <div className="card p-4 space-y-3">
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
                <label className="label">Diện tích (m²) *</label>
                <input className="input w-full" type="number" step="1" placeholder="25" {...register("area")}/>
                {errors.area && <div className="text-xs text-red-600 mt-1">{errors.area.message}</div>}
              </div>

              <div>
                <label className="label">Tiện ích</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={amenities.includes("ac")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, "ac"]);
                        } else {
                          setAmenities(amenities.filter(a => a !== "ac"));
                        }
                      }}
                    />
                    <span className="text-sm">Điều hòa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={amenities.includes("wifi")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, "wifi"]);
                        } else {
                          setAmenities(amenities.filter(a => a !== "wifi"));
                        }
                      }}
                    />
                    <span className="text-sm">Wifi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={amenities.includes("parking")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, "parking"]);
                        } else {
                          setAmenities(amenities.filter(a => a !== "parking"));
                        }
                      }}
                    />
                    <span className="text-sm">Chỗ để xe</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={amenities.includes("water_heater")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, "water_heater"]);
                        } else {
                          setAmenities(amenities.filter(a => a !== "water_heater"));
                        }
                      }}
                    />
                    <span className="text-sm">Nóng lạnh</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={amenities.includes("washing_machine")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, "washing_machine"]);
                        } else {
                          setAmenities(amenities.filter(a => a !== "washing_machine"));
                        }
                      }}
                    />
                    <span className="text-sm">Máy giặt</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={amenities.includes("fridge")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, "fridge"]);
                        } else {
                          setAmenities(amenities.filter(a => a !== "fridge"));
                        }
                      }}
                    />
                    <span className="text-sm">Tủ lạnh</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Quy định</label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={rules.pet}
                      onChange={(e) => setRules({...rules, pet: e.target.checked})}
                    />
                    <span className="text-sm">Cho phép nuôi thú cưng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={rules.smoke}
                      onChange={(e) => setRules({...rules, smoke: e.target.checked})}
                    />
                    <span className="text-sm">Cho phép hút thuốc</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={rules.cook}
                      onChange={(e) => setRules({...rules, cook: e.target.checked})}
                    />
                    <span className="text-sm">Cho phép nấu ăn</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={rules.visitor}
                      onChange={(e) => setRules({...rules, visitor: e.target.checked})}
                    />
                    <span className="text-sm">Cho phép khách thăm</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Hình ảnh</label>
                <ImageUpload value={images} onChange={setImages} maxImages={5} />
              </div>
              {(errors.lng || errors.lat) && <div className="text-xs text-red-600">Vui lòng chọn vị trí trên bản đồ</div>}
            </div>
          </MapPicker>
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
