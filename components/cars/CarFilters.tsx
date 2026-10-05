"use client";

import { FormEvent, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [make, setMake] = useState(
    searchParams.get("make") ?? ""
  );

  const [model, setModel] = useState(
    searchParams.get("model") ?? ""
  );

  const [minYear, setMinYear] = useState(
    searchParams.get("minYear") ?? ""
  );

  const [maxYear, setMaxYear] = useState(
    searchParams.get("maxYear") ?? ""
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") ?? ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") ?? ""
  );

  const [location, setLocation] = useState(
    searchParams.get("location") ?? ""
  );

  const [minMileage, setMinMileage] = useState(
    searchParams.get("minMileage") ?? ""
  );

  const [maxMileage, setMaxMileage] = useState(
    searchParams.get("maxMileage") ?? ""
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    const values = {
      make,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      location,
      minMileage,
      maxMileage,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  function handleClear() {
    setMake("");
    setModel("");
    setMinYear("");
    setMaxYear("");
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setMinMileage("");
    setMaxMileage("");

    router.push(pathname);
  }

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: 31 },
    (_, index) => currentYear - index
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--fa-border)] bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
            <SlidersHorizontal size={19} />
          </span>

          <div>
            <h2 className="text-lg font-bold text-[var(--fa-text)]">
              Filter Cars
            </h2>

            <p className="text-sm text-[var(--fa-text-secondary)]">
              Refine your search
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-semibold text-[var(--fa-text-secondary)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-red)] sm:self-auto"
        >
          <RotateCcw size={16} />
          Clear filters
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label
            htmlFor="filter-make"
            className="mb-2 block text-sm font-semibold"
          >
            Make
          </label>

          <select
            id="filter-make"
            value={make}
            onChange={(event) =>
              setMake(event.target.value)
            }
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
          >
            <option value="">Any make</option>
            <option value="Toyota">Toyota</option>
            <option value="Mercedes-Benz">
              Mercedes-Benz
            </option>
            <option value="BMW">BMW</option>
            <option value="Lexus">Lexus</option>
            <option value="Honda">Honda</option>
            <option value="Ford">Ford</option>
            <option value="Audi">Audi</option>
            <option value="Porsche">Porsche</option>
            <option value="Tesla">Tesla</option>
            <option value="Nissan">Nissan</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-model"
            className="mb-2 block text-sm font-semibold"
          >
            Model
          </label>

          <input
            id="filter-model"
            value={model}
            onChange={(event) =>
              setModel(event.target.value)
            }
            placeholder="e.g. Camry"
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] px-4 text-sm outline-none placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
          />
        </div>

        <div>
          <label
            htmlFor="filter-location"
            className="mb-2 block text-sm font-semibold"
          >
            Location
          </label>

          <input
            id="filter-location"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder="City, state or country"
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] px-4 text-sm outline-none placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
          />
        </div>

        <div>
          <label
            htmlFor="filter-min-year"
            className="mb-2 block text-sm font-semibold"
          >
            Minimum year
          </label>

          <select
            id="filter-min-year"
            value={minYear}
            onChange={(event) =>
              setMinYear(event.target.value)
            }
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none focus:border-[var(--fa-blue)]"
          >
            <option value="">Any year</option>

            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-max-year"
            className="mb-2 block text-sm font-semibold"
          >
            Maximum year
          </label>

          <select
            id="filter-max-year"
            value={maxYear}
            onChange={(event) =>
              setMaxYear(event.target.value)
            }
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none focus:border-[var(--fa-blue)]"
          >
            <option value="">Any year</option>

            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-min-price"
            className="mb-2 block text-sm font-semibold"
          >
            Minimum price
          </label>

          <input
            id="filter-min-price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(event.target.value)
            }
            placeholder="e.g. 10000"
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] px-4 text-sm outline-none placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)]"
          />
        </div>

        <div>
          <label
            htmlFor="filter-max-price"
            className="mb-2 block text-sm font-semibold"
          >
            Maximum price
          </label>

          <input
            id="filter-max-price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(event.target.value)
            }
            placeholder="e.g. 100000"
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] px-4 text-sm outline-none placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)]"
          />
        </div>

        <div>
          <label
            htmlFor="filter-min-mileage"
            className="mb-2 block text-sm font-semibold"
          >
            Minimum mileage
          </label>

          <input
            id="filter-min-mileage"
            type="number"
            min="0"
            value={minMileage}
            onChange={(event) =>
              setMinMileage(event.target.value)
            }
            placeholder="e.g. 0"
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] px-4 text-sm outline-none placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)]"
          />
        </div>

        <div>
          <label
            htmlFor="filter-max-mileage"
            className="mb-2 block text-sm font-semibold"
          >
            Maximum mileage
          </label>

          <input
            id="filter-max-mileage"
            type="number"
            min="0"
            value={maxMileage}
            onChange={(event) =>
              setMaxMileage(event.target.value)
            }
            placeholder="e.g. 100000"
            className="h-12 w-full rounded-xl border border-[var(--fa-border)] px-4 text-sm outline-none placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] px-6 text-sm font-bold text-white transition hover:brightness-95"
      >
        <Search size={18} />
        Apply Filters
      </button>
    </form>
  );
}