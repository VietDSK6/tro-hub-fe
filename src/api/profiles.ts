import { http } from "@/app/client";
export async function meProfile(){
  const { data } = await http.get("/profiles/me");
  return data;
}
export async function upsertMeProfile(body:any){
  const { data } = await http.put("/profiles/me", body);
  return data;
}
