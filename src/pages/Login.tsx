import { useMutation } from "@tanstack/react-query";
import { apiLogin } from "@/api/auth";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useToastContext } from "@/contexts/ToastContext";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
type FormData = z.infer<typeof schema>;

export default function Login(){
  const [params] = useSearchParams();
  const from = params.get("from") || "/";
  const { error } = useToastContext();

  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const login = useMutation({ 
    mutationFn: apiLogin, 
    onSuccess: (res)=>{
      localStorage.setItem("userId", res._id);
      location.href = from;
    },
    onError: (err: AxiosError<{detail?: string}>) => {
      const message = err.response?.data?.detail || "Đăng nhập thất bại. Vui lòng thử lại.";
      error(message);
    }
  });

  const onSubmit = (data:FormData)=> {
    login.mutate(data as any);
  };

  return (
    <div className="container-app p-4 max-w-md mx-auto">
      <h1 className="h1 mb-4">Đăng nhập</h1>
      
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
            autoComplete="current-password"
          />
          {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password.message}</div>}
        </div>
        
        <div className="pt-2">
          <button 
            className="btn btn-primary w-full" 
            type="submit" 
            disabled={login.isPending}
          >
            {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600 pt-2">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
        </div>
      </form>
    </div>
  );
}
