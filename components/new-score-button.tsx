"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NewScoreButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/scores", { method: "POST" });
      if (!res.ok) throw new Error("Create failed");
      const { scoreId } = await res.json();
      router.push(`/protected/scores?scoreId=${encodeURIComponent(scoreId)}`);
    } catch (e) {
      // 可加入 toast，这里简化
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleCreate} disabled={loading}>
      {loading ? "创建中..." : "新建"}
    </Button>
  );
}


