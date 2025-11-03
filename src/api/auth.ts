import { http } from "@/app/client";

export type AuthPayload = { email: string; password: string; name?: string };
export type AuthResp = { _id: string; email: string; name?: string };

export async function apiRegister(body: AuthPayload) {
  const { data } = await http.post<AuthResp>("/auth/register", body);
  return data;
}
export async function apiLogin(body: AuthPayload) {
  const { data } = await http.post<AuthResp>("/auth/login", body);
  return data;
}
