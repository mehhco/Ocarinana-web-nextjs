"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";

interface ScoreCardProps {
  scoreId: string;
  title: string;
  keySignature: string;
  timeSignature: string;
  updatedAt: string;
  onDelete: (scoreId: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "刚刚";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}个月前`;
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
}

export function ScoreCard({
  scoreId,
  title,
  keySignature,
  timeSignature,
  updatedAt,
  onDelete,
}: ScoreCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm(`确定要删除乐谱「${title}」吗？\n\n此操作不可恢复。`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/scores/${encodeURIComponent(scoreId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      onDelete(scoreId);
    } catch (error) {
      alert("删除失败，请重试");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 relative">
      <CardHeader className="pb-3">
        <Link href={`/protected/scores?scoreId=${encodeURIComponent(scoreId)}`}>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors cursor-pointer">
            {title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            1={keySignature}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {timeSignature}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatRelativeTime(updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link href={`/protected/scores?scoreId=${encodeURIComponent(scoreId)}`}>
              <Edit2 className="mr-1 h-3 w-3" />
              编辑
            </Link>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

