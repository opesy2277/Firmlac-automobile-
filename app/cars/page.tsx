import Link from "next/link";
import {
  CarFront,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";

import CarCard from "@/components/cars/CarCard";
import CarFilters from "@/components/cars/CarFilters";
import CarSort from "@/components/cars/CarSort";
import { DEFAULT_PAGE_SIZE } from "@/lib/cars/constant";
import { searchCars } from "@/lib/cars/search";

type SearchParams = {
  make?: string;
  model?: string;

  minYear?: string;
  maxYear?: string;

  minPrice?: string;
  maxPrice?: string;

  location?: string;

  minMileage?: string;
  maxMileage?: string;

  sort?: string;
  page?: string;
};

function numberOrUndefined(
  value?: string
): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function validSort(
  value?: string
):
  | "newest"
  | "oldest"
  | "price_low"
  | "price_high"
  | "mileage_low"
  | "mileage_high" {
  switch (value) {
    case "oldest":
    case "price_low":
    case "price_high":
    case "mileage_low":
    case "mileage_high":
    case "newest":
      return value;

    default:
      return "newest";
  }
}

function buildPageUrl(
  searchParams: SearchParams,
  page: number
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(
    ([key, value]) => {
      if (
        key !== "page" &&
        value !== undefined &&
        value !== ""
      ) {
        params.set(key, value);
      }
    }
  );

  params.set("page", String(page));

  return `/cars?${params.toString()}`;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const sort = validSort(params.sort);

  const page = Math.max(
    numberOrUndefined(params.page) ?? 1,
    1
  );

  const result = await searchCars({
    make: params.make,
    model: params.model,

    minYear: numberOrUndefined(
      params.minYear
    ),
    maxYear: numberOrUndefined(
      params.maxYear
    ),

    minPrice: numberOrUndefined(
      params.minPrice
    ),
    maxPrice: numberOrUndefined(
      params.maxPrice
    ),

    location: params.location,

    minMileage: numberOrUndefined(
      params.minMileage
    ),
    maxMileage: numberOrUndefined(
      params.maxMileage
    ),

    sort,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return (
    <main>
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-10 sm:py-14">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white sm:flex">
              <CarFront size={24} />
            </span>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--fa-navy)] sm:text-4xl">
                Find your next car
              </h1>

              <p className="mt-3 max-w-2xl text-[var(--fa-text-secondary)]">
                Search vehicles from Firmlac Automobile,
                dealers, and private sellers around the
                world.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <CarFilters />

          <div className="mt-8 flex flex-col justify-between gap-4 border-b border-[var(--fa-border)] pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-[var(--fa-text-secondary)]">
                {result.total === 1
                  ? "1 vehicle found"
                  : `${result.total.toLocaleString()} vehicles found`}
              </p>
            </div>

            <CarSort value={sort} />
          </div>

          {result.cars.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--fa-border)] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fa-background)] text-[var(--fa-text-secondary)]">
                <SearchX size={26} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--fa-text)]">
                No cars found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fa-text-secondary)]">
                We couldn't find vehicles matching
                your current filters. Try changing or
                clearing some filters.
              </p>

              <Link
                href="/cars"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--fa-navy)] px-5 text-sm font-bold text-white transition hover:bg-[var(--fa-navy-light)]"
              >
                Clear all filters
              </Link>
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {result.page > 1 ? (
                <Link
                  href={buildPageUrl(
                    params,
                    result.page - 1
                  )}
                  className="flex h-11 items-center gap-2 rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm font-bold transition hover:border-[var(--fa-blue)] hover:text-[var(--fa-blue)]"
                >
                  <ChevronLeft size={18} />
                  Previous
                </Link>
              ) : (
                <span className="flex h-11 items-center gap-2 rounded-xl border border-[var(--fa-border)] bg-[var(--fa-background)] px-4 text-sm font-bold text-[var(--fa-text-secondary)]">
                  <ChevronLeft size={18} />
                  Previous
                </span>
              )}

              <span className="flex h-11 items-center rounded-xl bg-[var(--fa-navy)] px-4 text-sm font-bold text-white">
                {result.page} / {result.totalPages}
              </span>

              {result.page <
              result.totalPages ? (
                <Link
                  href={buildPageUrl(
                    params,
                    result.page + 1
                  )}
                  className="flex h-11 items-center gap-2 rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm font-bold transition hover:border-[var(--fa-blue)] hover:text-[var(--fa-blue)]"
                >
                  Next
                  <ChevronRight size={18} />
                </Link>
              ) : (
                <span className="flex h-11 items-center gap-2 rounded-xl border border-[var(--fa-border)] bg-[var(--fa-background)] px-4 text-sm font-bold text-[var(--fa-text-secondary)]">
                  Next
                  <ChevronRight size={18} />
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}