import { UpdatePasswordForm } from "@/components/update-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "更新密码 - Ocarinana",
  description: "更新您的 Ocarinana 账户密码",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
