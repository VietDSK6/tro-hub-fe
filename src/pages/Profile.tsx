import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meProfile, upsertMeProfile } from "@/api/profiles";
import { apiSendVerification } from "@/api/auth";
import { uploadImages } from "@/api/upload";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MapPicker from "@/components/map/MapPicker";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useToastContext } from "@/contexts/ToastContext";
import { User, Camera } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
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
  const [avatar, setAvatar] = useState<string>("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { success, error } = useToastContext();

  const sendVer = useMutation({
    mutationFn: () => apiSendVerification(),
    onSuccess: (res) => {
      if (res?.sent) success(res.message || "Đã gửi email xác thực");
      else success(res.message || "Tài khoản đã xác thực");
    },
    onError: (e: any) => {
      error("Không thể gửi email xác thực. Vui lòng thử lại.");
    }
  });

  useEffect(()=>{
    if (!data) return;
    
    reset({ 
      full_name: data.full_name || "",
      email: data.email || "",
      bio: data.bio || "", 
      budget: data.budget || 0,
      gender: data.gender || "",
      age: data.age ? String(data.age) : "",
      smoke: data.habits?.smoke || false,
      pet: data.habits?.pet || false,
      cook: data.habits?.cook || false,
      sleepTime: data.habits?.sleepTime || "",
    });
    
    if (data.avatar) setAvatar(data.avatar);
    
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
        avatar: avatar || null,
        habits: {
          smoke: d.smoke || false,
          pet: d.pet || false,
          cook: d.cook || false,
          sleepTime: d.sleepTime || "flexible",
        },
      };
      
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      error("Ảnh quá lớn. Tối đa 5MB");
      return;
    }
    
    setAvatarUploading(true);
    try {
      const result = await uploadImages([file]);
      if (result.urls.length > 0) {
        setAvatar(result.urls[0]);
        success("Đã tải ảnh đại diện");
      }
    } catch (err: any) {
      error(err.response?.data?.detail || "Tải ảnh thất bại");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="container-app p-4 max-w-2xl">
        <div className="text-center py-8">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container-app p-4 max-w-7xl space-y-4">
      <h1 className="h1">Hồ sơ của tôi</h1>
      
      <div className="card p-6 space-y-4">
        <h2 className="h2">Thông tin tài khoản</h2>
        
        <div className="flex items-center gap-6 pb-4 border-b">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
                className="hidden"
              />
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>
          <div>
            <p className="font-medium text-gray-900">{data?.full_name || "Chưa cập nhật"}</p>
            <p className="text-sm text-gray-500">{data?.email}</p>
            {avatarUploading && <p className="text-xs text-blue-600 mt-1">Đang tải ảnh...</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Họ tên</label>
            <input 
              {...register("full_name")}
              className="input w-full" 
            />
            {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input 
              {...register("email")}
              className="input w-full" 
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input 
              className="input w-full bg-gray-50" 
              value={data?.phone || ""} 
              disabled
            />
          </div>
          <div>
            <label className="label">Xác thực email</label>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm ${data?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {data?.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
              </div>
              {!data?.is_verified && (
                <button type="button" className="btn btn-outline btn-sm" onClick={()=>sendVer.mutate()} disabled={sendVer.isPending}>
                  {sendVer.isPending ? 'Đang gửi...' : 'Gửi email xác thực'}
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="label">Vai trò</label>
            <input 
              className="input w-full bg-gray-50" 
              value={data?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"} 
              disabled
            />
          </div>
        </div>
      </div>
      
      <form className="card p-6 space-y-4" onSubmit={handleSubmit((d)=>up.mutate(d))}>
        <h2 className="h2">Thông tin cá nhân</h2>
        
        <div>
          <label className="label">Giới thiệu bản thân *</label>
          <textarea 
            className="input w-full h-28" 
            placeholder="Giới thiệu về bản thân, công việc, sở thích..."
            {...register("bio")}
          />
          {errors.bio && <div className="text-xs text-red-600">{errors.bio.message}</div>}
        </div>

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

        <div>
          <label className="label">Thời gian ngủ</label>
          <select className="input w-full" {...register("sleepTime")}>
            <option value="">-- Chọn --</option>
            <option value="early">Ngủ sớm (trước 22h)</option>
            <option value="late">Ngủ muộn (sau 23h)</option>
            <option value="flexible">Linh hoạt</option>
          </select>
        </div>

        <div>
          <label className="label">Vị trí mong muốn</label>
          <p className="text-xs text-gray-500 mb-3">Chọn khu vực bạn muốn tìm phòng trọ</p>
          <MapPicker 
            value={point} 
            onChange={onPick}
            height="350px"
            label="Vị trí mong muốn"
          />
        </div>

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
