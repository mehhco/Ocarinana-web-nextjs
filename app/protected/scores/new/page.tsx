import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewScoreRedirectPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // 创建一个新乐谱并重定向到带 scoreId 的编辑器
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/auth/login");

  // 通过 Edge Runtime 调用内部 API 可能受限，采用直接 fetch
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "";
  try {
    const res = await fetch(`${origin}/api/scores`, { method: "POST", cache: "no-store" });
    if (res.ok) {
      const { scoreId } = await res.json();
      redirect(`/protected/scores?scoreId=${encodeURIComponent(scoreId)}`);
    }
  } catch {}

  // 失败时仍然进入空白编辑器
  redirect("/protected/scores");
}


