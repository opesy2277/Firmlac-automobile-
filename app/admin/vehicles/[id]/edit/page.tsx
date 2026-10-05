import Link from "next/link";
import { ArrowLeft, CarFront, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function updateVehicle(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Vehicle ID is missing.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = Number(formData.get("year"));
  const price = Number(formData.get("price"));
  const mileage = Number(formData.get("mileage"));
  const currency = String(formData.get("currency") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();
  const condition = String(formData.get("condition") ?? "");
  const sellerType = String(
    formData.get("seller_type") ?? ""
  );

  if (!title || !make || !model || !country || !city) {
    throw new Error(
      "Title, make, model, country, and city are required."
    );
  }

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("Please enter a valid vehicle year.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Please enter a valid price.");
  }

  if (!Number.isInteger(mileage) || mileage < 0) {
    throw new Error("Please enter valid mileage.");
  }

  if (!["new", "used"].includes(condition)) {
    throw new Error("Invalid vehicle condition.");
  }

  if (
    !["firmlac", "dealer", "private_seller"].includes(
      sellerType
    )
  ) {
    throw new Error("Invalid seller type.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("car_listings")
    .update({
      title,
      make,
      model,
      year,
      price,
      mileage,
      currency,
      country,
      state: state || null,
      city,
      description,
      condition,
      seller_type: sellerType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Could not update vehicle: ${error.message}`
    );
  }

  redirect(`/admin/vehicles/${id}`);
}

export default async function EditVehiclePage({
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
      status
    `)
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={`/admin/vehicles/${vehicle.id}`}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#1557c0] hover:underline"
            >
              <ArrowLeft size={18} />
              Back to Vehicle
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a3d] text-white">
                <CarFront size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#101828]">
                  Edit Vehicle
                </h1>

                <p className="text-sm text-[#667085]">
                  Update the vehicle information.
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/admin/vehicles/${vehicle.id}/images`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1557c0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f46a3]"
          >
            Manage Images
          </Link>
        </div>

        <form
          action={updateVehicle}
          className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm"
        >
          <input
            type="hidden"
            name="id"
            value={vehicle.id}
          />

          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#101828]">
              Vehicle Information
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              Changes made here affect the vehicle listing shown
              to customers.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Listing Title
              </label>

              <input
                id="title"
                name="title"
                required
                defaultValue={vehicle.title}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="make"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Make
              </label>

              <input
                id="make"
                name="make"
                required
                defaultValue={vehicle.make}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="model"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Model
              </label>

              <input
                id="model"
                name="model"
                required
                defaultValue={vehicle.model}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Year
              </label>

              <input
                id="year"
                name="year"
                type="number"
                required
                defaultValue={vehicle.year}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="mileage"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Mileage
              </label>

              <input
                id="mileage"
                name="mileage"
                type="number"
                min="0"
                required
                defaultValue={vehicle.mileage}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={vehicle.price}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Currency
              </label>

              <select
                id="currency"
                name="currency"
                defaultValue={vehicle.currency}
                className="w-full rounded-lg border border-[#e4e7ec] bg-white px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              >
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="country"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Country
              </label>

              <input
                id="country"
                name="country"
                required
                defaultValue={vehicle.country}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                State / Region
              </label>

              <input
                id="state"
                name="state"
                defaultValue={vehicle.state ?? ""}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                City
              </label>

              <input
                id="city"
                name="city"
                required
                defaultValue={vehicle.city}
                className="w-full rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              />
            </div>

            <div>
              <label
                htmlFor="condition"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Condition
              </label>

              <select
                id="condition"
                name="condition"
                defaultValue={vehicle.condition}
                className="w-full rounded-lg border border-[#e4e7ec] bg-white px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="seller_type"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Seller Type
              </label>

              <select
                id="seller_type"
                name="seller_type"
                defaultValue={vehicle.seller_type}
                className="w-full rounded-lg border border-[#e4e7ec] bg-white px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
              >
                <option value="firmlac">Firmlac</option>
                <option value="dealer">Dealer</option>
                <option value="private_seller">
                  Private Seller
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-[#101828]"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={7}
                defaultValue={vehicle.description ?? ""}
                className="w-full resize-y rounded-lg border border-[#e4e7ec] px-4 py-3 text-sm outline-none focus:border-[#1557c0]"
                placeholder="Describe the vehicle..."
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#e4e7ec] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#667085]">
              Current status:{" "}
              <span className="font-semibold capitalize text-[#101828]">
                {vehicle.status}
              </span>
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1557c0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f46a3]"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}