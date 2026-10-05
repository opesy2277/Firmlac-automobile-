import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createPublicClient } from "@/lib/supabase/public";
import { formatMileage, formatPrice } from "@/lib/utils";
import SaveCarButton from "@/components/cars/SaveCarButton";

interface CarDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface DatabaseCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number | string;
  currency: string;
  mileage: number;
  country: string;
  state: string | null;
  city: string;
  description: string;
  condition: "new" | "used";
  seller_type: "firmlac" | "dealer" | "private_seller";
  seller_id: string;
  status: "pending" | "active" | "sold" | "rejected" | "draft";
  created_at: string;
  updated_at: string;
  car_images: {
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
  }[] | null;
}

export default async function CarDetailsPage({
  params,
}: CarDetailsPageProps) {
  const { id } = await params;

  const supabase = await createPublicClient();

  const { data: car, error } = await supabase
    .from("car_listings")
    .select(`
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
    `)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

    if (error) {
    console.error("Error loading vehicle:", error);
    console.error("Vehicle query error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-700">
            Unable to load vehicle
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error.message || "The vehicle could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  if (!car) {
    notFound();
  }

  const typedCar = car as DatabaseCar;
  const images = [...(typedCar.car_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const image = images[0];

  const sellerName =
    typedCar.seller_type === "firmlac"
      ? "Firmlac Automobile"
      : typedCar.seller_type === "dealer"
        ? "Verified Dealer"
        : "Private Seller";

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-4">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-text-secondary)] transition hover:text-[var(--fa-blue)]"
          >
            <ArrowLeft size={17} />
            Back to marketplace
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="overflow-hidden rounded-2xl border border-[var(--fa-border)] bg-white shadow-sm">
            <div className="relative aspect-[16/8] min-h-[280px] bg-[var(--fa-background)]">
              {image ? (
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    `${typedCar.year} ${typedCar.make} ${typedCar.model}`
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--fa-text-secondary)]">
                  No image available
                </div>
              )}

              <div className="absolute right-5 top-5 z-10">
                <SaveCarButton carId={typedCar.id} />
              </div>

              {typedCar.seller_type === "firmlac" && (
                <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-lg bg-[var(--fa-navy)] px-3 py-2 text-xs font-bold text-white">
                  <ShieldCheck size={15} />
                  Firmlac Automobile
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--fa-text-secondary)]">
                      {typedCar.year} {typedCar.make}
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--fa-navy)] sm:text-4xl">
                      {typedCar.model}
                    </h1>

                    <div className="mt-3 flex items-center gap-2 text-sm text-[var(--fa-text-secondary)]">
                      <MapPin size={17} />
                      {typedCar.city}, {typedCar.country}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-3xl font-bold text-[var(--fa-navy)]">
                      {formatPrice(
                        Number(typedCar.price),
                        typedCar.currency
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[var(--fa-text-secondary)]">
                      Listed price
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[var(--fa-background)] p-4">
                    <Gauge
                      size={20}
                      className="text-[var(--fa-blue)]"
                    />

                    <p className="mt-3 text-xs font-medium text-[var(--fa-text-secondary)]">
                      Mileage
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--fa-text)]">
                      {formatMileage(typedCar.mileage)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[var(--fa-background)] p-4">
                    <CalendarDays
                      size={20}
                      className="text-[var(--fa-blue)]"
                    />

                    <p className="mt-3 text-xs font-medium text-[var(--fa-text-secondary)]">
                      Year
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--fa-text)]">
                      {typedCar.year}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[var(--fa-background)] p-4">
                    <CheckCircle2
                      size={20}
                      className="text-[var(--fa-blue)]"
                    />

                    <p className="mt-3 text-xs font-medium text-[var(--fa-text-secondary)]">
                      Condition
                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-[var(--fa-text)]">
                      {typedCar.condition}
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-[var(--fa-border)] pt-8">
                  <h2 className="text-xl font-bold text-[var(--fa-text)]">
                    Vehicle Description
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-[var(--fa-text-secondary)]">
                    {typedCar.description}
                  </p>
                </div>

                <div className="mt-8 border-t border-[var(--fa-border)] pt-8">
                  <h2 className="text-xl font-bold text-[var(--fa-text)]">
                    Vehicle Location
                  </h2>

                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--fa-background)] p-4">
                    <MapPin
                      size={21}
                      className="mt-0.5 shrink-0 text-[var(--fa-red)]"
                    />

                    <div>
                      <p className="font-bold text-[var(--fa-text)]">
                        {typedCar.city}
                      </p>

                      <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                        {typedCar.state
                          ? `${typedCar.state}, `
                          : ""}
                        {typedCar.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside>
              <div className="sticky top-28 rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--fa-red)]">
                  Seller
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fa-navy)] text-white">
                    <UserRound size={22} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--fa-text)]">
                      {sellerName}
                    </h2>

                    <p className="mt-1 text-xs capitalize text-[var(--fa-text-secondary)]">
                      {typedCar.seller_type.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-[var(--fa-border)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fa-text)]">
                    <ShieldCheck
                      size={18}
                      className="text-[var(--fa-success)]"
                    />
                    Listing information
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[var(--fa-text-secondary)]">
                    Always verify vehicle details and seller information
                    before completing a purchase.
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] text-sm font-bold text-white transition hover:brightness-95"
                >
                  <MessageCircle size={19} />
                  Contact Seller
                </button>

                <div className="mt-3">
                  <SaveCarButton carId={typedCar.id} />
                </div>

                <div className="mt-6 flex items-start gap-3 border-t border-[var(--fa-border)] pt-5">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-[var(--fa-success)]"
                  />

                  <p className="text-xs leading-5 text-[var(--fa-text-secondary)]">
                    Never send money before independently verifying the
                    vehicle and seller.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--fa-blue)]"
            >
              <ChevronLeft size={18} />
              Browse more cars
            </Link>

            <Link
              href="/cars"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--fa-blue)]"
            >
              Back to marketplace
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}