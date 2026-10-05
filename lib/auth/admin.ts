import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.FIRMLAC_ADMIN_EMAIL;

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!ADMIN_EMAIL) {
    throw new Error("FIRMLAC_ADMIN_EMAIL is not configured.");
  }

  if (!user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    redirect("/");
  }

  return user;
}