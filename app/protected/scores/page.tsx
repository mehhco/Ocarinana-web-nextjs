import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ScoresPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <iframe
        src="/webfile/index.html"
        title="交互式简谱生成器"
        className="w-screen h-screen border-0"
      />
    </div>
  );
}


