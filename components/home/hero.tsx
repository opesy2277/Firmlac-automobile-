"use client";

import {
  CarFront,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--fa-navy)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,87,192,0.35),transparent_45%)]" />

      <div className="container relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85">
            <CarFront size={17} />
            Global Automotive Marketplace
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the car that
            <span className="text-[var(--fa-red)]">
              {" "}
              fits your journey.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Discover cars from trusted dealers, private sellers, and Firmlac
            Automobile inventory around the world.
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--fa-text)]">
                Search Cars
              </h2>

              <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                Find vehicles using the details that matter to you.
              </p>
            </div>

            <SlidersHorizontal
              size={21}
              className="hidden text-[var(--fa-blue)] sm:block"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="make"
                className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
              >
                Make
              </label>

              <select
                id="make"
                defaultValue=""
                className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
              >
                <option value="" disabled>
                  Select make
                </option>
                <option value="toyota">Toyota</option>
                <option value="mercedes-benz">Mercedes-Benz</option>
                <option value="bmw">BMW</option>
                <option value="lexus">Lexus</option>
                <option value="honda">Honda</option>
                <option value="ford">Ford</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="model"
                className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
              >
                Model
              </label>

              <input
                id="model"
                type="text"
                placeholder="e.g. Camry"
                className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
              />
            </div>

            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
              >
                Year
              </label>

              <select
                id="year"
                defaultValue=""
                className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
              >
                <option value="">Any year</option>

                {Array.from({ length: 30 }, (_, index) => {
                  const year = new Date().getFullYear() - index;

                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
              >
                Price
              </label>

              <select
                id="price"
                defaultValue=""
                className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
              >
                <option value="">Any price</option>
                <option value="0-10000">Under $10,000</option>
                <option value="10000-25000">$10,000 – $25,000</option>
                <option value="25000-50000">$25,000 – $50,000</option>
                <option value="50000-100000">$50,000 – $100,000</option>
                <option value="100000+">$100,000+</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
              >
                Location
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fa-text-secondary)]"
                />

                <input
                  id="location"
                  type="text"
                  placeholder="City or country"
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="mileage"
                className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
              >
                Mileage
              </label>

              <select
                id="mileage"
                defaultValue=""
                className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
              >
                <option value="">Any mileage</option>
                <option value="0-10000">Under 10,000 miles</option>
                <option value="10000-30000">10,000 – 30,000 miles</option>
                <option value="30000-60000">30,000 – 60,000 miles</option>
                <option value="60000-100000">60,000 – 100,000 miles</option>
                <option value="100000+">100,000+ miles</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] px-6 text-sm font-bold text-white transition hover:brightness-95"
          >
            <Search size={19} />
            Search Cars
          </button>
        </div>
      </div>
    </section>
  );
}