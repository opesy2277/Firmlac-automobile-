import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Heart,
  LogOut,
  MapPin,
  Pencil,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  /*
   * Get the currently signed-in user.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Account page requires authentication.
   */
  if (!user) {
    redirect("/login");
  }

  /*
   * Load the user's profile.
   *
   * Your profiles table uses user_type,
   * not role.
   */
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        email,
        phone,
        country,
        city,
        avatar_url,
        user_type
      `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(
      "ACCOUNT PROFILE ERROR:",
      error
    );
  }

  /*
   * Count saved cars.
   */
  const { count: savedCarsCount } =
    await supabase
      .from("saved_cars")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

  /*
   * Count the user's vehicle listings.
   */
  const { count: listingsCount } =
    await supabase
      .from("car_listings")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("seller_id", user.id);

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      {/* Page Header */}
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fa-navy)] text-white">
              <UserRound size={28} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Firmlac Automobile
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--fa-navy)] sm:text-3xl">
                My Account
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Profile */}
          <div className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-[var(--fa-shadow-sm)] sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-bold text-[var(--fa-navy)]">
                  Profile Information
                </h2>

                <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                  Your Firmlac Automobile account details.
                </p>
              </div>

              <Link
                href="/account/edit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fa-border)] px-4 py-2.5 text-sm font-bold text-[var(--fa-text)] transition hover:border-[var(--fa-blue)] hover:text-[var(--fa-blue)]"
              >
                <Pencil size={16} />
                Edit Profile
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--fa-navy)] text-white">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={
                      profile.full_name ||
                      "Profile photo"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={38} />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[var(--fa-navy)]">
                  {profile?.full_name ||
                    "Firmlac User"}
                </h3>

                <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                  {profile?.email ||
                    user.email ||
                    "No email available"}
                </p>

                {profile?.user_type && (
                  <span className="mt-3 inline-flex rounded-full bg-[var(--fa-background)] px-3 py-1 text-xs font-bold capitalize text-[var(--fa-navy)]">
                    {profile.user_type.replace(
                      "_",
                      " "
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--fa-border)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fa-text-secondary)]">
                  <MapPin size={17} />
                  Location
                </div>

                <p className="mt-2 font-semibold text-[var(--fa-text)]">
                  {[
                    profile?.city,
                    profile?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                    "Location not provided"}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--fa-border)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fa-text-secondary)]">
                  <UserRound size={17} />
                  Phone
                </div>

                <p className="mt-2 font-semibold text-[var(--fa-text)]">
                  {profile?.phone ||
                    "Phone not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-4">
            {/* Saved Cars */}
            <Link
              href="/saved-cars"
              className="group block rounded-2xl border border-[var(--fa-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--fa-red)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[var(--fa-red)]">
                    <Heart
                      size={21}
                      fill="currentColor"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-[var(--fa-navy)]">
                      Saved Cars
                    </h3>

                    <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                      {savedCarsCount ?? 0}{" "}
                      saved{" "}
                      {(savedCarsCount ?? 0) === 1
                        ? "car"
                        : "cars"}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={20}
                  className="text-[var(--fa-text-secondary)] transition group-hover:translate-x-1 group-hover:text-[var(--fa-red)]"
                />
              </div>
            </Link>

            {/* My Listings */}
            <Link
              href="/my-listings"
              className="group block rounded-2xl border border-[var(--fa-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--fa-blue)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[var(--fa-blue)]">
                    <CarFront size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[var(--fa-navy)]">
                      My Listings
                    </h3>

                    <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
                      {listingsCount ?? 0}{" "}
                      {listingsCount === 1
                        ? "vehicle"
                        : "vehicles"}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={20}
                  className="text-[var(--fa-text-secondary)] transition group-hover:translate-x-1 group-hover:text-[var(--fa-blue)]"
                />
              </div>
            </Link>

            {/* Sign Out */}
            <form
              action={async () => {
                "use server";

                const supabase =
                  await createClient();

                await supabase.auth.signOut();

                redirect("/");
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3.5 text-sm font-bold text-[var(--fa-red)] transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}