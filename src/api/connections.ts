import { http } from "@/app/client";
import type { Connection, ConnectionCheck, PaginatedResponse } from "@/types";

export async function createConnection(listingId: string, message: string = "") {
  const { data } = await http.post("/connections", null, {
    params: { listing_id: listingId, message }
  });
  return data;
}

export async function getOutgoingConnections(page = 1, limit = 20) {
  const { data } = await http.get<PaginatedResponse<Connection>>("/connections/outgoing", {
    params: { page, limit }
  });
  return data;
}

export async function getIncomingConnections(page = 1, limit = 20) {
  const { data } = await http.get<PaginatedResponse<Connection>>("/connections/incoming", {
    params: { page, limit }
  });
  return data;
}

export async function updateConnectionStatus(connectionId: string, status: "ACCEPTED" | "REJECTED") {
  const { data } = await http.patch(`/connections/${connectionId}`, null, {
    params: { status }
  });
  return data;
}

export async function checkConnection(listingId: string) {
  const { data } = await http.get<ConnectionCheck>(`/connections/check/${listingId}`);
  return data;
}
