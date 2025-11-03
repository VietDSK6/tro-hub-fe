import { useMutation } from "@tanstack/react-query";
import { apiLogin, apiRegister } from "@/api/auth";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Auth(){
  const [params] = useSearchParams();
  const from = params.get("from") || "/";

  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const login = useMutation({ mutationFn: apiLogin, onSuccess: (res)=>{
    localStorage.setItem("userId", res._id); location.href = from;
  }});
  const registerM = useMutation({ mutationFn: apiRegister, onSuccess: (res)=>{
    localStorage.setItem("userId", res._id); location.href = "/";
  }});

  const onSubmit = (data:FormData)=> login.mutate(data);
  const onRegister = (data:FormData)=> registerM.mutate(data);

  return (
    <div className="container-app p-4 max-w-md">
      <h1 className="h1 mb-4">Đăng nhập / Đăng ký</h1>
      <form className="card p-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="label">Email</div>
          <input className="input" placeholder="email@domain.com" {...register("email")}/>
          {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email.message}</div>}
        </div>
        <div>
          <div className="label">Mật khẩu</div>
          <input className="input" type="password" placeholder="••••••" {...register("password")}/>
          {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password.message}</div>}
        </div>
        <div>
          <div className="label">Tên (tuỳ chọn)</div>
          <input className="input" placeholder="Tên hiển thị" {...register("name")}/>
        </div>
        <div className="flex gap-2 pt-2">
          <button className="btn btn-primary" type="submit" disabled={login.isPending}>Đăng nhập</button>
          <button className="btn" type="button" onClick={handleSubmit(onRegister)} disabled={registerM.isPending}>Đăng ký mới</button>
        </div>
      </form>
    </div>
  );
}
