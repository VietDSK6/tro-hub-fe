import { http } from "@/app/client";
import type { Listing, ListingIn, ListingPatch, ListingsParams, PaginatedResponse } from "@/types";

export interface ListingsQueryParams extends ListingsParams {
  exclude_own?: boolean;
  province?: string;
}

export async function listListings(params: ListingsQueryParams) {
  const { data } = await http.get<PaginatedResponse<Listing>>("/listings", { params });
  return data;
}

export async function getMyListings(page = 1, limit = 20) {
  const { data } = await http.get<PaginatedResponse<Listing>>("/listings/my", {
    params: { page, limit }
  });
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

export async function updateListing(id: string, body: ListingPatch) {
  const { data } = await http.patch<Listing>(`/listings/${id}`, body);
  return data;
}

export async function deleteListing(id: string) {
  await http.delete(`/listings/${id}`);
}

export async function verifyListing(id: string, status: "VERIFIED" | "REJECTED") {
  const { data } = await http.post<Listing>(`/listings/${id}/verify`, null, {
    params: { status }
  });
  return data;
}
