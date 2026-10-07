
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CarFront,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type UserType = "buyer" | "dealer" | "private_seller";

function getFriendlyAuthError(error: {
  message?: string;
  status?: number;
}) {
  const message = (error.message || "").toLowerCase();

  if (
    error.status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("too many attempts") ||
    message.includes("security purposes") ||
    message.includes("email rate limit")
  ) {
    return "Too many registration attempts were made. Please wait a while before trying again.";
  }

  if (
    message.includes("already registered") ||
    message.includes("user already registered") ||
    message.includes("email already exists") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (message.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (
    message.includes("password") &&
    (message.includes("weak") ||
      message.includes("characters") ||
      message.includes("at least"))
  ) {
    return "Your password does not meet the required security rules.";
  }

  if (
    message.includes("signup is disabled") ||
    message.includes("signups not allowed")
  ) {
    return "New account registration is currently unavailable. Please try again later.";
  }

  if (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("fetch failed")
  ) {
    return "A network error occurred. Please check your internet connection and try again.";
  }

  return "We could not create your account right now. Please try again.";
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.8a20 20 0 0 0 0 18l6.8-5.2Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.2C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [userType, setUserType] = useState<UserType>("buyer");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBusy = loading || googleLoading;

  async function handleGoogleSignIn() {
    if (isBusy) return;

    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const supabase = createClient();

      const { data, error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/account`,
          },
        });

      if (googleError) {
        setError(getFriendlyAuthError(googleError));
        setGoogleLoading(false);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      setError("Google sign-in could not be started. Please try again.");
      setGoogleLoading(false);
    } catch (err) {
      console.error("Google registration error:", err);
      setError(
        "Unable to continue with Google. Please check your connection and try again."
      );
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) return;

    setError("");
    setSuccess("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanCountry = country.trim();
    const cleanCity = city.trim();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cleanCountry) {
      setError("Please enter your country.");
      return;
    }

    if (!cleanCity) {
      setError("Please enter your city.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Your password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Your password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Your password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone || null,
              user_type: userType,
              country: cleanCountry,
              city: cleanCity,
              avatar_url: null,
            },
          },
        });

      if (signUpError) {
        setError(getFriendlyAuthError(signUpError));
        return;
      }

      if (!authData.user) {
        setError("Account creation failed. Please try again.");
        return;
      }

      // The database trigger creates the profiles row.
      // Do not insert a second profiles row here.

      if (!authData.session) {
        setSuccess(
          "Your account has been created. Please check your email to confirm your account, then sign in."
        );
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (err) {
      console.error("REGISTRATION REQUEST ERROR:", err);
      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[var(--fa-background)]">
      <div className="container flex min-h-[calc(100vh-80px)] items-center justify-center py-10">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-[var(--fa-shadow-md)] sm:p-8">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fa-navy)] text-white">
                <CarFront size={28} />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Firmlac Automobile
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[var(--fa-navy)]">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--fa-text-secondary)]">
                Join Firmlac Automobile to save cars, manage listings and
                connect with sellers.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
              >
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isBusy}
              className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--fa-border)] bg-white text-sm font-bold text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[var(--fa-border)]" />
              <span className="text-xs font-medium text-[var(--fa-text-secondary)]">
                OR REGISTER WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-[var(--fa-border)]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Full name
                </label>
                <div className="relative">
                  <User
                    size={19}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fa-text-secondary)]"
                  />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    disabled={isBusy}
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fa-text-secondary)]"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    disabled={isBusy}
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Phone number{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  disabled={isBusy}
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                  >
                    Country
                  </label>
                  <div className="relative">
                    <MapPin
                      size={19}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fa-text-secondary)]"
                    />
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      placeholder="e.g. Nigeria"
                      autoComplete="country-name"
                      required
                      disabled={isBusy}
                      className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                    />
                  </div>
                </div>

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
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="e.g. Lagos"
                    autoComplete="address-level2"
                    required
                    disabled={isBusy}
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="userType"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Account type
                </label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(event) =>
                    setUserType(event.target.value as UserType)
                  }
                  disabled={isBusy}
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                >
                  <option value="buyer">Buyer</option>
                  <option value="dealer">Car Dealer</option>
                  <option value="private_seller">Private Seller</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fa-text-secondary)]"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    disabled={isBusy}
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    disabled={isBusy}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--fa-text-secondary)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-text)] disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Use at least 8 characters, including uppercase, lowercase and
                  a number.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[var(--fa-text)]"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fa-text-secondary)]"
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    disabled={isBusy}
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    disabled={isBusy}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--fa-text-secondary)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-text)] disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--fa-text-secondary)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[var(--fa-blue)] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
