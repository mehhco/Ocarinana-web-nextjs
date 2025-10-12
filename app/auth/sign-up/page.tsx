import { SignUpForm } from "@/components/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册 - Ocarinana",
  description: "注册 Ocarinana 账户开始创作",
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
