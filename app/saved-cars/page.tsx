import Link from "next/link";
import { Heart, ArrowLeft, CarFront } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CarCard from "@/components/cars/CarCard";

export default async function SavedCarsPage() {
  const supabase = await createClient();

  /*
   * Check the logged-in user.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * User must be logged in to access saved cars.
   */
  if (!user) {
    redirect("/login");
  }

  /*
   * Load the user's saved cars together with
   * the vehicle information and vehicle images.
   */
  const { data: savedCars, error } = await supabase
    .from("saved_cars")
    .select(`
      car_id,
      created_at,
      car_listings (
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
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load saved cars: ${error.message}`
    );
  }

  /*
   * Convert Supabase data into the Car structure
   * expected by CarCard.
   */
  const cars = (savedCars ?? [])
    .map((item: any) => {
      const car = item.car_listings;

      if (!car) {
        return null;
      }

      return {
        id: car.id,
        title: car.title,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        currency: car.currency,
        mileage: car.mileage,
        country: car.country,
        state: car.state,
        city: car.city,
        description: car.description,
        condition: car.condition,
        sellerType: car.seller_type,
        sellerId: car.seller_id,
        status: car.status,
        createdAt: car.created_at,
        updatedAt: car.updated_at,

        images: (car.car_images ?? [])
          .sort(
            (a: any, b: any) =>
              a.sort_order - b.sort_order
          )
          .map((image: any) => ({
            id: image.id,
            url: image.url,
            alt:
              image.alt ||
              `${car.year} ${car.make} ${car.model}`,
            sortOrder: image.sort_order,
          })),
      };
    })
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      {/* Header */}
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-8">
          <Link
            href="/cars"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Buy Cars
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fa-red)] text-white">
              <Heart
                size={24}
                fill="currentColor"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--fa-navy)] sm:text-3xl">
                Saved Cars
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Cars you have saved for later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-8">
        {cars.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[var(--fa-border)] bg-white px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-[var(--fa-navy)]">
              <CarFront size={30} />
            </div>

            <h2 className="text-xl font-bold text-[var(--fa-navy)]">
              No saved cars yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
              When you find a car you like, click the heart
              icon to save it here.
            </p>

            <Link
              href="/cars"
              className="mt-6 rounded-xl bg-[var(--fa-red)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--fa-navy)]">
                  Your Saved Vehicles
                </h2>

                <p className="text-sm text-gray-600">
                  {cars.length}{" "}
                  {cars.length === 1
                    ? "saved car"
                    : "saved cars"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car: any) => (
                <CarCard
                  key={car.id}
                  car={car}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}