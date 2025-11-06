import { useState } from "react";
import { uploadImages } from "@/api/upload";
import { useToastContext } from "@/contexts/ToastContext";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ value, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { success, error } = useToastContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (value.length + files.length > maxImages) {
      error(`Tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate file sizes (max 5MB each)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        error(`File ${file.name} quá lớn. Tối đa 5MB mỗi ảnh`);
        return;
      }
    }

    setUploading(true);
    try {
      const result = await uploadImages(files);
      onChange([...value, ...result.urls]);
      success(`Đã tải ${files.length} ảnh`);
      e.target.value = ""; // Reset input
    } catch (err: any) {
      error(err.response?.data?.detail || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="btn btn-ghost cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || value.length >= maxImages}
            className="hidden"
          />
          {uploading ? "Đang tải..." : "Chọn ảnh"}
        </label>
        <span className="text-xs text-gray-500">
          ({value.length}/{maxImages}) - Tối đa 5MB/ảnh
        </span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
