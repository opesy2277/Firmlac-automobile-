import VehicleStatusActions from "@/components/admin/VehicleStatusActions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  Edit3,
  ImagePlus,
  MapPin,
  User,
  X,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { formatMileage, formatPrice } from "@/lib/utils";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminVehicleReviewPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
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
      ),
      profiles:seller_id (
        id,
        full_name,
        email,
        phone,
        user_type
      )
    `)
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  const images = [...(vehicle.car_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const seller = Array.isArray(vehicle.profiles)
    ? vehicle.profiles[0]
    : vehicle.profiles;

  const status = vehicle.status;

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      {/* Header */}
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-8">
          <Link
            href="/admin/vehicles/pending"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:text-[var(--fa-navy)]"
          >
            <ArrowLeft size={17} />
            Back to Pending Vehicles
          </Link>

          <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Vehicle Review
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--fa-navy)]">
                {vehicle.title}
              </h1>

              <p className="mt-2 text-[var(--fa-text-secondary)]">
                Review this vehicle before approving or rejecting
                the listing.
              </p>
            </div>

            <StatusBadge status={status} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Main content */}

            {/* Vehicle Actions */}
            <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
            <h2 className="font-bold text-[var(--fa-text)]">
             Vehicle Actions
            </h2>

            <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
              Manage the current listing status.
            </p>

            <div className="mt-5">
              <VehicleStatusActions
                vehicleId={vehicle.id}
                status={status}
                markSoldAction={markVehicleSold}
                removeVehicleAction={removeVehicle}
              />
            </div>
          </section>

            <div className="space-y-6">
              {/* Images */}
              <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--fa-text)]">
                      Vehicle Images
                    </h2>

                    <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                      {images.length} image
                      {images.length === 1 ? "" : "s"} uploaded
                    </p>
                  </div>

                  <Link
                    href={`/admin/vehicles/${vehicle.id}/images`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--fa-blue)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--fa-navy)]"
                  >
                    <ImagePlus size={17} />
                    Manage Images
                  </Link>
                </div>

                {images.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--fa-border)] bg-slate-50 p-10 text-center">
                    <ImagePlus
                      size={38}
                      className="mx-auto text-[var(--fa-blue)]"
                    />

                    <p className="mt-3 font-semibold text-[var(--fa-text)]">
                      No vehicle images
                    </p>

                    <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                      Add images before publishing the vehicle.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative overflow-hidden rounded-xl border border-[var(--fa-border)] bg-slate-100"
                      >
                        <img
                          src={image.url}
                          alt={
                            image.alt ||
                            `${vehicle.title} image ${index + 1}`
                          }
                          className="aspect-[4/3] h-full w-full object-cover"
                        />

                        {image.sort_order === 1 && (
                          <span className="absolute left-3 top-3 rounded-lg bg-[var(--fa-navy)] px-3 py-1.5 text-xs font-bold text-white">
                            Main Image
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Vehicle information */}
              <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--fa-text)]">
                      Vehicle Information
                    </h2>

                    <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                      Review the information submitted for this vehicle.
                    </p>
                  </div>

                  <Link
                    href={`/admin/vehicles/${vehicle.id}/edit`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--fa-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--fa-blue)] transition hover:border-[var(--fa-blue)] hover:bg-blue-50"
                  >
                    <Edit3 size={17} />
                    Edit
                  </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Title"
                    value={vehicle.title}
                  />

                  <InfoItem
                    label="Make"
                    value={vehicle.make}
                  />

                  <InfoItem
                    label="Model"
                    value={vehicle.model}
                  />

                  <InfoItem
                    label="Year"
                    value={String(vehicle.year)}
                  />

                  <InfoItem
                    label="Price"
                    value={formatPrice(
                      vehicle.price,
                      vehicle.currency
                    )}
                  />

                  <InfoItem
                    label="Mileage"
                    value={formatMileage(vehicle.mileage)}
                  />

                  <InfoItem
                    label="Condition"
                    value={capitalize(vehicle.condition)}
                  />

                  <InfoItem
                    label="Seller Type"
                    value={formatSellerType(vehicle.seller_type)}
                  />

                  <InfoItem
                    label="Country"
                    value={vehicle.country}
                  />

                  <InfoItem
                    label="State"
                    value={vehicle.state || "Not provided"}
                  />

                  <InfoItem
                    label="City"
                    value={vehicle.city}
                  />

                  <InfoItem
                    label="Submitted"
                    value={formatDate(vehicle.created_at)}
                  />
                </div>

                <div className="mt-6 border-t border-[var(--fa-border)] pt-6">
                  <h3 className="text-sm font-bold text-[var(--fa-text)]">
                    Description
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--fa-text-secondary)]">
                    {vehicle.description || "No description provided."}
                  </p>
                </div>
              </section>

              {/* Seller */}
              <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
                    <User size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[var(--fa-text)]">
                      Seller Information
                    </h2>

                    <p className="text-sm text-[var(--fa-text-secondary)]">
                      Account associated with this listing.
                    </p>
                  </div>
                </div>

                {seller ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Name"
                      value={seller.full_name || "Not provided"}
                    />

                    <InfoItem
                      label="Email"
                      value={seller.email || "Not provided"}
                    />

                    <InfoItem
                      label="Phone"
                      value={seller.phone || "Not provided"}
                    />

                    <InfoItem
                      label="Account Type"
                      value={formatSellerType(
                        seller.user_type
                      )}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-[var(--fa-text-secondary)]">
                    No seller profile was found for this listing.
                  </p>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Location */}
              <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--fa-blue)]">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--fa-text)]">
                      Location
                    </h2>

                    <p className="text-sm text-[var(--fa-text-secondary)]">
                      Vehicle location
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm font-semibold leading-6 text-[var(--fa-text)]">
                  {[vehicle.city, vehicle.state, vehicle.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </section>

              {/* Review actions */}
              {status === "pending" && (
                <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock3 size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-[var(--fa-text)]">
                        Review Decision
                      </h2>

                      <p className="text-sm text-[var(--fa-text-secondary)]">
                        Choose what happens to this listing.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <form
                      action={approveVehicle}
                      className="w-full"
                    >
                      <input
                        type="hidden"
                        name="vehicleId"
                        value={vehicle.id}
                      />

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                      >
                        <Check size={18} />
                        Approve Vehicle
                      </button>
                    </form>

                    <form
                      action={rejectVehicle}
                      className="w-full"
                    >
                      <input
                        type="hidden"
                        name="vehicleId"
                        value={vehicle.id}
                      />

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                      >
                        <X size={18} />
                        Reject Vehicle
                      </button>
                    </form>
                  </div>
                </section>
              )}

              {/* Status */}
              <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
                <h2 className="font-bold text-[var(--fa-text)]">
                  Listing Status
                </h2>

                <div className="mt-4">
                  <StatusBadge status={status} />
                </div>

                <div className="mt-5 space-y-3 border-t border-[var(--fa-border)] pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--fa-text-secondary)]">
                      Created
                    </span>

                    <span className="font-semibold text-[var(--fa-text)]">
                      {formatDate(vehicle.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--fa-text-secondary)]">
                      Updated
                    </span>

                    <span className="font-semibold text-[var(--fa-text)]">
                      {formatDate(vehicle.updated_at)}
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

/*
 * --------------------------------------------------
 * ACTIONS
 * --------------------------------------------------
 */

async function approveVehicle(formData: FormData) {
  "use server";

  await requireAdmin();

  const vehicleId = formData.get("vehicleId");

  if (typeof vehicleId !== "string" || !vehicleId) {
    redirect("/admin/vehicles/pending");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("car_listings")
    .update({
      status: "active",
    })
    .eq("id", vehicleId)
    .eq("status", "pending");

  if (error) {
    throw new Error(
      `Could not approve vehicle: ${error.message}`
    );
  }

  redirect(`/admin/vehicles/${vehicleId}`);
}

async function rejectVehicle(formData: FormData) {
  "use server";

  await requireAdmin();

  const vehicleId = formData.get("vehicleId");

  if (typeof vehicleId !== "string" || !vehicleId) {
    redirect("/admin/vehicles/pending");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("car_listings")
    .update({
      status: "rejected",
    })
    .eq("id", vehicleId)
    .eq("status", "pending");

  if (error) {
    throw new Error(
      `Could not reject vehicle: ${error.message}`
    );
  }

  redirect(`/admin/vehicles/${vehicleId}`);
}

async function markVehicleSold(formData: FormData) {
  "use server";

  await requireAdmin();

  const vehicleId = formData.get("vehicleId");

  if (typeof vehicleId !== "string" || !vehicleId) {
    redirect("/admin/vehicles");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("car_listings")
    .update({
      status: "sold",
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId)
    .eq("status", "active");

  if (error) {
    throw new Error(
      `Could not mark vehicle as sold: ${error.message}`
    );
  }

  redirect(`/admin/vehicles/${vehicleId}`);
}

async function removeVehicle(formData: FormData) {
  "use server";

  await requireAdmin();

  const vehicleId = formData.get("vehicleId");

  if (typeof vehicleId !== "string" || !vehicleId) {
    redirect("/admin/vehicles");
  }

  const supabase = await createClient();

  /*
   * Get all image URLs before deleting the vehicle.
   * car_images has ON DELETE CASCADE, so deleting
   * the vehicle will also delete the database records.
   */
  const { data: images, error: imageQueryError } =
    await supabase
      .from("car_images")
      .select("url")
      .eq("car_id", vehicleId);

  if (imageQueryError) {
    throw new Error(
      `Could not prepare vehicle removal: ${imageQueryError.message}`
    );
  }

  const storagePaths = (images ?? [])
    .map((image) => getStoragePathFromUrl(image.url))
    .filter((path): path is string => Boolean(path));

  /*
   * Delete the vehicle.
   * Its car_images database records will be removed
   * automatically through ON DELETE CASCADE.
   */
  const { error: deleteError } = await supabase
    .from("car_listings")
    .delete()
    .eq("id", vehicleId);

  if (deleteError) {
    throw new Error(
      `Could not remove vehicle: ${deleteError.message}`
    );
  }

  /*
   * Remove the physical image files from Supabase Storage.
   * If storage cleanup fails, the vehicle itself has already
   * been removed, so we don't pretend the deletion failed.
   */
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("car-images")
      .remove(storagePaths);

    if (storageError) {
      console.error(
        "Vehicle storage cleanup failed:",
        storageError.message
      );
    }
  }

  redirect("/admin/vehicles");
}

function getStoragePathFromUrl(
  url: string
): string | null {
  try {
    const parsedUrl = new URL(url);

    const marker =
      "/storage/v1/object/public/car-images/";

    const index =
      parsedUrl.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const storagePath =
      parsedUrl.pathname.slice(
        index + marker.length
      );

    if (!storagePath) {
      return null;
    }

    return decodeURIComponent(storagePath);
  } catch {
    return null;
  }
}

/*
 * --------------------------------------------------
 * UI HELPERS
 * --------------------------------------------------
 */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--fa-text-secondary)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[var(--fa-text)]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    pending: {
      label: "Pending Review",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },
    active: {
      label: "Active",
      className:
        "bg-green-50 text-green-700 border-green-200",
    },
    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
    sold: {
      label: "Sold",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    },
    draft: {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  const current = config[status] ?? {
    label: status,
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSellerType(value: string) {
  if (value === "private_seller") {
    return "Private Seller";
  }

  if (value === "dealer") {
    return "Dealer";
  }

  if (value === "firmlac") {
    return "Firmlac";
  }

  if (value === "admin") {
    return "Admin";
  }

  return value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}


