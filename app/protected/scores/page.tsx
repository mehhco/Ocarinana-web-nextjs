import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

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
        <iframe
          src="/webfile/index.html"
          title="交互式简谱生成器"
          className="w-full h-full border-0"
        />
      </div>
    </>
  );
}


