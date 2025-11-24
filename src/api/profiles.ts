import { http } from "@/app/client";
import type { Profile, ProfileIn } from "@/types";

export async function meProfile() {
  const { data } = await http.get<Profile>("/profiles/me");
  return data;
}

export async function upsertMeProfile(body: ProfileIn) {
  const { data } = await http.put<Profile>("/profiles/me", body);
  return data;
}
