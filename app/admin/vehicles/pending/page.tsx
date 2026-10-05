import Link from "next/link";
import {
  ArrowLeft,
  CarFront,
  Check,
  Clock3,
  MapPin,
  User,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatMileage, formatPrice } from "@/lib/utils";

interface PendingVehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  country: string;
  state: string | null;
  city: string;
  description: string;
  condition: "new" | "used";
  seller_type: "dealer" | "private_seller" | "firmlac";
  seller_id: string;
  created_at: string;
  images: {
    id: string;
    url: string;
    alt: string;
    sort_order: number;
  }[];
  seller: {
    full_name: string;
    email: string;
    phone: string | null;
    user_type: string;
  } | null;
}

export default async function PendingVehiclesPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
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
      created_at,
      car_images (
        id,
        url,
        alt,
        sort_order
      ),
      profiles:seller_id (
        full_name,
        email,
        phone,
        user_type
      )
    `)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "PENDING VEHICLES ERROR:",
      error
    );

    return (
      <main className="min-h-screen bg-[var(--fa-background)] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Could not load pending vehicle listings.
          </div>
        </div>
      </main>
    );
  }

  const vehicles: PendingVehicle[] =
    (data ?? []).map((vehicle: any) => ({
      id: vehicle.id,
      title: vehicle.title,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      currency: vehicle.currency,
      mileage: vehicle.mileage,
      country: vehicle.country,
      state: vehicle.state,
      city: vehicle.city,
      description: vehicle.description,
      condition: vehicle.condition,
      seller_type: vehicle.seller_type,
      seller_id: vehicle.seller_id,
      created_at: vehicle.created_at,
      images: (
        vehicle.car_images ?? []
      ).sort(
        (
          a: {
            sort_order: number;
          },
          b: {
            sort_order: number;
          }
        ) => a.sort_order - b.sort_order
      ),
      seller: vehicle.profiles
        ? {
            full_name:
              vehicle.profiles.full_name,
            email:
              vehicle.profiles.email,
            phone:
              vehicle.profiles.phone,
            user_type:
              vehicle.profiles.user_type,
          }
        : null,
    }));

  return (
    <main className="min-h-screen bg-[var(--fa-background)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/vehicles"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Vehicles
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
                <Clock3 size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-[var(--fa-text)]">
                  Pending Vehicles
                </h1>

                <p className="mt-1 text-gray-600">
                  Review vehicle listings submitted
                  by sellers.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-3">
            <p className="text-sm font-medium text-orange-700">
              Pending Listings
            </p>

            <p className="text-2xl font-bold text-orange-800">
              {vehicles.length}
            </p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="rounded-2xl border border-[var(--fa-border)] bg-white p-12 text-center shadow-sm">
            <CarFront
              size={46}
              className="mx-auto mb-4 text-gray-400"
            />

            <h2 className="text-xl font-bold text-[var(--fa-text)]">
              No pending vehicles
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no vehicle
              listings waiting for review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {vehicles.map((vehicle) => {
              const mainImage =
                vehicle.images[0];

              return (
                <article
                  key={vehicle.id}
                  className="overflow-hidden rounded-2xl border border-[var(--fa-border)] bg-white shadow-sm"
                >
                  <div className="grid lg:grid-cols-[280px_1fr]">
                    <div className="bg-gray-100">
                      {mainImage ? (
                        <img
                          src={mainImage.url}
                          alt={
                            mainImage.alt ||
                            vehicle.title
                          }
                          className="h-full min-h-64 w-full object-cover"
                        />
                      ) : (
                        <div className="flex min-h-64 items-center justify-center text-gray-400">
                          <CarFront size={48} />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              PENDING REVIEW
                            </span>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-600">
                              {vehicle.condition}
                            </span>
                          </div>

                          <h2 className="text-2xl font-bold text-[var(--fa-text)]">
                            {vehicle.title}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {vehicle.year}{" "}
                            {vehicle.make}{" "}
                            {vehicle.model}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-2xl font-bold text-[var(--fa-blue)]">
                            {formatPrice(
                              vehicle.price,
                              vehicle.currency
                            )}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatMileage(
                              vehicle.mileage
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <InfoItem
                          icon={<MapPin size={17} />}
                          label="Location"
                          value={[
                            vehicle.city,
                            vehicle.state,
                            vehicle.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        />

                        <InfoItem
                          icon={<User size={17} />}
                          label="Seller"
                          value={
                            vehicle.seller
                              ?.full_name ||
                            "Unknown seller"
                          }
                        />

                        <InfoItem
                          icon={<CarFront size={17} />}
                          label="Seller type"
                          value={formatSellerType(
                            vehicle.seller_type
                          )}
                        />

                        <InfoItem
                          icon={<Clock3 size={17} />}
                          label="Submitted"
                          value={new Date(
                            vehicle.created_at
                          ).toLocaleDateString(
                            "en-NG"
                          )}
                        />
                      </div>

                      <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-bold text-[var(--fa-text)]">
                          Description
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                          {vehicle.description}
                        </p>
                      </div>

                      {vehicle.seller && (
                        <div className="mt-5 rounded-xl border border-[var(--fa-border)] p-4">
                          <p className="mb-3 text-sm font-bold text-[var(--fa-text)]">
                            Seller Information
                          </p>

                          <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <p className="text-gray-600">
                              <span className="font-semibold text-[var(--fa-text)]">
                                Name:
                              </span>{" "}
                              {vehicle.seller.full_name}
                            </p>

                            <p className="text-gray-600">
                              <span className="font-semibold text-[var(--fa-text)]">
                                Email:
                              </span>{" "}
                              {vehicle.seller.email}
                            </p>

                            <p className="text-gray-600">
                              <span className="font-semibold text-[var(--fa-text)]">
                                Phone:
                              </span>{" "}
                              {vehicle.seller.phone ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fa-border)] bg-white px-5 py-3 font-semibold text-[var(--fa-text)] transition hover:bg-gray-50"
                        >
                          Review Vehicle
                        </Link>

                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white opacity-60"
                        >
                          <X size={18} />
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white opacity-60"
                        >
                          <Check size={18} />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[var(--fa-blue)]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-[var(--fa-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatSellerType(
  sellerType: string
): string {
  if (sellerType === "private_seller") {
    return "Private Seller";
  }

  if (sellerType === "dealer") {
    return "Dealer";
  }

  if (sellerType === "firmlac") {
    return "Firmlac";
  }

  return sellerType;
}