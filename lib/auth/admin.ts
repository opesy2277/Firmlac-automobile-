
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const OWNER_EMAIL = process.env.FIRMLAC_ADMIN_EMAIL?.trim().toLowerCase();

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!OWNER_EMAIL) {
    throw new Error("FIRMLAC_ADMIN_EMAIL is not configured.");
  }

  const email = user.email?.trim().toLowerCase();

  // The owner always has administrator access.
  if (email && email === OWNER_EMAIL) {
    return user;
  }

  // Other administrators must have the admin role in their profile.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Unable to verify administrator permissions.");
  }

  if (profile?.user_type !== "admin") {
    redirect("/");
  }

  return user;
}
