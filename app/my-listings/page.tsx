"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CarFront,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatMileage, formatPrice } from "@/lib/utils";

type ListingStatus =
  | "pending"
  | "active"
  | "sold"
  | "rejected"
  | "draft";

interface CarImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

interface Listing {
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
  seller_type: string;
  seller_id: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  car_images: CarImage[];
}

function getStatusStyles(status: ListingStatus) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        className:
          "bg-green-50 text-green-700 border-green-200",
      };

    case "pending":
      return {
        label: "Pending",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
      };

    case "sold":
      return {
        label: "Sold",
        className:
          "bg-gray-100 text-gray-700 border-gray-200",
      };

    case "rejected":
      return {
        label: "Rejected",
        className:
          "bg-red-50 text-red-700 border-red-200",
      };

    case "draft":
      return {
        label: "Draft",
        className:
          "bg-blue-50 text-blue-700 border-blue-200",
      };

    default:
      return {
        label: status,
        className:
          "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
}

function getStoragePathFromUrl(
  url: string
): string | null {
  try {
    const parsedUrl = new URL(url);

    const marker =
      "/storage/v1/object/public/car-images/";

    const pathname = parsedUrl.pathname;

    const index = pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const path = pathname.slice(
      index + marker.length
    );

    if (!path) {
      return null;
    }

    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export default function MyListingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [listings, setListings] = useState<Listing[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadListings() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error: listingsError } =
        await supabase
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
          .eq("seller_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (listingsError) {
        throw new Error(
          listingsError.message
        );
      }

      const formattedListings: Listing[] =
        (data ?? []).map((listing: any) => ({
          ...listing,
          car_images: (
            listing.car_images ?? []
          ).sort(
            (a: CarImage, b: CarImage) =>
              a.sort_order - b.sort_order
          ),
        }));

      setListings(formattedListings);
    } catch (err) {
      console.error(
        "MY LISTINGS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your listings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function deleteListing(
    listing: Listing
  ) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(listing.id);
    setError("");

    try {
      /*
       * Get the current user again before deleting.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      /*
       * Delete database image records first.
       */
      if (listing.car_images.length > 0) {
        const { error: imagesError } =
          await supabase
            .from("car_images")
            .delete()
            .eq("car_id", listing.id);

        if (imagesError) {
          throw new Error(
            `Could not delete vehicle images: ${imagesError.message}`
          );
        }
      }

      /*
       * Delete the actual Storage files.
       *
       * External image URLs such as Unsplash are
       * ignored automatically.
       */
      const storagePaths =
        listing.car_images
          .map((image) =>
            getStoragePathFromUrl(image.url)
          )
          .filter(
            (
              path
            ): path is string =>
              Boolean(path)
          );

      if (storagePaths.length > 0) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("car-images")
          .remove(storagePaths);

        if (storageError) {
          console.warn(
            "STORAGE CLEANUP WARNING:",
            storageError.message
          );
        }
      }

      /*
       * Delete the vehicle listing.
       *
       * seller_id is included as an extra safety
       * condition.
       */
      const {
        error: listingError,
      } = await supabase
        .from("car_listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", user.id);

      if (listingError) {
        throw new Error(
          `Could not delete listing: ${listingError.message}`
        );
      }

      setListings((current) =>
        current.filter(
          (item) => item.id !== listing.id
        )
      );
    } catch (err) {
      console.error(
        "DELETE LISTING ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this listing."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--fa-background)]">
        <div className="container py-10">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex items-center gap-3 text-[var(--fa-text-secondary)]">
              <Loader2
                size={22}
                className="animate-spin"
              />
              <span>Loading your listings...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      <div className="container py-8 sm:py-10">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/account"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:underline"
            >
              <ArrowLeft size={17} />
              Back to Account
            </Link>

            <h1 className="text-2xl font-bold text-[var(--fa-navy)] sm:text-3xl">
              My Listings
            </h1>

            <p className="mt-2 text-sm text-[var(--fa-text-secondary)]">
              Manage the vehicles you have listed
              on Firmlac Automobile.
            </p>
          </div>

          <Link
            href="/sell-car"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] px-5 text-sm font-bold text-white transition hover:brightness-95"
          >
            <Plus size={19} />
            Sell a Car
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--fa-border)] bg-white p-4">
            <p className="text-xs font-medium text-[var(--fa-text-secondary)]">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-[var(--fa-navy)]">
              {listings.length}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--fa-border)] bg-white p-4">
            <p className="text-xs font-medium text-[var(--fa-text-secondary)]">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {
                listings.filter(
                  (item) =>
                    item.status === "active"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-[var(--fa-border)] bg-white p-4">
            <p className="text-xs font-medium text-[var(--fa-text-secondary)]">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-600">
              {
                listings.filter(
                  (item) =>
                    item.status === "pending"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-[var(--fa-border)] bg-white p-4">
            <p className="text-xs font-medium text-[var(--fa-text-secondary)]">
              Sold
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-700">
              {
                listings.filter(
                  (item) =>
                    item.status === "sold"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Empty state */}
        {listings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[var(--fa-border)] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fa-background)] text-[var(--fa-blue)]">
              <CarFront size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[var(--fa-navy)]">
              You don't have any listings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fa-text-secondary)]">
              When you list a vehicle, it will appear
              here so you can manage it.
            </p>

            <Link
              href="/sell-car"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--fa-red)] px-5 text-sm font-bold text-white transition hover:brightness-95"
            >
              <Plus size={19} />
              Sell Your Car
            </Link>
          </div>
        )}

        {/* Listings */}
        {listings.length > 0 && (
          <div className="mt-8 space-y-5">
            {listings.map((listing) => {
              const status =
                getStatusStyles(
                  listing.status
                );

              const mainImage =
                listing.car_images[0]?.url;

              const location = [
                listing.city,
                listing.state,
                listing.country,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl border border-[var(--fa-border)] bg-white shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row">

                    {/* Image */}
                    <div className="relative h-56 w-full shrink-0 bg-gray-100 sm:h-64 lg:h-52 lg:w-80">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={
                            listing.car_images[0]
                              ?.alt ||
                            listing.title
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <CarFront
                            size={48}
                          />
                        </div>
                      )}

                      <span
                        className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-[var(--fa-navy)] sm:text-xl">
                            {listing.title}
                          </h2>

                          <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                            {listing.year}{" "}
                            {listing.make}{" "}
                            {listing.model}
                          </p>
                        </div>

                        <p className="shrink-0 text-xl font-bold text-[var(--fa-red)]">
                          {formatPrice(
                            listing.price,
                            listing.currency
                          )}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--fa-text-secondary)]">
                        <span>
                          {formatMileage(
                            listing.mileage
                          )}
                        </span>

                        <span className="text-gray-300">
                          |
                        </span>

                        <span className="capitalize">
                          {listing.condition}
                        </span>

                        {location && (
                          <>
                            <span className="text-gray-300">
                              |
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <MapPin
                                size={16}
                              />
                              {location}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        <Link
                          href={`/cars/${listing.id}`}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--fa-border)] px-4 text-sm font-semibold text-[var(--fa-text)] transition hover:border-[var(--fa-blue)] hover:text-[var(--fa-blue)]"
                        >
                          <Eye size={17} />
                          View
                        </Link>

                        <Link
                          href={`/my-listings/${listing.id}/edit`}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--fa-border)] px-4 text-sm font-semibold text-[var(--fa-text)] transition hover:border-[var(--fa-blue)] hover:text-[var(--fa-blue)]"
                        >
                          <Pencil size={17} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            listing.id
                          }
                          onClick={() =>
                            deleteListing(
                              listing
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId ===
                          listing.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={17}
                            />
                          )}

                          {deletingId ===
                          listing.id
                            ? "Deleting..."
                            : "Delete"}
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