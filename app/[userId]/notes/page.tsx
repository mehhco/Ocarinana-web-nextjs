import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "我的乐谱 - Ocarinana",
  description: "管理你的六孔和十二孔陶笛指法谱",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserNotesPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function UserNotesPage({ params }: UserNotesPageProps) {
  await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirect("/protected/me/scores");
}
