import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * 导出用户所有数据
 * GDPR "数据可移植权" 实现
 */
export async function GET(req: Request) {
  // Rate Limiting - 宽松限制（读取操作）
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LENIENT);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  const supabase = await createClient();
  
  // 获取当前用户
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json(
      { error: "未授权：请先登录" },
      { status: 401 }
    );
  }

  try {
    // 1. 获取用户基本信息
    const userInfo = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    };

    // 2. 获取用户的所有乐谱
    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });

    if (scoresError) {
      console.error("获取乐谱失败:", scoresError);
      return NextResponse.json(
        { error: "获取用户数据失败", details: scoresError.message },
        { status: 500 }
      );
    }

    // 3. 构建完整的数据导出
    const exportData = {
      export_info: {
        generated_at: new Date().toISOString(),
        user_id: user.id,
        format_version: "1.0",
      },
      user: userInfo,
      scores: scores || [],
      statistics: {
        total_scores: scores?.length || 0,
        account_age_days: user.created_at
          ? Math.floor(
              (Date.now() - new Date(user.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
      },
    };

    // 4. 返回 JSON 格式的数据
    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="ocarinana-data-${user.id}-${Date.now()}.json"`,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("导出数据过程中发生错误:", error);
    return NextResponse.json(
      {
        error: "导出数据失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

