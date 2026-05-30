import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { canUseBilling } from "@/lib/billing/access";
import {
  SCORE_PUBLICATION_RULES,
  checkScorePublicationQuality,
  checkScorePublicationRewardQuality,
  getScorePublicationQualityFailedRules,
  getScorePublicationQualityFailureMessage,
  grantPublicationReward,
} from "@/lib/billing/publication-rewards";

type VisibilityRequestBody = {
  isPublic?: unknown;
};

type VisibilityRouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(error: string, status: number, details?: unknown) {
  return NextResponse.json(
    details === undefined ? { error } : { error, details },
    { status }
  );
}

function maskEmail(email: string | undefined) {
  if (!email) return "匿名用户";

  const [name, domain] = email.split("@");
  if (!name || !domain) return "匿名用户";

  const visibleName = name.length <= 2 ? `${name[0] || ""}***` : `${name.slice(0, 2)}***`;
  return `${visibleName}@${domain}`;
}

async function updateScoreVisibility(
  request: Request,
  { params }: VisibilityRouteContext
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
    return errorResponse("请先登录后再修改公开状态", 401);
  }

  let body: VisibilityRequestBody;
  try {
    body = (await request.json()) as VisibilityRequestBody;
  } catch {
    return errorResponse("请求数据格式无效", 400);
  }

  if (typeof body.isPublic !== "boolean") {
    return errorResponse("缺少公开状态参数 isPublic", 400, { received: body.isPublic });
  }

  const isPublic = body.isPublic;
  const { data: existingScore, error: existingScoreError } = await supabase
    .from("scores")
    .select("score_id, title, document, is_public")
    .eq("score_id", id)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existingScoreError) {
    return errorResponse("读取乐谱失败", 500, existingScoreError.message);
  }

  if (!existingScore) {
    return errorResponse("没有找到这首乐谱，或你没有权限修改它", 404);
  }

  const publicationQuality = isPublic
    ? checkScorePublicationQuality({
        score_id: existingScore.score_id,
        title: existingScore.title,
        document: existingScore.document,
      })
    : null;

  if (publicationQuality && !publicationQuality.passed) {
    return errorResponse("公开乐谱未通过质量检查", 422, {
      message: getScorePublicationQualityFailureMessage(publicationQuality),
      reason: publicationQuality.reason,
      noteCount: publicationQuality.noteCount,
      titleLength: publicationQuality.titleLength,
      dominantMusicElement: publicationQuality.dominantMusicElement,
      dominantMusicElementCount: publicationQuality.dominantMusicElementCount,
      dominantMusicElementRatio: publicationQuality.dominantMusicElementRatio,
      failedRules: getScorePublicationQualityFailedRules(publicationQuality),
      rules: SCORE_PUBLICATION_RULES,
    });
  }

  const isFirstPublication = isPublic && existingScore.is_public !== true;
  const billingRewardAvailable = isFirstPublication ? await canUseBilling().catch(() => false) : false;

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
    return errorResponse(isPublic ? "公开乐谱失败" : "取消公开失败", 500, error.message);
  }

  if (!data) {
    return errorResponse("没有找到这首乐谱，或你没有权限修改它", 404);
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

  if (billingRewardAvailable && publicationQuality?.passed) {
    const rewardQuality = checkScorePublicationRewardQuality({
      score_id: existingScore.score_id,
      title: existingScore.title,
      document: existingScore.document,
    });

    if (!rewardQuality.passed) {
      publicationReward = {
        eligible: true,
        rewardGranted: false,
        rewardDays: 0,
        rewardReason: rewardQuality.reason,
        monthlyRewardUsed: null,
        quality: rewardQuality,
        rewardPeriodEnd: null,
      };
    } else {
      try {
        const reward = await grantPublicationReward({
          userId: user.id,
          score: {
            score_id: existingScore.score_id,
            title: existingScore.title,
            document: existingScore.document,
          },
          quality: rewardQuality,
        });

        publicationReward = {
          eligible: true,
          quality: rewardQuality,
          ...reward,
        };
      } catch (rewardError) {
        console.error("Grant publication reward failed:", rewardError);
        publicationReward = {
          eligible: true,
          rewardGranted: false,
          rewardDays: 0,
          rewardReason: "reward_error",
          monthlyRewardUsed: null,
          quality: rewardQuality,
          rewardPeriodEnd: null,
        };
      }
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

export async function POST(request: Request, context: VisibilityRouteContext) {
  return updateScoreVisibility(request, context);
}

export async function PATCH(request: Request, context: VisibilityRouteContext) {
  return updateScoreVisibility(request, context);
}
