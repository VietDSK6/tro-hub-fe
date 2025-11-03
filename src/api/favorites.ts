import { http } from "@/app/client";
export async function addFavorite(listing_id:string){
  const { data } = await http.post("/favorites", { listing_id });
  return data;
}
export async function listFavorites(params?:any){
  const { data } = await http.get("/favorites", { params });
  return data as { items:any[]; total:number };
}
export async function removeFavorite(listing_id:string){
  const { data } = await http.delete("/favorites", { params: { listing_id } });
  return data;
}
