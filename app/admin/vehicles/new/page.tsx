import Link from "next/link";
import { ArrowLeft, CarFront } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import VehicleForm from "@/components/admin/VehicleForm";

export default async function NewVehiclePage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-8">
          <Link
            href="/admin/vehicles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:text-[var(--fa-navy)]"
          >
            <ArrowLeft size={17} />
            Back to Vehicle Management
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
              <CarFront size={24} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Vehicle Management
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--fa-navy)]">
                Add New Vehicle
              </h1>

              <p className="mt-2 text-[var(--fa-text-secondary)]">
                Create a new vehicle listing for the Firmlac Automobile
                marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm sm:p-8">
            <VehicleForm />
          </div>
        </div>
      </section>
    </main>
  );
}