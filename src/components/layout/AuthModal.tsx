import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiLogin, apiRegister } from "@/api/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useToastContext } from "@/contexts/ToastContext";
import roomsImage from "@/assets/rooms.png";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 chữ số)"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const { error, success } = useToastContext();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: (res) => {
      localStorage.setItem("userId", res._id);
      localStorage.setItem("userRole", res.role || "USER");
      success("Đăng nhập thành công!");
      onClose();
      window.location.reload();
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      const message = err.response?.data?.detail || "Đăng nhập thất bại. Vui lòng thử lại.";
      error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: apiRegister,
    onSuccess: (res) => {
      localStorage.setItem("userId", res._id);
      localStorage.setItem("userRole", res.role || "USER");
      success("Đăng ký thành công!");
      onClose();
      window.location.reload();
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      const message = err.response?.data?.detail || "Đăng ký thất bại. Vui lòng thử lại.";
      error(message);
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data as any);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data as any);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            <div className="relative hidden md:block">
              <img 
                src={roomsImage} 
                alt="Rooms" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div>
                  <h2 className="text-6xl font-bold text-white mb-2" style={{fontFamily: 'Bowlby, sans-serif'}}>
                    Troj Hub
                  </h2>
                  <p className="text-white/90 text-lg">Tìm phòng trọ dễ dàng, an toàn</p>
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {activeTab === "login" ? "Đăng nhập" : "Đăng ký"}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-2 mb-6 border-b">
                <button
                  className={`pb-2 px-4 font-medium transition ${
                    activeTab === "login"
                      ? "border-b-2 border-gray-900 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Đăng nhập
                </button>
                <button
                  className={`pb-2 px-4 font-medium transition ${
                    activeTab === "register"
                      ? "border-b-2 border-gray-900 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Đăng ký
                </button>
              </div>

              {activeTab === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input w-full"
                      placeholder="email@domain.com"
                      {...loginForm.register("email")}
                      autoComplete="email"
                    />
                    {loginForm.formState.errors.email && (
                      <div className="text-red-600 text-xs mt-1">
                        {loginForm.formState.errors.email.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Mật khẩu</label>
                    <input
                      className="input w-full"
                      type="password"
                      placeholder="••••••"
                      {...loginForm.register("password")}
                      autoComplete="current-password"
                    />
                    {loginForm.formState.errors.password && (
                      <div className="text-red-600 text-xs mt-1">
                        {loginForm.formState.errors.password.message}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div>
                    <label className="label">Họ tên *</label>
                    <input
                      className="input w-full"
                      placeholder="Nguyễn Văn A"
                      {...registerForm.register("name")}
                      autoComplete="name"
                    />
                    {registerForm.formState.errors.name && (
                      <div className="text-red-600 text-xs mt-1">
                        {registerForm.formState.errors.name.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Email *</label>
                    <input
                      className="input w-full"
                      placeholder="email@domain.com"
                      {...registerForm.register("email")}
                      autoComplete="email"
                    />
                    {registerForm.formState.errors.email && (
                      <div className="text-red-600 text-xs mt-1">
                        {registerForm.formState.errors.email.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Số điện thoại *</label>
                    <input
                      className="input w-full"
                      placeholder="0123456789"
                      {...registerForm.register("phone")}
                      autoComplete="tel"
                    />
                    {registerForm.formState.errors.phone && (
                      <div className="text-red-600 text-xs mt-1">
                        {registerForm.formState.errors.phone.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Mật khẩu *</label>
                    <input
                      className="input w-full"
                      type="password"
                      placeholder="••••••"
                      {...registerForm.register("password")}
                      autoComplete="new-password"
                    />
                    {registerForm.formState.errors.password && (
                      <div className="text-red-600 text-xs mt-1">
                        {registerForm.formState.errors.password.message}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
