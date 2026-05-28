import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { entitlementError, getUserEntitlements } from "@/lib/billing/entitlements";
import { canUseBilling } from "@/lib/billing/access";
import { checkScorePublicationQuality, grantPublicationReward } from "@/lib/billing/publication-rewards";

type VisibilityRequestBody = {
  isPublic?: unknown;
};

function maskEmail(email: string | undefined) {
  if (!email) return "匿名用户";

  const [name, domain] = email.split("@");
  if (!name || !domain) return "匿名用户";

  const visibleName = name.length <= 2 ? `${name[0] || ""}***` : `${name.slice(0, 2)}***`;
  return `${visibleName}@${domain}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const identifier = getIdentifier(request);
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

  let body: VisibilityRequestBody;
  try {
    body = (await request.json()) as VisibilityRequestBody;
  } catch {
    return NextResponse.json({ error: "无效的 JSON 数据" }, { status: 400 });
  }

  const isPublic = body.isPublic === true;
  const { data: existingScore, error: existingScoreError } = await supabase
    .from("scores")
    .select("score_id, title, document, is_public")
    .eq("score_id", id)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existingScoreError) {
    return NextResponse.json({ error: existingScoreError.message }, { status: 500 });
  }

  if (!existingScore) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isFirstPublication = isPublic && existingScore.is_public !== true;
  const billingRewardAvailable = isFirstPublication ? await canUseBilling() : false;

  if (billingRewardAvailable) {
    const entitlements = await getUserEntitlements(user.id);
    const { count: publicScoreCount, error: publicCountError } = await supabase
      .from("scores")
      .select("score_id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .eq("is_public", true);

    if (publicCountError) {
      return NextResponse.json({ error: publicCountError.message }, { status: 500 });
    }

    if ((publicScoreCount || 0) >= entitlements.publicScoreLimit) {
      return NextResponse.json(
        entitlementError({
          code: "PUBLIC_SCORE_LIMIT_REACHED",
          message: `当前账号最多可公开 ${entitlements.publicScoreLimit} 首乐谱，升级 Plus 可公开更多作品。`,
          limit: entitlements.publicScoreLimit,
        }),
        { status: 403 }
      );
    }
  }

  const updatePayload = isPublic
    ? {
        is_public: true,
        published_at: new Date().toISOString(),
        public_author_label: maskEmail(user.email),
      }
    : {
        is_public: false,
        published_at: null,
        public_author_label: null,
      };

  const { data, error } = await supabase
    .from("scores")
    .update(updatePayload)
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

  let publicationReward = {
    eligible: billingRewardAvailable,
    rewardGranted: false,
    rewardDays: 0,
    rewardReason: billingRewardAvailable ? "quality_not_checked" : "not_eligible",
    monthlyRewardUsed: null as number | null,
    quality: null as ReturnType<typeof checkScorePublicationQuality> | null,
    rewardPeriodEnd: null as string | null,
  };

  if (billingRewardAvailable) {
    const quality = checkScorePublicationQuality({
      score_id: existingScore.score_id,
      title: existingScore.title,
      document: existingScore.document,
    });

    if (quality.passed) {
      const reward = await grantPublicationReward({
        userId: user.id,
        score: {
          score_id: existingScore.score_id,
          title: existingScore.title,
          document: existingScore.document,
        },
        quality,
      });

      publicationReward = {
        eligible: true,
        quality,
        ...reward,
      };
    } else {
      publicationReward = {
        eligible: true,
        rewardGranted: false,
        rewardDays: 0,
        rewardReason: quality.reason,
        monthlyRewardUsed: null,
        quality,
        rewardPeriodEnd: null,
      };
    }
  }

  return NextResponse.json({
    scoreId: data.score_id,
    isPublic: data.is_public ?? false,
    publishedAt: data.published_at,
    publicAuthorLabel: data.public_author_label,
    publicationReward,
  });
}
