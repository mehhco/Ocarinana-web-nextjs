import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/editor",
  "/legal",
  "/scores",
  "/shop",
];

const GUEST_SCORE_VIEW_COOKIE = "ocarinana_guest_score_views";
const DAILY_GUEST_SCORE_VIEW_LIMIT = 3;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;

type GuestScoreViewCookie = {
  date: string;
  scoreIds: string[];
};

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

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getSigningSecret() {
  return (
    process.env.GUEST_SCORE_VIEW_COOKIE_SECRET ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    "ocarinana-dev-secret"
  );
}

async function signPayload(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSigningSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function encodeGuestScoreViewCookie(value: GuestScoreViewCookie) {
  const payload = encodeURIComponent(JSON.stringify(value));
  return `${payload}.${await signPayload(payload)}`;
}

async function decodeGuestScoreViewCookie(rawValue: string | undefined): Promise<GuestScoreViewCookie | null> {
  if (!rawValue) return null;

  const separatorIndex = rawValue.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const payload = rawValue.slice(0, separatorIndex);
  const signature = rawValue.slice(separatorIndex + 1);
  const expectedSignature = await signPayload(payload);

  if (signature !== expectedSignature) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(payload));
    if (
      typeof parsed.date !== "string" ||
      !Array.isArray(parsed.scoreIds) ||
      !parsed.scoreIds.every((scoreId: unknown) => typeof scoreId === "string")
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getPublicScoreDetailId(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "scores" || segments[1] === "guest-limit") {
    return null;
  }

  return segments[1];
}

async function applyGuestScoreViewLimit(request: NextRequest, response: NextResponse) {
  const scoreId = getPublicScoreDetailId(request.nextUrl.pathname);
  if (!scoreId) return response;

  const today = getTodayKey();
  const current = await decodeGuestScoreViewCookie(request.cookies.get(GUEST_SCORE_VIEW_COOKIE)?.value);
  const guestState =
    current && current.date === today
      ? current
      : {
          date: today,
          scoreIds: [],
        };

  if (guestState.scoreIds.includes(scoreId)) {
    return response;
  }

  if (guestState.scoreIds.length >= DAILY_GUEST_SCORE_VIEW_LIMIT) {
    const url = request.nextUrl.clone();
    url.pathname = "/scores/guest-limit";
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const nextState = {
    ...guestState,
    scoreIds: [...guestState.scoreIds, scoreId].slice(-DAILY_GUEST_SCORE_VIEW_LIMIT),
  };

  response.cookies.set(GUEST_SCORE_VIEW_COOKIE, await encodeGuestScoreViewCookie(nextState), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export async function updateSession(request: NextRequest) {
  // 跳过API路由的处理，直接返回（API路由不需要认证检查）
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next({
      request,
    });
  }

  // 跳过百度验证文件的处理，直接返回
  if (request.nextUrl.pathname.includes('baidu_verify_') && request.nextUrl.pathname.endsWith('.html')) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
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

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (
    !isPublicPath(request.nextUrl.pathname) &&
    !user
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (!user) {
    return applyGuestScoreViewLimit(request, supabaseResponse);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
