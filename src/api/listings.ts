import { http } from "@/app/client";
import type { Listing, ListingIn, ListingsParams, PaginatedResponse } from "@/types";

export async function listListings(params: ListingsParams) {
  const { data } = await http.get<PaginatedResponse<Listing>>("/listings", { params });
  return data;
}

export async function getListing(id: string) {
  const { data } = await http.get<Listing>(`/listings/${id}`);
  return data;
}

export async function createListing(body: ListingIn) {
  const { data } = await http.post<Listing>("/listings", body);
  return data;
}
