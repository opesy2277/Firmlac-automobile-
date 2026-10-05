import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Users } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type DealerProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
};

export default async function AdminDealersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: dealers, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        email,
        phone,
        country,
        city,
        created_at
      `
    )
    .eq("user_type", "dealer")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load dealers: ${error.message}`);
  }

  const dealerList = (dealers ?? []) as DealerProfile[];

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#667085]">
              <Link
                href="/admin"
                className="transition hover:text-[#1557c0]"
              >
                Admin
              </Link>

              <span>/</span>

              <span className="text-[#101828]">Dealers</span>
            </div>

            <h1 className="flex items-center gap-3 font-roboto text-2xl font-bold text-[#101828] sm:text-3xl">
              <Building2 className="h-7 w-7 text-[#1557c0]" />
              Dealers
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              View and manage registered vehicle dealers.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 shadow-sm">
            <Users className="h-5 w-5 text-[#1557c0]" />

            <div>
              <p className="text-xs text-[#667085]">Total Dealers</p>
              <p className="text-lg font-semibold text-[#101828]">
                {dealerList.length}
              </p>
            </div>
          </div>
        </div>

        {/* Error / empty state */}
        {dealerList.length === 0 ? (
          <div className="rounded-2xl border border-[#e4e7ec] bg-white p-10 text-center shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-[#98a2b3]" />

            <h2 className="mt-4 text-lg font-semibold text-[#101828]">
              No dealers found
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              There are currently no registered dealer accounts.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="border-b border-[#e4e7ec] bg-[#f9fafb]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        Dealer
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        Location
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        Registered
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e4e7ec]">
                    {dealerList.map((dealer) => (
                      <tr
                        key={dealer.id}
                        className="transition hover:bg-[#f9fafb]"
                      >
                        {/* Dealer */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff]">
                              <Building2 className="h-5 w-5 text-[#1557c0]" />
                            </div>

                            <div>
                              <p className="font-semibold text-[#101828]">
                                {dealer.full_name || "Unnamed Dealer"}
                              </p>

                              <p className="mt-1 text-xs text-[#667085]">
                                ID: {dealer.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">
                          <div className="space-y-2 text-sm">
                            {dealer.email && (
                              <div className="flex items-center gap-2 text-[#475467]">
                                <Mail className="h-4 w-4 text-[#667085]" />
                                <span>{dealer.email}</span>
                              </div>
                            )}

                            {dealer.phone && (
                              <div className="flex items-center gap-2 text-[#475467]">
                                <Phone className="h-4 w-4 text-[#667085]" />
                                <span>{dealer.phone}</span>
                              </div>
                            )}

                            {!dealer.email && !dealer.phone && (
                              <span className="text-sm text-[#98a2b3]">
                                No contact information
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-[#475467]">
                            <MapPin className="h-4 w-4 shrink-0 text-[#667085]" />

                            <span>
                              {[dealer.city, dealer.country]
                                .filter(Boolean)
                                .join(", ") || "Not provided"}
                            </span>
                          </div>
                        </td>

                        {/* Registered */}
                        <td className="px-6 py-5 text-sm text-[#475467]">
                          {new Date(dealer.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {dealerList.map((dealer) => (
                <div
                  key={dealer.id}
                  className="rounded-2xl border border-[#e4e7ec] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff]">
                      <Building2 className="h-5 w-5 text-[#1557c0]" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-[#101828]">
                        {dealer.full_name || "Unnamed Dealer"}
                      </h2>

                      <p className="mt-1 break-all text-xs text-[#667085]">
                        ID: {dealer.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[#e4e7ec] pt-4">
                    {dealer.email && (
                      <div className="flex items-center gap-3 text-sm text-[#475467]">
                        <Mail className="h-4 w-4 text-[#667085]" />
                        <span className="break-all">{dealer.email}</span>
                      </div>
                    )}

                    {dealer.phone && (
                      <div className="flex items-center gap-3 text-sm text-[#475467]">
                        <Phone className="h-4 w-4 text-[#667085]" />
                        <span>{dealer.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-[#475467]">
                      <MapPin className="h-4 w-4 text-[#667085]" />

                      <span>
                        {[dealer.city, dealer.country]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"}
                      </span>
                    </div>

                    <div className="pt-1 text-xs text-[#667085]">
                      Registered{" "}
                      {new Date(dealer.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}