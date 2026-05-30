import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { entitlementError, getUserEntitlements } from "@/lib/billing/entitlements";

const COOKIE_NAME = "ocarinana_guest_export";
const DAILY_GUEST_EXPORT_LIMIT = 5;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;

type GuestExportCookie = {
  id: string;
  date: string;
  count: number;
};

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
    process.env.GUEST_EXPORT_COOKIE_SECRET ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    "ocarinana-dev-secret"
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

function encodeCookieValue(value: GuestExportCookie) {
  const payload = Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function decodeCookieValue(rawValue: string | undefined): GuestExportCookie | null {
  if (!rawValue) return null;

  const [payload, signature] = rawValue.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.date !== "string" ||
      typeof parsed.count !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function isSecureRequest(request: Request) {
  return (
    request.url.startsWith("https://") ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = getTodayKey();

  if (user) {
    const entitlements = await getUserEntitlements(user.id);
    const { data, error } = await supabase.rpc("increment_user_daily_export_usage", {
      p_user_id: user.id,
      p_usage_date: today,
      p_limit: entitlements.dailyExportLimit,
    });

    if (error) {
      console.error("记录登录用户导出次数失败:", error);
      return jsonNoStore(
        { error: "导出次数校验失败，请稍后再试。" },
        { status: 500 }
      );
    }

    const usage = Array.isArray(data) ? data[0] : null;
    if (!usage?.allowed) {
      const usedCount = usage?.used_count ?? entitlements.dailyExportLimit;
      return jsonNoStore(
        entitlementError({
          code: "DAILY_EXPORT_LIMIT_REACHED",
          message: `今日导出次数已用完（${usedCount}/${entitlements.dailyExportLimit}）。开通会员可享受更多导出次数，并支持无水印导出。`,
          limit: entitlements.dailyExportLimit,
        }),
        { status: 429 }
      );
    }

    return jsonNoStore({
      allowed: true,
      authenticated: true,
      remaining: usage.remaining_count,
      limit: entitlements.dailyExportLimit,
      plus: entitlements.isPlus,
      canExportWithoutWatermark: entitlements.canExportWithoutWatermark,
      canUseAdvancedExport: entitlements.canUseAdvancedExport,
    });
  }

  const current = decodeCookieValue(request.headers.get("cookie")?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1]);
  const guestState =
    current && current.date === today
      ? current
      : {
          id: current?.id || randomUUID(),
          date: today,
          count: 0,
        };

  if (guestState.count >= DAILY_GUEST_EXPORT_LIMIT) {
    const response = jsonNoStore(
      {
        allowed: false,
        authenticated: false,
        remaining: 0,
        limit: DAILY_GUEST_EXPORT_LIMIT,
        error: `今日导出次数已用完（${guestState.count}/${DAILY_GUEST_EXPORT_LIMIT}）。开通会员可享受更多导出次数，并支持保存乐谱和无水印导出。`,
      },
      { status: 429 }
    );

    response.cookies.set(COOKIE_NAME, encodeCookieValue(guestState), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });

    return response;
  }

  const nextState = {
    ...guestState,
    count: guestState.count + 1,
  };

  const response = jsonNoStore({
    allowed: true,
    authenticated: false,
    remaining: Math.max(DAILY_GUEST_EXPORT_LIMIT - nextState.count, 0),
    limit: DAILY_GUEST_EXPORT_LIMIT,
  });

  response.cookies.set(COOKIE_NAME, encodeCookieValue(nextState), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
