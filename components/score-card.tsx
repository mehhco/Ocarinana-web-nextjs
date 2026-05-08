"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2Icon, EyeIcon, EyeOffIcon, Trash2Icon } from "@/components/ui/icons";

interface ScoreCardProps {
  scoreId: string;
  title: string;
  keySignature: string;
  timeSignature: string;
  updatedAt: string;
  isPublic?: boolean;
  publishedAt?: string | null;
  editorHref?: string;
  onDelete: (scoreId: string) => void;
  onVisibilityChange?: (
    scoreId: string,
    nextState: { isPublic: boolean; publishedAt?: string | null }
  ) => void;
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
  isPublic = false,
  publishedAt,
  editorHref,
  onDelete,
  onVisibilityChange,
}: ScoreCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const href = editorHref || `/protected/scores?scoreId=${encodeURIComponent(scoreId)}`;

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
      console.error("删除乐谱失败:", error);
      alert("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVisibilityToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextIsPublic = !isPublic;
    const confirmed = nextIsPublic
      ? confirm(
          `公开乐谱「${title}」？\n\n公开后，所有访客都可以在乐谱广场查看标题、乐谱内容、歌词和基础信息。\n\n请确认你拥有该内容的版权或已获得授权，且乐谱中不包含隐私信息。`
        )
      : confirm(`取消公开乐谱「${title}」？\n\n取消后，其他访客将无法继续从乐谱广场查看它。`);

    if (!confirmed) return;

    setIsUpdatingVisibility(true);
    try {
      const res = await fetch(`/api/scores/${encodeURIComponent(scoreId)}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: nextIsPublic }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || "更新公开状态失败");

      onVisibilityChange?.(scoreId, {
        isPublic: payload.isPublic,
        publishedAt: payload.publishedAt,
      });
    } catch (error) {
      console.error("更新公开状态失败:", error);
      alert(error instanceof Error ? error.message : "更新公开状态失败，请重试");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-shadow duration-200 hover:shadow-lg ${
        isPublic ? "border-emerald-200 shadow-emerald-100/60" : ""
      }`}
    >
      <Button
        size="sm"
        variant={isPublic ? "outline" : "default"}
        onClick={handleVisibilityToggle}
        disabled={isUpdatingVisibility}
        title={isPublic ? "取消公开" : "公开到乐谱广场"}
        className={`absolute right-3 top-3 z-10 h-8 rounded-full px-3 text-xs font-semibold shadow-sm ${
          isPublic
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isPublic ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
        <span>{isUpdatingVisibility ? "更新中" : isPublic ? "已公开" : "公开"}</span>
      </Button>

      <CardHeader className="pb-3 pr-28">
        <Link href={href}>
          <CardTitle className="line-clamp-2 cursor-pointer text-lg transition-colors group-hover:text-emerald-600">
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
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{formatRelativeTime(updatedAt)}</span>
          {isPublic && publishedAt && <span>公开于 {formatRelativeTime(publishedAt)}</span>}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={href}>
              <Edit2Icon className="mr-1 h-3 w-3" />
              编辑
            </Link>
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2Icon className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
