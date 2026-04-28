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
    router.push("/protected/editor/v2/new");
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleCreate} disabled={loading}>
      {loading ? "创建中..." : "新建"}
    </Button>
  );
}


