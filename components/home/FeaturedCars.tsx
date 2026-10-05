import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CarCard from "@/components/cars/CarCard";
import { searchCars } from "@/lib/cars/search";

export default async function FeaturedCars() {
  const result = await searchCars({
    page: 1,
    pageSize: 4,
  });

  const cars = result.cars ?? [];

  return (
    <section className="section bg-[var(--fa-background)]">
      <div className="container">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
              Featured Vehicles
            </p>

            <h2 className="section-title">
              Explore selected cars
            </h2>

            <p className="section-description">
              Browse vehicles from Firmlac Automobile, trusted dealers, and
              private sellers.
            </p>
          </div>

          <Link
            href="/cars"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--fa-blue)] transition hover:text-[var(--fa-navy)]"
          >
            View all cars
            <ArrowRight size={18} />
          </Link>
        </div>

        {cars.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-[var(--fa-border)] bg-white p-10 text-center">
            <p className="text-sm font-semibold text-[var(--fa-text-secondary)]">
              No vehicles are currently available.
            </p>

            <Link
              href="/cars"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--fa-navy)] px-5 py-3 text-sm font-bold text-white"
            >
              Browse Cars
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}