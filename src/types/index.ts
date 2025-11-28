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
  address?: string;
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

export interface ListingPreview {
  _id: string;
  title: string;
  desc?: string;
  price?: number;
  area?: number;
  images?: string[];
  location: GeoPoint;
  address?: string;
  status?: ListingStatus;
  owner_id?: string;
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
  address?: string;
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
  is_verified?: boolean;
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

export interface PublicProfile {
  _id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  budget?: number;
  gender?: string;
  age?: number;
  habits?: Record<string, any>;
  desiredAreas?: string[];
  location?: GeoPoint;
  is_own_profile: boolean;
  has_connection: boolean;
  email?: string;
  phone?: string;
}

export interface Favorite {
  _id: string;
  user_id: string;
  listing_id: string;
  listing?: ListingPreview | Listing;
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
  min_area?: number;
  max_area?: number;
  amenities?: string;
  pet?: boolean;
  smoke?: boolean;
  cook?: boolean;
  visitor?: boolean;
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
  is_verified?: boolean;
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

export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ConnectionListingPreview {
  _id: string;
  title: string;
  price: number;
  images: string[];
}

export interface ConnectionUserPreview {
  name: string;
  email?: string;
  phone?: string;
}

export interface Connection {
  _id: string;
  listing_id: string;
  from_user_id?: string;
  to_user_id?: string;
  message: string;
  status: ConnectionStatus;
  created_at: string;
  listing?: ConnectionListingPreview;
  from_user?: ConnectionUserPreview;
  to_user?: ConnectionUserPreview;
}

export interface ConnectionCheck {
  connected: boolean;
  status: ConnectionStatus | null;
  connection_id?: string;
  owner_contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export type NotificationType = "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED" | "CONNECTION_REJECTED";

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata?: {
    connection_id?: string;
    listing_id?: string;
    from_user_id?: string;
    to_user_id?: string;
  };
  read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
}

export interface ListingConnectionUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ListingConnectionProfile {
  full_name: string;
  avatar: string;
  budget: number;
}

export interface ListingConnection {
  _id: string;
  listing_id: string;
  from_user_id: string;
  message: string;
  status: ConnectionStatus;
  created_at: string;
  from_user?: ListingConnectionUser;
  from_profile?: ListingConnectionProfile;
}

export interface ListingConnectionsResponse {
  items: ListingConnection[];
  total: number;
  pending_count: number;
  page: number;
  limit: number;
}
