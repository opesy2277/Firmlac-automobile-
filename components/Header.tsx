
"use client";

import Link from "next/link";
import {
  CarFront,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountProfile = {
  user_type: string | null;
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUserEmail(user?.email ?? null);

      if (!user) {
        setUserType(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted) {
        setUserType(
          (profile as AccountProfile | null)?.user_type ?? null
        );
      }
    }

    void loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAccount();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // This public variable is only used to display the owner controls.
  // Server-side authorization must still protect every admin route.
  const ownerEmail =
    process.env.NEXT_PUBLIC_FIRMLAC_OWNER_EMAIL?.trim().toLowerCase();

  const isOwner =
    !!userEmail &&
    !!ownerEmail &&
    userEmail.toLowerCase() === ownerEmail;

  const isAdmin = isOwner || userType === "admin";

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out failed:", error.message);
        setSigningOut(false);
        return;
      }

      setUserEmail(null);
      setUserType(null);
      setProfileOpen(false);
      setMobileProfileOpen(false);
      setMenuOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  }

  function closeMenus() {
    setMenuOpen(false);
    setProfileOpen(false);
    setMobileProfileOpen(false);
  }

  function AccountLinks({ mobile = false }: { mobile?: boolean }) {
    const itemClass =
      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-blue)]";

    return (
      <div className="flex flex-col gap-1">
        {userEmail ? (
          <>
            <Link
              href="/account"
              onClick={closeMenus}
              className={itemClass}
            >
              <UserRound size={18} />
              Profile Details
            </Link>

            <Link
              href="/my-listings"
              onClick={closeMenus}
              className={itemClass}
            >
              <CarFront size={18} />
              My Listings
            </Link>

            <Link
              href="/saved-cars"
              onClick={closeMenus}
              className={itemClass}
            >
              <Heart size={18} />
              Saved Cars
            </Link>

            {isAdmin && (
              <>
                <div className="my-2 border-t border-[var(--fa-border)]" />

                <Link
                  href="/admin"
                  onClick={closeMenus}
                  className={itemClass}
                >
                  <LayoutDashboard size={18} />
                  Admin Dashboard
                </Link>

                {isOwner && (
                  <div className="px-4 py-2 text-xs text-[var(--fa-muted)]">
                    Owner account
                  </div>
                )}
              </>
            )}

            <div className="my-2 border-t border-[var(--fa-border)]" />

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className={`${itemClass} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <LogOut size={18} />
              {signingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={closeMenus}
              className={itemClass}
            >
              <UserRound size={18} />
              Sign In
            </Link>

            <Link
              href="/register"
              onClick={closeMenus}
              className={itemClass}
            >
              Create Account
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--fa-border)] bg-white/95 backdrop-blur">
      <div className="container">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="Firmlac Automobile home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
              <CarFront size={24} strokeWidth={2.2} />
            </span>

            <span className="hidden sm:block">
              <span className="block text-lg font-bold tracking-tight text-[var(--fa-navy)]">
                Firmlac
              </span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[var(--fa-red)]">
                Automobile
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">
            <Link
              href="/cars"
              className="text-sm font-semibold text-[var(--fa-text)] transition hover:text-[var(--fa-blue)]"
            >
              Buy Cars
            </Link>

            <Link
              href="/sell"
              className="text-sm font-semibold text-[var(--fa-text)] transition hover:text-[var(--fa-blue)]"
            >
              Sell Your Car
            </Link>

            <Link
              href="/dealers"
              className="text-sm font-semibold text-[var(--fa-text)] transition hover:text-[var(--fa-blue)]"
            >
              Dealers
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Search"
              onClick={() => router.push("/cars")}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-blue)]"
            >
              <Search size={21} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-11 items-center gap-2 rounded-xl border border-[var(--fa-border)] px-3 text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-blue)]"
              >
                <UserRound size={20} />
                <span className="text-sm font-semibold">Profile</span>
                <ChevronDown
                  size={16}
                  className={`transition ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-[var(--fa-border)] bg-white p-2 shadow-xl">
                  <AccountLinks />
                </div>
              )}
            </div>

            <Link
              href="/sell"
              className="ml-2 rounded-xl bg-[var(--fa-red)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              Sell Your Car
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] md:flex lg:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-[var(--fa-border)] py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/cars"
                onClick={closeMenus}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                Buy Cars
              </Link>

              <Link
                href="/sell"
                onClick={closeMenus}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                Sell Your Car
              </Link>

              <Link
                href="/dealers"
                onClick={closeMenus}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                Dealers
              </Link>

              {/* Mobile Profile Dropdown */}
              <button
                type="button"
                aria-expanded={mobileProfileOpen}
                onClick={() =>
                  setMobileProfileOpen((open) => !open)
                }
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-[var(--fa-background)]"
              >
                <UserRound size={19} />
                Profile
                <span className="ml-auto">
                  <ChevronDown
                    size={17}
                    className={`transition ${mobileProfileOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {mobileProfileOpen && (
                <div className="ml-3 border-l-2 border-[var(--fa-border)] pl-2">
                  <AccountLinks mobile />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
