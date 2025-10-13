import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateScoreSchema } from "@/lib/validations/score";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate Limiting - 读取操作使用宽松限制
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LENIENT);
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 性能优化：使用组合索引查询（user_id + score_id）
  const { data, error } = await supabase
    .from("scores")
    .select("score_id, owner_user_id, title, document, created_at, updated_at")
    .eq("owner_user_id", user.id)  // 先按用户过滤，利用索引
    .eq("score_id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const response = NextResponse.json({
    version: data.document?.version || "1.0",
    scoreId: data.score_id,
    ownerUserId: data.owner_user_id,
    title: data.title,
    measures: data.document?.measures ?? [[]],
    ties: data.document?.ties ?? [],
    lyrics: data.document?.lyrics ?? [],
    settings: data.document?.settings ?? {
      keySignature: "C",
      timeSignature: "4/4",
      tempo: 120,
      skin: "white",
      showLyrics: false,
      showFingering: false,
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });

  // 性能优化：添加缓存头
  // 单个乐谱可以缓存稍长时间（30秒）
  response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60');
  // 添加 ETag 用于条件请求
  response.headers.set('ETag', `"${data.score_id}-${new Date(data.updated_at).getTime()}"`);

  return response;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate Limiting - 更新操作使用中等限制
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
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 解析并验证请求体
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "无效的 JSON 数据" }, { status: 400 });
  }

  // 验证数据格式
  const validationResult = updateScoreSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: "数据验证失败", details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const validatedData = validationResult.data;
  const scoreId = id;
  const title = validatedData.title;
  const document = validatedData;

  // 验证用户是否有权限更新此乐谱
  const { data: existing } = await supabase
    .from("scores")
    .select("owner_user_id")
    .eq("score_id", scoreId)
    .maybeSingle();

  if (existing && existing.owner_user_id !== user.id) {
    return NextResponse.json({ error: "无权限更新此乐谱" }, { status: 403 });
  }

  // Upsert 用户自己的乐谱
  const { error } = await supabase.from("scores").upsert(
    {
      score_id: scoreId,
      owner_user_id: user.id,
      title,
      document,
    },
    { onConflict: "score_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate Limiting - 删除操作使用中等限制
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
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 验证所有权后删除
  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("score_id", id)
    .eq("owner_user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


