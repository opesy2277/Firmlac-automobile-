"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CarFront,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
  console.error(
    "SUPABASE LOGIN ERROR:",
    {
      message: loginError.message,
      status: loginError.status,
      code: loginError.code,
    }
  );

  const message =
    loginError.code === "email_not_confirmed"
      ? "Please confirm your email address before signing in."
      : loginError.code === "invalid_credentials"
        ? "The email or password is incorrect."
        : loginError.message ||
          "Unable to sign in. Please try again.";

  setError(message);
  setLoading(false);
  return;
}
    // Successful login → Account/Profile page
    router.push("/account");
    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[var(--fa-background)]">
      <div className="container flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
        <div className="w-full max-w-md">
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
                Sign In
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--fa-text-secondary)]">
                Sign in to access your Firmlac Automobile
                account.
              </p>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
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
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                  />
                </div>
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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (visible) => !visible
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--fa-text-secondary)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-text)]"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-[var(--fa-text-secondary)]">
            Sign in to manage your Firmlac Automobile account.
          </p>
        </div>
      </div>
    </main>
  );
}