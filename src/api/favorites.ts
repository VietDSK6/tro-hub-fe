import { http } from "@/app/client";
import type { Favorite, PaginatedResponse } from "@/types";

export async function addFavorite(listing_id: string) {
  const { data } = await http.post<Favorite>("/favorites", { listing_id });
  return data;
}

export async function listFavorites(params?: { page?: number; limit?: number }) {
  const { data } = await http.get<PaginatedResponse<Favorite>>("/favorites", { params });
  return data;
}

export async function removeFavorite(listing_id: string) {
  const { data } = await http.delete("/favorites", { params: { listing_id } });
  return data;
}
