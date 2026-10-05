"use client";

import { ArrowDownUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "oldest",
    label: "Oldest",
  },
  {
    value: "price_low",
    label: "Price: Low to High",
  },
  {
    value: "price_high",
    label: "Price: High to Low",
  },
  {
    value: "mileage_low",
    label: "Mileage: Low to High",
  },
  {
    value: "mileage_high",
    label: "Mileage: High to Low",
  },
] as const;

type SortValue =
  (typeof sortOptions)[number]["value"];

interface CarSortProps {
  value: SortValue;
}

export default function CarSort({
  value,
}: CarSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(
    nextSort: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("sort", nextSort);
    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ArrowDownUp
        size={17}
        className="text-[var(--fa-text-secondary)]"
      />

      <label
        htmlFor="sort"
        className="text-sm font-semibold text-[var(--fa-text)]"
      >
        Sort
      </label>

      <select
        id="sort"
        value={value}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        className="h-10 rounded-lg border border-[var(--fa-border)] bg-white px-3 text-sm font-medium outline-none focus:border-[var(--fa-blue)]"
      >
        {sortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}