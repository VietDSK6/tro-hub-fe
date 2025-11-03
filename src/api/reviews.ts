import { http } from "@/app/client";
export async function listReviews(p:{listing_id:string; page?:number; limit?:number}){
  const { data } = await http.get("/reviews", { params: p });
  return data as { items:any[]; total:number };
}
export async function summaryReviews(listing_id: string){
  const { data } = await http.get("/reviews/summary", { params: { listing_id } });
  return data as { overall:number|null; metrics:any[]; count:number };
}
export async function createReview(body:{listing_id:string; scores:Record<string,number>; content:string}){
  const { data } = await http.post("/reviews", body);
  return data;
}
