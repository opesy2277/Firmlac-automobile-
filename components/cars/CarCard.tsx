"use client";

import SaveCarButton from "./SaveCarButton";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Gauge,
  MapPin,
} from "lucide-react";

import { Car } from "@/types/car";
import { formatMileage, formatPrice } from "@/lib/utils";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const image = car.images?.[0];

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--fa-border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[var(--fa-shadow-md)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--fa-background)]">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || `${car.year} ${car.make} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-[var(--fa-text-secondary)]">
              No image available
            </span>
          </div>
        )}

        <div className="absolute right-3 top-3 z-10">
          <SaveCarButton carId={car.id} />
        </div>

        {car.sellerType === "firmlac" && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-[var(--fa-navy)] px-3 py-1.5 text-xs font-bold text-white">
            Firmlac Automobile
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--fa-text-secondary)]">
              {car.year} {car.make}
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-[var(--fa-text)]">
              {car.model}
            </h3>
          </div>

          <p className="shrink-0 text-lg font-bold text-[var(--fa-navy)]">
            {formatPrice(car.price, car.currency)}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[var(--fa-border)] py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--fa-text-secondary)]">
            <Gauge size={17} />
            <span>{formatMileage(car.mileage)} mi</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--fa-text-secondary)]">
            <CalendarDays size={17} />
            <span>{car.condition === "new" ? "New" : "Used"}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--fa-text-secondary)]">
          <MapPin size={17} />
          <span>
            {car.city}, {car.country}
          </span>
        </div>

        <Link
          href={`/cars/${car.id}`}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[var(--fa-navy)] text-sm font-bold text-white transition hover:bg-[var(--fa-navy-light)]"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}