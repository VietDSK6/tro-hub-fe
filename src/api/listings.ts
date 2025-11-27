import { http } from "@/app/client";
import type { Listing, ListingIn, ListingsParams, PaginatedResponse } from "@/types";

export interface ListingsQueryParams extends ListingsParams {
  exclude_own?: boolean;
}

export async function listListings(params: ListingsQueryParams) {
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

export async function verifyListing(id: string, status: "VERIFIED" | "REJECTED") {
  const { data } = await http.post<Listing>(`/listings/${id}/verify`, null, {
    params: { status }
  });
  return data;
}
