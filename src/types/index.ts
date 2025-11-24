export type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type ListingStatus = "ACTIVE" | "HIDDEN" | "RENTED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type UserRole = "USER" | "ADMIN";

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface Owner {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ListingIn {
  title: string;
  desc?: string;
  price?: number;
  area?: number;
  amenities?: string[];
  rules?: Record<string, any>;
  images?: string[];
  video?: string;
  status?: ListingStatus;
  location: GeoPoint;
  verification_status?: VerificationStatus;
}

export interface Listing extends ListingIn {
  _id: string;
  owner_id: string;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  owner?: Owner;
}

export interface ListingPatch {
  title?: string;
  desc?: string;
  price?: number;
  area?: number;
  amenities?: string[];
  rules?: Record<string, any>;
  images?: string[];
  video?: string;
  status?: ListingStatus;
  location?: GeoPoint;
  verification_status?: VerificationStatus;
}

export interface Profile {
  _id: string;
  user_id: string;
  bio?: string;
  budget?: number;
  desiredAreas?: string[];
  habits?: Record<string, any>;
  gender?: string;
  age?: number;
  constraints?: Record<string, any>;
  location?: GeoPoint;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface ProfileIn {
  bio?: string;
  budget?: number;
  desiredAreas?: string[];
  habits?: Record<string, any>;
  gender?: string;
  age?: number;
  constraints?: Record<string, any>;
  location?: GeoPoint;
}

export interface Review {
  _id: string;
  listing_id: string;
  author_id: string;
  scores: Record<string, number>;
  content: string;
  created_at?: string;
}

export interface ReviewIn {
  listing_id: string;
  scores: Record<string, number>;
  content: string;
}

export interface ReviewSummary {
  overall: number | null;
  metrics: Array<{
    metric: string;
    avg: number;
  }>;
  count: number;
}

export interface Favorite {
  _id: string;
  user_id: string;
  listing_id: string;
  listing?: Listing;
}

export interface Report {
  _id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  status: string;
}

export interface ReportIn {
  listing_id: string;
  reason: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ListingsParams {
  q?: string;
  min_price?: number;
  max_price?: number;
  lng?: number;
  lat?: number;
  radius_km?: number;
  page?: number;
  limit?: number;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface AuthResponse {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
}
