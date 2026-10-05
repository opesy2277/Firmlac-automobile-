"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function EditAccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        setEmail(user.email ?? "");

        const { data: profile, error } =
          await supabase
            .from("profiles")
            .select(
              `
                full_name,
                email,
                phone,
                country,
                city
              `
            )
            .eq("id", user.id)
            .single();

        if (error) {
          throw new Error(
            `Could not load profile: ${error.message}`
          );
        }

        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setCountry(profile.country ?? "");
        setCity(profile.city ?? "");

        if (profile.email) {
          setEmail(profile.email);
        }
      } catch (error) {
        console.error(
          "LOAD PROFILE ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanCountry = country.trim();
    const cleanCity = city.trim();

    if (!cleanName) {
      setErrorMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!cleanCountry) {
      setErrorMessage(
        "Please enter your country."
      );
      return;
    }

    if (!cleanCity) {
      setErrorMessage(
        "Please enter your city."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: cleanName,
          phone: cleanPhone || null,
          country: cleanCountry,
          city: cleanCity,
        })
        .eq("id", user.id);

      if (error) {
        throw new Error(
          `Could not update profile: ${error.message}`
        );
      }

      setSuccessMessage(
        "Your profile has been updated successfully."
      );

      router.refresh();

      setTimeout(() => {
        router.push("/account");
      }, 800);
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--fa-background)]">
        <div className="container flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-[var(--fa-text-secondary)]">
            <Loader2
              size={21}
              className="animate-spin"
            />
            Loading your profile...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--fa-background)]">
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fa-blue)] hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Account
          </Link>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
              <UserRound size={24} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Firmlac Automobile
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--fa-navy)] sm:text-3xl">
                Edit Profile
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-[var(--fa-shadow-md)] sm:p-8">
            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-xl border border-[var(--fa-border)] bg-gray-50 px-4 text-sm text-gray-500 outline-none"
                />

                <p className="mt-2 text-xs text-[var(--fa-text-secondary)]">
                  Your email address cannot be changed
                  here.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                />
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--fa-text)]"
                >
                  <MapPin size={17} />
                  Country
                </label>

                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value)
                  }
                  placeholder="Enter your country"
                  autoComplete="country-name"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  placeholder="Enter your city"
                  autoComplete="address-level2"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                />
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] px-5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Save size={19} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}