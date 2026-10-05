import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import {
  CarFront,
  Users,
  Store,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const adminCards = [
  {
    title: "Vehicle Management",
    description:
      "View, review, approve, edit, and manage vehicle listings and images.",
    href: "/admin/vehicles",
    icon: CarFront,
  },
  {
    title: "Dealers",
    description:
      "Review and manage dealer accounts and profiles.",
    href: "/admin/dealers",
    icon: Store,
  },
  {
    title: "Users",
    description:
      "Manage buyers, dealers, and private sellers.",
    href: "/admin/users",
    icon: Users,
  },
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen">
      <section className="border-b border-[var(--fa-border)] bg-white">
        <div className="container py-10 sm:py-14">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fa-red)]">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--fa-navy)] sm:text-4xl">
                Firmlac Automobile Admin
              </h1>

              <p className="mt-3 max-w-2xl text-[var(--fa-text-secondary)]">
                Manage vehicle listings, dealers, and users from one
                place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adminCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--fa-blue)] hover:shadow-[var(--fa-shadow-md)]"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fa-background)] text-[var(--fa-navy)] transition group-hover:bg-[var(--fa-navy)] group-hover:text-white">
                      <Icon size={23} />
                    </div>

                    <ArrowRight
                      size={20}
                      className="text-[var(--fa-text-secondary)] transition group-hover:translate-x-1 group-hover:text-[var(--fa-blue)]"
                    />
                  </div>

                  <h2 className="mt-6 text-xl font-bold text-[var(--fa-text)]">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--fa-text-secondary)]">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}