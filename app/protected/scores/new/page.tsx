import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewScoreRedirectPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  redirect("/protected/editor/v2/new");
}


