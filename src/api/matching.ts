import { http } from "@/app/client";
import type { Listing } from "@/types";

export async function matchRooms(top_k: number = 10) {
  const { data } = await http.get<{ 
    items: Array<{
      listing: Listing;
      score: number;
      distance_km: number | null;
      price_match: number;
    }> 
  }>("/matching/rooms", { params: { top_k } });
  return data;
}

export async function matchRoommates(top_k: number = 10) {
  return matchRooms(top_k);
}
