import { createPublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/lib/cars/constant";
import { mapDatabaseCarsToCars } from "@/lib/cars/mapper";
import type { Car } from "@/types/car";

export type CarSearchParams = {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  country?: string;
  state?: string;
  city?: string;
  location?: string;
  minMileage?: number;
  maxMileage?: number;
  sort?:
    | "newest"
    | "oldest"
    | "price_low"
    | "price_high"
    | "mileage_low"
    | "mileage_high";
  page?: number;
  pageSize?: number;
};

export interface CarSearchResult {
  cars: Car[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function normalizeText(value?: string): string | undefined {
  const normalized = value?.trim();

  return normalized || undefined;
}

function normalizeNumber(value?: number): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

export async function searchCars(
  filters: CarSearchParams = {}
): Promise<CarSearchResult> {
  // Anonymous client: public listings must not depend on the visitor's
  // session, so a stale or expired login cookie can't break this query.
  const supabase = createPublicClient();

  const page = Math.max(Math.floor(filters.page ?? 1), 1);

  const requestedPageSize = Math.floor(
    filters.pageSize ?? DEFAULT_PAGE_SIZE
  );

  const pageSize = Math.min(
    Math.max(requestedPageSize, 1),
    MAX_PAGE_SIZE
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const make = normalizeText(filters.make);
  const model = normalizeText(filters.model);
  const country = normalizeText(filters.country);
  const state = normalizeText(filters.state);
  const city = normalizeText(filters.city);
  const location = normalizeText(filters.location);

  const minYear = normalizeNumber(filters.minYear);
  const maxYear = normalizeNumber(filters.maxYear);

  const minPrice = normalizeNumber(filters.minPrice);
  const maxPrice = normalizeNumber(filters.maxPrice);

  const minMileage = normalizeNumber(filters.minMileage);
  const maxMileage = normalizeNumber(filters.maxMileage);

  let query = supabase
    .from("car_listings")
    .select(
      `
        id,
        title,
        make,
        model,
        year,
        price,
        currency,
        mileage,
        country,
        state,
        city,
        description,
        condition,
        seller_type,
        seller_id,
        status,
        created_at,
        updated_at,
        car_images (
          id,
          url,
          alt,
          sort_order
        )
      `,
      {
        count: "exact",
      }
    )
    .eq("status", "active");

  if (make) {
    query = query.ilike("make", `%${make}%`);
  }

  if (model) {
    query = query.ilike("model", `%${model}%`);
  }

  if (minYear !== undefined) {
    query = query.gte("year", minYear);
  }

  if (maxYear !== undefined) {
    query = query.lte("year", maxYear);
  }

  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  if (country) {
    query = query.ilike("country", `%${country}%`);
  }

  if (state) {
    query = query.ilike("state", `%${state}%`);
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (location) {
    const escapedLocation = location
      .replace(/[%_]/g, "\\$&")
      .replace(/,/g, "");

    query = query.or(
      [
        `city.ilike.%${escapedLocation}%`,
        `state.ilike.%${escapedLocation}%`,
        `country.ilike.%${escapedLocation}%`,
      ].join(",")
    );
  }

  if (minMileage !== undefined) {
    query = query.gte("mileage", minMileage);
  }

  if (maxMileage !== undefined) {
    query = query.lte("mileage", maxMileage);
  }

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;

    case "price_low":
      query = query.order("price", { ascending: true });
      break;

    case "price_high":
      query = query.order("price", { ascending: false });
      break;

    case "mileage_low":
      query = query.order("mileage", { ascending: true });
      break;

    case "mileage_high":
      query = query.order("mileage", { ascending: false });
      break;

    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(
      "SUPABASE CAR SEARCH ERROR:",
      JSON.stringify(error, null, 2)
    );

    throw new Error(
      `Failed to search car listings: ${error.message}`
    );
  }

  const cars = mapDatabaseCarsToCars(data ?? []);

  const total = count ?? 0;

  return {
    cars,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}