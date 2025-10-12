import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("scores")
    .select("score_id, owner_user_id, title, document, created_at, updated_at")
    .eq("score_id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (data.owner_user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({
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
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const scoreId = id;
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "未命名简谱";
  const document = body ?? {};

  // Upsert 用户自己的分数
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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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


