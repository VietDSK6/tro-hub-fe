import { useMutation } from "@tanstack/react-query";
import { apiRegister } from "@/api/auth";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Register(){
  const { toasts, error, removeToast } = useToast();

  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const registerMutation = useMutation({ 
    mutationFn: apiRegister, 
    onSuccess: (res)=>{
      localStorage.setItem("userId", res._id);
      location.href = "/";
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Đăng ký thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const onSubmit = (data:FormData)=> {
    registerMutation.mutate(data as any);
  };

  return (
    <div className="container-app p-4 max-w-md mx-auto">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <h1 className="h1 mb-4">Đăng ký tài khoản</h1>
      
      <form className="card p-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Email</label>
          <input 
            className="input w-full" 
            placeholder="email@domain.com" 
            {...register("email")}
            autoComplete="email"
          />
          {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email.message}</div>}
        </div>
        
        <div>
          <label className="label">Mật khẩu</label>
          <input 
            className="input w-full" 
            type="password" 
            placeholder="••••••" 
            {...register("password")}
            autoComplete="new-password"
          />
          {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password.message}</div>}
        </div>
        
        <div>
          <label className="label">Tên hiển thị (tuỳ chọn)</label>
          <input 
            className="input w-full" 
            placeholder="Tên của bạn" 
            {...register("name")}
            autoComplete="name"
          />
          {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name.message}</div>}
        </div>
        
        <div className="pt-2">
          <button 
            className="btn btn-primary w-full" 
            type="submit" 
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600 pt-2">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}
