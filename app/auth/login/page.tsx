import { LoginForm } from "@/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - Ocarinana",
  description: "登录到 Ocarinana 陶笛谱生成器，开始创建和管理你的数字简谱与陶笛指法谱",
  keywords: [
    "Ocarinana登录",
    "陶笛谱生成器登录",
    "在线乐谱工具登录",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
