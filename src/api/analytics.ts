import { http } from "@/app/client";

export interface OverviewAnalytics {
  total_listings: number;
  active_listings: number;
  rented_listings: number;
  hidden_listings: number;
  pending_listings: number;
  price_stats: {
    average: number;
    min: number;
    max: number;
  };
  area_stats: {
    average: number;
  };
  price_distribution: Array<{
    _id: number | string;
    count: number;
  }>;
  area_distribution: Array<{
    _id: number | string;
    count: number;
  }>;
  top_amenities: Array<{
    _id: string;
    count: number;
  }>;
  verification_status: Array<{
    _id: string;
    count: number;
  }>;
}

export interface LocationAnalytics {
  top_locations: Array<{
    address: string;
    count: number;
    avg_price: number;
    min_price: number;
    max_price: number;
    avg_area: number;
  }>;
}

export interface PriceRangeAnalytics {
  price_ranges: Array<{
    label: string;
    min_price: number;
    max_price: number;
    count: number;
    avg_area: number;
  }>;
}

export interface AreaRangeAnalytics {
  area_ranges: Array<{
    label: string;
    min_area: number;
    max_area: number;
    count: number;
    avg_price: number;
  }>;
}

export interface AmenitiesStats {
  amenities: Array<{
    key: string;
    label: string;
    count: number;
    avg_price: number;
    avg_area: number;
  }>;
}

export interface RulesStats {
  rules_stats: {
    [key: string]: {
      allowed: number;
      not_allowed: number;
      total: number;
    };
  };
}

export interface TrendsAnalytics {
  most_common_price_range: {
    _id: number | string;
    count: number;
  } | null;
  most_common_area_range: {
    _id: number | string;
    count: number;
  } | null;
  total_active_listings: number;
}

export async function getOverviewAnalytics() {
  const { data } = await http.get<OverviewAnalytics>("/analytics/overview");
  return data;
}

export async function getLocationAnalytics() {
  const { data } = await http.get<LocationAnalytics>("/analytics/by-location");
  return data;
}

export async function getPriceRangeAnalytics() {
  const { data } = await http.get<PriceRangeAnalytics>("/analytics/by-price-range");
  return data;
}

export async function getAreaRangeAnalytics() {
  const { data } = await http.get<AreaRangeAnalytics>("/analytics/by-area-range");
  return data;
}

export async function getAmenitiesStats() {
  const { data } = await http.get<AmenitiesStats>("/analytics/amenities-stats");
  return data;
}

export async function getRulesStats() {
  const { data } = await http.get<RulesStats>("/analytics/rules-stats");
  return data;
}

export async function getTrendsAnalytics() {
  const { data } = await http.get<TrendsAnalytics>("/analytics/trends");
  return data;
}
