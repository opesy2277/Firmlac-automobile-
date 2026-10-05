import { createBrowserClient } from "@supabase/ssr";

let supabaseClient:
  | ReturnType<typeof createBrowserClient>
  | undefined;

export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  supabaseClient =
    createBrowserClient(
      supabaseUrl,
      supabaseKey
    );

  return supabaseClient;
}