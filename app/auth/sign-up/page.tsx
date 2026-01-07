import { SignUpForm } from "@/components/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册 - Ocarinana",
  description: "注册 Ocarinana 账户，免费使用专业的在线陶笛谱生成器，开始创作你的数字简谱与陶笛指法谱",
  keywords: [
    "Ocarinana注册",
    "陶笛谱生成器注册",
    "免费注册",
    "在线乐谱工具注册",
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
        <SignUpForm />
      </div>
    </div>
  );
}
