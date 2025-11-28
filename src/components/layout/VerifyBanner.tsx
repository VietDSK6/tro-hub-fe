import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiSendVerification } from "@/api/auth";
import { useToastContext } from "@/contexts/ToastContext";
import { AlertTriangle, X } from "lucide-react";

export default function VerifyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { success, error } = useToastContext();
  
  const userId = localStorage.getItem("userId");
  const isVerified = localStorage.getItem("isVerified") === "true";

  const sendVer = useMutation({
    mutationFn: apiSendVerification,
    onSuccess: () => success("Đã gửi email xác thực!"),
    onError: () => error("Gửi email thất bại"),
  });

  if (!userId || isVerified || dismissed) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container-app px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Xác thực email</span> để đăng tin và gửi yêu cầu kết nối.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sendVer.mutate()}
            disabled={sendVer.isPending}
            className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
          >
            {sendVer.isPending ? "Đang gửi..." : "Gửi email xác thực"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
