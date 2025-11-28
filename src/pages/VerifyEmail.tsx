import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { http } from "@/app/client";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token không hợp lệ");
      return;
    }
    http
      .get(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email đã được xác thực thành công!");
        localStorage.setItem("isVerified", "true");
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Xác thực thất bại");
      });
  }, [token]);

  return (
    <div className="container-app p-8 max-w-md text-center">
      {status === "loading" && <p>Đang xác thực...</p>}
      {status === "success" && (
        <div className="space-y-4">
          <div className="text-green-600 text-4xl mb-2">✓</div>
          <h1 className="h1">{message}</h1>
          <button className="btn btn-primary" onClick={() => navigate("/profile")}>Về hồ sơ</button>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-4">
          <div className="text-red-600 text-4xl mb-2">✗</div>
          <h1 className="h1">{message}</h1>
          <button className="btn" onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      )}
    </div>
  );
}
