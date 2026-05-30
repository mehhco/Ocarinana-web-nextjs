"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingButtonContent } from "@/components/loading-button-content";

export function CtaStartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/protected/editor/v2/new");
      } else {
        router.push("/editor");
      }
    } catch {
      setLoading(false);
    }
  }, [loading, router]);

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className="h-12 rounded-md bg-emerald-700 px-8 text-base text-white shadow-sm hover:bg-emerald-800 focus-visible:ring-emerald-700 md:text-lg"
    >
      <LoadingButtonContent loading={loading} loadingText="正在打开...">
        立即开始编辑
      </LoadingButtonContent>
    </Button>
  );
}


