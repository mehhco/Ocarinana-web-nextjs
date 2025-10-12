import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "忘记密码 - Ocarinana",
  description: "重置您的 Ocarinana 账户密码",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
