import { http } from "@/app/client";
import type { Review, ReviewIn, ReviewSummary, PaginatedResponse } from "@/types";

export async function listReviews(params: { listing_id: string; page?: number; limit?: number }) {
  const { data } = await http.get<PaginatedResponse<Review>>("/reviews", { params });
  return data;
}

export async function summaryReviews(listing_id: string) {
  const { data } = await http.get<ReviewSummary>("/reviews/summary", { params: { listing_id } });
  return data;
}

export async function createReview(body: ReviewIn) {
  const { data } = await http.post<Review>("/reviews", body);
  return data;
}
