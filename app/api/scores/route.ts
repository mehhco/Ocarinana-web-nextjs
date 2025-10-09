import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 列表当前用户的乐谱（精简字段）
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("scores")
    .select("score_id, title, updated_at")
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data || []).map((row) => ({
      scoreId: row.score_id,
      title: row.title,
      updatedAt: row.updated_at,
    }))
  );
}

// 创建一个空白乐谱，返回 scoreId
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 生成一个 scoreId（由数据库生成也可，这里使用 RPC insert returning）
  const emptyDoc = {
    version: "1.0",
    title: "未命名简谱",
    measures: [[]],
    ties: [],
    lyrics: [],
    settings: {
      keySignature: "C",
      timeSignature: "4/4",
      tempo: 120,
      skin: "white",
      showLyrics: false,
      showFingering: false,
    },
  };

  const { data, error } = await supabase
    .from("scores")
    .insert({ owner_user_id: user.id, title: emptyDoc.title, document: emptyDoc })
    .select("score_id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ scoreId: data.score_id });
}


