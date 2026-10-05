import Link from "next/link";
import { ArrowLeft, CarFront } from "lucide-react";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import VehicleImageManager from "@/components/admin/VehicleImageManager";

type PageProps = {
  searchParams: Promise<{
    vehicle?: string;
  }>;
};

export default async function AdminImagesPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const { vehicle: vehicleId } = await searchParams;

  if (!vehicleId) {
    notFound();
  }

  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from("car_listings")
    .select(`
      id,
      title,
      make,
      model,
      year
    `)
    .eq("id", vehicleId)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  const vehicleName =
    `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/admin/vehicles/${vehicle.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#1557c0] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Vehicle
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a3d] text-white">
            <CarFront size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#101828]">
              Vehicle Images
            </h1>

            <p className="text-sm text-[#667085]">
              {vehicleName} — {vehicle.title}
            </p>
          </div>
        </div>

        <VehicleImageManager
          vehicleId={vehicle.id}
          vehicleName={vehicleName}
        />
      </div>
    </main>
  );
}