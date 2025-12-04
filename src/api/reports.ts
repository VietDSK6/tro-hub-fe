import { http } from "@/app/client";

export interface ReportItem {
  _id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  created_at: string;
  listing: {
    _id: string;
    title: string;
    images: string[];
    price: number;
    owner_id: string;
  } | null;
  reporter: {
    name: string;
    email: string;
  };
}

export interface ReportsResponse {
  items: ReportItem[];
  total: number;
  open_count: number;
  page: number;
  limit: number;
}

export async function createReport(listingId: string, reason: string) {
  const res = await http.post("/reports", { listing_id: listingId, reason });
  return res.data;
}

export async function getReports(params?: { status?: string; page?: number; limit?: number }): Promise<ReportsResponse> {
  const res = await http.get("/reports", { params });
  return res.data;
}

export async function resolveReport(reportId: string, action: "delete_listing" | "dismiss") {
  const res = await http.post(`/reports/${reportId}/resolve`, null, { params: { action } });
  return res.data;
}
