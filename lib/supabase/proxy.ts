import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Parameters<typeof supabaseResponse.cookies.set>[2];
          }[],
          headers?: Record<string, string>
        ) {
          // Keep the incoming request in sync so Server Components
          // see the refreshed (or cleared) cookies in this same request.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          // Send the refreshed (or cleared) cookies back to the browser.
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          // Cache headers from Supabase so CDNs don't cache auth responses.
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              supabaseResponse.headers.set(key, value);
            });
          }
        },
      },
    }
  );

  // IMPORTANT: do not run other logic between createServerClient and
  // getClaims(). This verifies the session and refreshes expired tokens,
  // writing the new cookies to the response.
  try {
    await supabase.auth.getClaims();
  } catch (error) {
    // A broken or stale session must not take the whole site down.
    console.error("Supabase session refresh failed:", error);
  }

  return supabaseResponse;
}