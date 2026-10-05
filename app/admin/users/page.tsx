import Link from "next/link";
import {
  Users,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  user_type: "buyer" | "dealer" | "private_seller" | "admin";
  country: string | null;
  city: string | null;
  created_at: string;
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        email,
        phone,
        user_type,
        country,
        city,
        created_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  const userList = (users ?? []) as UserProfile[];

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#667085]">
            <Link
              href="/admin"
              className="transition hover:text-[#1557c0]"
            >
              Admin
            </Link>

            <span>/</span>

            <span className="text-[#101828]">Users</span>
          </div>

          <h1 className="flex items-center gap-3 font-roboto text-2xl font-bold text-[#101828] sm:text-3xl">
            <Users className="h-7 w-7 text-[#1557c0]" />
            Users
          </h1>

          <p className="mt-2 text-sm text-[#667085]">
            View registered buyers, dealers, private sellers, and administrators.
          </p>
        </div>

        {/* Empty state */}
        {userList.length === 0 ? (
          <div className="rounded-2xl border border-[#e4e7ec] bg-white p-10 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-[#98a2b3]" />

            <h2 className="mt-4 text-lg font-semibold text-[#101828]">
              No users found
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              There are currently no profiles registered.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="border-b border-[#e4e7ec] bg-[#f9fafb]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        User
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                        Account Type
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
                    {userList.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-[#f9fafb]"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff]">
                              <User className="h-5 w-5 text-[#1557c0]" />
                            </div>

                            <div>
                              <p className="font-semibold text-[#101828]">
                                {user.full_name || "Unnamed User"}
                              </p>

                              <p className="mt-1 text-xs text-[#667085]">
                                ID: {user.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">
                          <div className="space-y-2 text-sm">
                            {user.email && (
                              <div className="flex items-center gap-2 text-[#475467]">
                                <Mail className="h-4 w-4 text-[#667085]" />
                                <span>{user.email}</span>
                              </div>
                            )}

                            {user.phone && (
                              <div className="flex items-center gap-2 text-[#475467]">
                                <Phone className="h-4 w-4 text-[#667085]" />
                                <span>{user.phone}</span>
                              </div>
                            )}

                            {!user.email && !user.phone && (
                              <span className="text-[#98a2b3]">
                                No contact information
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Account type */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              user.user_type === "admin"
                                ? "bg-red-50 text-red-700"
                                : user.user_type === "dealer"
                                  ? "bg-blue-50 text-blue-700"
                                  : user.user_type === "private_seller"
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.user_type.replace("_", " ")}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-[#475467]">
                            <MapPin className="h-4 w-4 text-[#667085]" />

                            <span>
                              {[user.city, user.country]
                                .filter(Boolean)
                                .join(", ") || "Not provided"}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 text-sm text-[#475467]">
                          {new Date(user.created_at).toLocaleDateString(
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

            {/* Mobile */}
            <div className="space-y-4 md:hidden">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-[#e4e7ec] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff]">
                      <User className="h-5 w-5 text-[#1557c0]" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-[#101828]">
                        {user.full_name || "Unnamed User"}
                      </h2>

                      <p className="mt-1 break-all text-xs text-[#667085]">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#e4e7ec] pt-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        user.user_type === "admin"
                          ? "bg-red-50 text-red-700"
                          : user.user_type === "dealer"
                            ? "bg-blue-50 text-blue-700"
                            : user.user_type === "private_seller"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.user_type.replace("_", " ")}
                    </span>

                    <div className="mt-4 space-y-3 text-sm text-[#475467]">
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-[#667085]" />
                          <span>{user.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-[#667085]" />
                        <span>
                          {[user.city, user.country]
                            .filter(Boolean)
                            .join(", ") || "Location not provided"}
                        </span>
                      </div>

                      <p className="text-xs text-[#667085]">
                        Registered{" "}
                        {new Date(user.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
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