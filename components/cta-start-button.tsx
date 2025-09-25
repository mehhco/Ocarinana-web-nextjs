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
        router.push("/protected/scores");
      } else {
        router.push("/auth/login");
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
      className="px-10 py-6 text-base md:text-lg rounded-xl shadow-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white ring-2 ring-indigo-200/40"
    >
      {loading ? "请稍候..." : "立即开始编辑"}
    </Button>
  );
}


