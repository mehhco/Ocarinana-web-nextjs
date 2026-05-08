import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

function maskEmail(email: string | undefined): string {
  if (!email) return "匿名用户";

  const [name, domain] = email.split("@");
  if (!name || !domain) return "匿名用户";

  if (name.length <= 2) {
    return `${name[0] ?? "*"}***@${domain}`;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.MODERATE);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "无效的 JSON 数据" }, { status: 400 });
  }

  const isPublic = typeof body === "object" && body !== null && "isPublic" in body
    ? (body as { isPublic: unknown }).isPublic
    : undefined;

  if (typeof isPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic 必须是布尔值" }, { status: 400 });
  }

  const update = isPublic
    ? {
        is_public: true,
        published_at: new Date().toISOString(),
        public_author_label: maskEmail(user.email),
      }
    : {
        is_public: false,
      };

  const { data, error } = await supabase
    .from("scores")
    .update(update)
    .eq("score_id", id)
    .eq("owner_user_id", user.id)
    .select("score_id, is_public, published_at, public_author_label")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    scoreId: data.score_id,
    isPublic: data.is_public,
    publishedAt: data.published_at,
    publicAuthorLabel: data.public_author_label,
  });
}
