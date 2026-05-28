import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "我的 - Ocarinana",
  description: "管理你的账户与作品，查看你的乐谱收藏，管理账户信息和设置",
  keywords: [
    "我的账户",
    "乐谱管理",
    "个人中心",
    "账户设置",
    "Ocarinana",
  ],
  openGraph: {
    title: "我的 - Ocarinana",
    description: "管理你的账户与作品，查看你的乐谱收藏",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HomeDashboardPage() {
  redirect("/protected/me");
}


