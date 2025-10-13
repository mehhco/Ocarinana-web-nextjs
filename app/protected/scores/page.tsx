import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { EditorClientWrapper } from "@/components/editor-client-wrapper";

export const metadata: Metadata = {
  title: "乐谱编辑器 - Ocarinana",
  description: "在线编辑数字简谱与陶笛指法谱",
};

export default async function ScoresPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <>
      <div className="fixed top-2 left-4 z-50">
        <Button asChild size="sm" variant="secondary" className="shadow">
          <Link href="/" aria-label="返回主页">
            <HomeIcon className="mr-2 h-4 w-4" /> 返回主页
          </Link>
        </Button>
      </div>
      <div className="fixed inset-x-0 bottom-0 top-16 w-screen">
        {/* 性能优化：编辑器在 Client Component 中动态加载 */}
        <EditorClientWrapper iframeId="score-iframe" />
      </div>
    </>
  );
}


