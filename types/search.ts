export interface CarSearchFilters {
  make?: string;
  model?: string;

  minYear?: number;
  maxYear?: number;

  minPrice?: number;
  maxPrice?: number;

  country?: string;
  state?: string;
  city?: string;

  minMileage?: number;
  maxMileage?: number;
}

export type CarSortOption =
  | "newest"
  | "oldest"
  | "price_low"
  | "price_high"
  | "mileage_low"
  | "mileage_high";