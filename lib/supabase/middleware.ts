import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/editor",
  "/legal",
  "/music-classroom",
  "/scores",
  "/shop",
];

const PUBLIC_PATHS = new Set([
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/baidu-site-verification",
]);

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

export async function updateSession(request: NextRequest) {
  const isApiPath = request.nextUrl.pathname.startsWith("/api/");

  if (request.nextUrl.pathname.includes("baidu_verify_") && request.nextUrl.pathname.endsWith(".html")) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Keep this call immediately after client creation so Supabase can refresh
  // stale cookies before Server Components or API handlers read auth state.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!isApiPath && !isPublicPath(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
