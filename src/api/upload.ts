import { http } from "@/app/client";

export async function uploadImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  const { data } = await http.post<{ urls: string[] }>("/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return data;
}
