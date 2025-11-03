import { http } from "@/app/client";
export async function matchRoommates(top_k=10){
  const { data } = await http.get("/matching/roommates", { params: { top_k } });
  return data as { items:any[] };
}
