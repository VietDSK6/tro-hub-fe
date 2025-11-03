import { http } from "@/app/client";
export async function chatHistory(peer_id:string, page=1, limit=50){
  const { data } = await http.get("/chat/history", { params: { peer_id, page, limit } });
  return data as { items:any[]; total:number };
}
