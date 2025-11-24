import { http } from "@/app/client";
import type { AuthResponse, RegisterPayload, LoginPayload } from "@/types";

export async function apiRegister(body: RegisterPayload) {
  const { data } = await http.post<AuthResponse>("/auth/register", body);
  return data;
}

export async function apiLogin(body: LoginPayload) {
  const { data } = await http.post<AuthResponse>("/auth/login", body);
  return data;
}
