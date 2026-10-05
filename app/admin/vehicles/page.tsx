import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Edit3,
  ImagePlus,
  Plus,
  Clock3,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { formatMileage, formatPrice } from "@/lib/utils";

type VehicleStatus =
  | "pending"
  | "active"
  | "sold"
  | "rejected"
  | "draft";

export default async function AdminVehiclesPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: vehicles, error } = await supabase
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
      condition,
      status,
      created_at,
      car_images (
        id,
        url,
        alt,
        sort_order
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Could not load vehicles: ${error.message}`
    );
  }

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:text-[var(--fa-navy)]"
          >
            <ArrowLeft size={17} />
            Back to Admin
          </Link>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
                <CarFront size={24} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                  Vehicle Management
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--fa-navy)]">
                  All Vehicles
                </h1>

                <p className="mt-2 text-[var(--fa-text-secondary)]">
                  Review, edit, approve, and manage vehicle listings.
                </p>
              </div>
            </div>

            <Link
              href="/admin/vehicles/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Add New Vehicle
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--fa-border)] bg-white p-12 text-center">
              <CarFront
                size={45}
                className="mx-auto text-[var(--fa-text-secondary)]"
              />

              <h2 className="mt-4 text-xl font-bold text-[var(--fa-text)]">
                No vehicles yet
              </h2>

              <p className="mt-2 text-sm text-[var(--fa-text-secondary)]">
                Create your first vehicle listing to get started.
              </p>

              <Link
                href="/admin/vehicles/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--fa-blue)] px-5 py-3 text-sm font-bold text-white"
              >
                <Plus size={18} />
                Add New Vehicle
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--fa-text-secondary)]">
                  {vehicles.length} vehicle
                  {vehicles.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {vehicles.map((vehicle) => {
                  const images = [...(vehicle.car_images ?? [])].sort(
                    (a, b) => a.sort_order - b.sort_order
                  );

                  const mainImage = images[0];

                  return (
                    <article
                      key={vehicle.id}
                      className="overflow-hidden rounded-2xl border border-[var(--fa-border)] bg-white shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="h-56 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-56">
                          {mainImage ? (
                            <img
                              src={mainImage.url}
                              alt={
                                mainImage.alt ||
                                `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                              }
                              className="h-full min-h-56 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full min-h-56 items-center justify-center text-[var(--fa-text-secondary)]">
                              <CarFront size={45} />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="truncate text-lg font-bold text-[var(--fa-text)]">
                                {vehicle.title}
                              </h2>

                              <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                                {vehicle.year} {vehicle.make}{" "}
                                {vehicle.model}
                              </p>
                            </div>

                            <StatusBadge status={vehicle.status} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-[var(--fa-text-secondary)]">
                                Price
                              </p>

                              <p className="mt-1 font-bold text-[var(--fa-text)]">
                                {formatPrice(
                                  vehicle.price,
                                  vehicle.currency
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[var(--fa-text-secondary)]">
                                Mileage
                              </p>

                              <p className="mt-1 font-bold text-[var(--fa-text)]">
                                {formatMileage(vehicle.mileage)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-[var(--fa-text-secondary)]">
                            {[
                              vehicle.city,
                              vehicle.state,
                              vehicle.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--fa-border)] pt-4">
                            <Link
                              href={`/admin/vehicles/${vehicle.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--fa-blue)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[var(--fa-navy)]"
                            >
                              Review
                              <ArrowRight size={15} />
                            </Link>

                            <Link
                              href={`/admin/vehicles/${vehicle.id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--fa-border)] bg-white px-3 py-2 text-xs font-bold text-[var(--fa-blue)] transition hover:border-[var(--fa-blue)]"
                            >
                              <Edit3 size={15} />
                              Edit
                            </Link>

                            <Link
                              href={`/admin/vehicles/${vehicle.id}/images`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--fa-border)] bg-white px-3 py-2 text-xs font-bold text-[var(--fa-blue)] transition hover:border-[var(--fa-blue)]"
                            >
                              <ImagePlus size={15} />
                              Images
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: VehicleStatus | string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
      icon: typeof Clock3;
    }
  > = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },
    active: {
      label: "Active",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    sold: {
      label: "Sold",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CircleDollarSign,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
    draft: {
      label: "Draft",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Clock3,
    },
  };

  const current = config[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock3,
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${current.className}`}
    >
      <Icon size={13} />
      {current.label}
    </span>
  );
}