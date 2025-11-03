import { http } from "@/app/client";
export type GeoPoint = { type: "Point"; coordinates: [number, number] };
export interface ListingIn {
  title: string; desc?: string; price?: number; area?: number;
  amenities?: string[]; rules?: Record<string, any>;
  images?: string[]; video?: string; status?: "ACTIVE"|"HIDDEN"|"RENTED";
  location: GeoPoint;
}
export interface Listing extends ListingIn { _id: string; owner_id: string }

export async function listListings(params: any){
  const { data } = await http.get<{items: Listing[]; total:number}>("/listings", { params });
  return data;
}
export async function getListing(id: string){
  const { data } = await http.get<Listing>(`/listings/${id}`);
  return data;
}
export async function createListing(body: ListingIn){
  const { data } = await http.post<Listing>("/listings", body);
  return data;
}
