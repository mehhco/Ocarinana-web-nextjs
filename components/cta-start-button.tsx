"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function CtaStartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/protected/editor/v2/new");
      } else {
        router.push("/editor");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className="h-12 rounded-md bg-emerald-700 px-8 text-base text-white shadow-sm hover:bg-emerald-800 focus-visible:ring-emerald-700 md:text-lg"
    >
      {loading ? "请稍候..." : "立即开始编辑"}
    </Button>
  );
}


