import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  redirect("/protected/me");
}
