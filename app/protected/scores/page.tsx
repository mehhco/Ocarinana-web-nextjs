import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Metadata } from "next";
import { EditorClientWrapper } from "@/components/editor-client-wrapper";

export const metadata: Metadata = {
  title: "乐谱编辑器 - Ocarinana",
  description: "在线编辑数字简谱与陶笛指法谱，支持实时预览、自动指法匹配、高清导出",
  keywords: [
    "乐谱编辑器",
    "数字简谱编辑",
    "陶笛指法谱",
    "在线乐谱制作",
    "简谱生成器",
  ],
  robots: {
    index: false, // 编辑器页面不需要被索引
    follow: false,
  },
};

export default async function ScoresPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // 获取用户 ID 用于构建乐谱列表链接
  const userId = data.user.id;

  return (
    <>
      <div className="fixed top-2 left-4 z-50">
        <Button asChild size="sm" variant="secondary" className="shadow">
          <Link href={`/${userId}/notes`} aria-label="返回我的乐谱列表">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> 返回我的乐谱列表
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


