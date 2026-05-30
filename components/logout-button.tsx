"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingButtonContent } from "@/components/loading-button-content";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.replace("/auth/login");
      router.refresh();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={logout} size="sm" variant="ghost" disabled={isLoading} aria-busy={isLoading}>
      <LoadingButtonContent loading={isLoading} loadingText="退出中...">
        退出
      </LoadingButtonContent>
    </Button>
  );
}
