import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meProfile, upsertMeProfile } from "@/api/profiles";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MapPicker from "@/components/map/MapPicker";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useToastContext } from "@/contexts/ToastContext";

const schema = z.object({
  bio: z.string().min(10, "Giới thiệu phải có ít nhất 10 ký tự"),
  budget: z.coerce.number().min(0, "Ngân sách phải lớn hơn 0"),
  gender: z.string().optional(),
  age: z.string().optional(),
  smoke: z.boolean().optional(),
  pet: z.boolean().optional(),
  cook: z.boolean().optional(),
  sleepTime: z.string().optional(),
  lng: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Profile(){
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey:["me"], queryFn: meProfile });
  const { register, handleSubmit, setValue, formState:{errors}, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [point, setPoint] = useState<[number,number]|null>(null);
  const { success, error } = useToastContext();

  useEffect(()=>{
    if (!data || data.exists === false) return;
    
    reset({ 
      bio: data.bio || "", 
      budget: data.budget || 0,
      gender: data.gender || "",
      age: data.age ? String(data.age) : "",
      smoke: data.habits?.smoke || false,
      pet: data.habits?.pet || false,
      cook: data.habits?.cook || false,
      sleepTime: data.habits?.sleepTime || "",
    });
    
    const c = data?.location?.coordinates;
    if (c && c.length === 2) { 
      setPoint([c[0], c[1]]); 
      setValue("lng", c[0]); 
      setValue("lat", c[1]); 
    }
  }, [data]);

  const up = useMutation({
    mutationFn: (d:FormData)=> {
      const payload: any = {
        bio: d.bio, 
        budget: d.budget,
        habits: {
          smoke: d.smoke || false,
          pet: d.pet || false,
          cook: d.cook || false,
          sleepTime: d.sleepTime || "flexible",
        },
      };
      
      // Only add optional fields if they have values
      if (d.gender && d.gender !== "") payload.gender = d.gender;
      if (d.age && d.age !== "") {
        const ageNum = parseInt(d.age);
        if (!isNaN(ageNum) && ageNum >= 18 && ageNum <= 100) {
          payload.age = ageNum;
        }
      }
      if (d.lng != null && d.lat != null) {
        payload.location = { type: "Point", coordinates: [d.lng, d.lat] };
      }
      
      return upsertMeProfile(payload);
    },
    onSuccess: ()=> {
      qc.invalidateQueries({ queryKey:["me"] });
      success("Cập nhật hồ sơ thành công!");
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Cập nhật thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const onPick = (lng:number, lat:number)=>{ 
    setPoint([lng,lat]); 
    setValue("lng", lng); 
    setValue("lat", lat); 
  };

  if (isLoading) {
    return (
      <div className="container-app p-4 max-w-2xl">
        <div className="text-center py-8">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container-app p-4 max-w-2xl space-y-4">
      <h1 className="h1">Hồ sơ của tôi</h1>
      
      <form className="card p-4 space-y-4" onSubmit={handleSubmit((d)=>up.mutate(d))}>
        {/* Bio */}
        <div>
          <label className="label">Giới thiệu bản thân *</label>
          <textarea 
            className="input w-full h-28" 
            placeholder="Giới thiệu về bản thân, công việc, sở thích..."
            {...register("bio")}
          />
          {errors.bio && <div className="text-xs text-red-600">{errors.bio.message}</div>}
        </div>

        {/* Budget */}
        <div>
          <label className="label">Ngân sách tối đa (VNĐ) *</label>
          <input 
            className="input w-full" 
            type="number" 
            step="100000" 
            placeholder="3000000"
            {...register("budget")}
          />
          {errors.budget && <div className="text-xs text-red-600">{errors.budget.message}</div>}
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Giới tính</label>
            <select className="input w-full" {...register("gender")}>
              <option value="">-- Chọn --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.gender && <div className="text-xs text-red-600">{errors.gender.message}</div>}
          </div>

          <div>
            <label className="label">Tuổi</label>
            <input 
              className="input w-full" 
              type="number" 
              placeholder="25"
              {...register("age")}
            />
            {errors.age && <div className="text-xs text-red-600">{errors.age.message}</div>}
          </div>
        </div>

        {/* Habits */}
        <div>
          <label className="label mb-3">Thói quen sinh hoạt</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" {...register("smoke")}/>
              <span className="text-sm">Hút thuốc</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" {...register("pet")}/>
              <span className="text-sm">Nuôi thú cưng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" {...register("cook")}/>
              <span className="text-sm">Nấu ăn tại phòng</span>
            </label>
          </div>
        </div>

        {/* Sleep Time */}
        <div>
          <label className="label">Thời gian ngủ</label>
          <select className="input w-full" {...register("sleepTime")}>
            <option value="">-- Chọn --</option>
            <option value="early">Ngủ sớm (trước 22h)</option>
            <option value="late">Ngủ muộn (sau 23h)</option>
            <option value="flexible">Linh hoạt</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="label">Vị trí mong muốn</label>
          <p className="text-xs text-gray-500 mb-2">Chọn vị trí trên bản đồ</p>
          <MapPicker value={point} onChange={onPick}/>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button 
            className="btn btn-primary w-full" 
            type="submit"
            disabled={up.isPending}
          >
            {up.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
          </button>
        </div>
      </form>
    </div>
  );
}
