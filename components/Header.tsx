"use client";

import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  UserRound,
  X,
  CarFront,
} from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--fa-border)] bg-white/95 backdrop-blur">
      <div className="container">
        <div className="flex h-20 items-center justify-between gap-6">
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
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-blue)]"
            >
              <Search size={21} />
            </button>

            {/* Saved Cars */}
            <Link
              href="/saved-cars"
              aria-label="Saved cars"
              title="Saved cars"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-red)]"
            >
              <Heart size={21} />
            </Link>

            {/* Account */}
            <Link
              href="/account"
              aria-label="Account"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] hover:text-[var(--fa-blue)]"
            >
              <UserRound size={21} />
            </Link>

            {/* Sell */}
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
            aria-label={
              menuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--fa-text)] transition hover:bg-[var(--fa-background)] lg:hidden"
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-[var(--fa-border)] py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/cars"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                Buy Cars
              </Link>

              <Link
                href="/sell"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                Sell Your Car
              </Link>

              <Link
                href="/dealers"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                Dealers
              </Link>

              {/* Saved Cars */}
              <Link
                href="/saved-cars"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                <Heart size={19} />
                Saved Cars
              </Link>

              {/* Account */}
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-[var(--fa-background)]"
              >
                <UserRound size={19} />
                Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}