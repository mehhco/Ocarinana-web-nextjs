import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createScoreSchema } from "@/lib/validations/score";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// 列表当前用户的乐谱（精简字段）
// 性能优化：添加分页、缓存、计数
export async function GET(req: Request) {
  // Rate Limiting - 读取操作使用宽松限制
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LENIENT);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 解析分页参数
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // 最大 100 条
  const offset = (page - 1) * limit;

  // 优化查询：只查询需要的字段，添加分页，获取总数
  const { data, error, count } = await supabase
    .from("scores")
    .select("score_id, title, updated_at", { count: 'exact' })
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 返回数据和分页信息
  const response = NextResponse.json({
    data: (data || []).map((row) => ({
      scoreId: row.score_id,
      title: row.title,
      updatedAt: row.updated_at,
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  });

  // 性能优化：添加缓存头
  // 用户数据可以短暂缓存（10秒），减少数据库压力
  response.headers.set('Cache-Control', 'private, s-maxage=10, stale-while-revalidate=30');

  return response;
}

// 创建一个空白乐谱，返回 scoreId
export async function POST(req: Request) {
  // Rate Limiting - 写入操作使用中等限制
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.MODERATE);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 解析并验证请求体
  let body = null;
  try {
    body = await req.json();
  } catch {
    // 如果没有请求体，使用默认值
  }

  // 使用默认值或传入的数据
  const defaultDocument = {
    version: "1.0",
    title: "未命名简谱",
    measures: [[]],
    ties: [],
    lyrics: [],
    settings: {
      keySignature: "C" as const,
      timeSignature: "4/4" as const,
      tempo: 120,
      skin: "white" as const,
      showLyrics: false,
      showFingering: false,
    },
  };

  const documentInput = body || defaultDocument;

  // 验证数据
  const validationResult = createScoreSchema.safeParse(documentInput);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: "数据验证失败", details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const document = validationResult.data;
  const title = document.title;

  const { data, error } = await supabase
    .from("scores")
    .insert({ owner_user_id: user.id, title, document })
    .select("score_id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ scoreId: data.score_id });
}


