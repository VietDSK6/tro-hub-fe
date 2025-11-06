import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  }[type];

  const icon = {
    success: "✓",
    error: "×",
    info: "i",
  }[type];

  return (
    <div className="animate-slide-in-right">
      <div className={`${bgColor} border px-4 py-3 rounded shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-xl font-bold">{icon}</span>
        <span className="flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="text-xl leading-none hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
