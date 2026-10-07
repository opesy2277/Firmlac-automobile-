
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabases/admin";
import { ShieldCheck, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: string;
  country: string | null;
  city: string | null;
};

export default async function AdministratorsPage() {
  const currentUser = await requireAdmin();

  const ownerEmail =
    process.env.FIRMLAC_ADMIN_EMAIL?.trim().toLowerCase();

  const currentEmail = currentUser.email?.trim().toLowerCase();

  if (!ownerEmail || currentEmail !== ownerEmail) {
    redirect("/admin");
  }

  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, user_type, country, city")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load user profiles.");
  }

  const users = (profiles ?? []) as Profile[];

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 text-[#101828] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#1557c0] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#1557c0]">
              <ShieldCheck size={25} />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Owner Controls
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Manage Administrators
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              Review user accounts and manage administrator access.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#e4e7ec] bg-white p-4">
            <Users className="text-[#1557c0]" size={25} />
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-[#667085]">Registered profiles</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm">
          <div className="border-b border-[#e4e7ec] px-5 py-4">
            <h2 className="font-semibold">User accounts</h2>
            <p className="mt-1 text-sm text-[#667085]">
              Administrator access can only be changed by the owner.
            </p>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#667085]">
              No user profiles were found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f9fafb] text-xs uppercase text-[#667085]">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Account type</th>
                    <th className="px-5 py-4">Administrator</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e4e7ec]">
                  {users.map((profile) => {
                    const isOwner =
                      profile.email?.trim().toLowerCase() === ownerEmail;

                    return (
                      <tr key={profile.id} className="hover:bg-[#f9fafb]">
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {profile.full_name || "Unnamed user"}
                          </p>
                          <p className="mt-1 text-[#667085]">
                            {profile.email || "No email recorded"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-[#667085]">
                          {[profile.city, profile.country]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-medium capitalize">
                            {profile.user_type.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {isOwner ? (
                            <span className="font-semibold text-[#12833d]">
                              Owner
                            </span>
                          ) : profile.user_type === "admin" ? (
                            <span className="font-semibold text-[#1557c0]">
                              Administrator
                            </span>
                          ) : (
                            <span className="text-[#667085]">
                              Standard access
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-[#667085]">
          This page currently displays account information. Granting and
          revoking administrator access will be added after the secure
          database function is tested.
        </p>
      </div>
    </main>
  );
}
