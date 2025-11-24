import { http } from "@/app/client";
import type { Profile } from "@/types";

export async function matchRoommates(top_k: number = 10) {
  const { data } = await http.get<{ items: Profile[] }>("/matching/roommates", { params: { top_k } });
  return data;
}
