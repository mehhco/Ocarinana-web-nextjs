"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PendingLink } from "@/components/pending-link";
import { CheckIcon, Edit2Icon, EyeIcon, EyeOffIcon, InfoIcon, Trash2Icon } from "@/components/ui/icons";
import { showError, showSuccess } from "@/lib/toast";

interface ScoreCardProps {
  scoreId: string;
  title: string;
  instrumentType?: string;
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

type PublicationFailureDetails = {
  title: string;
  message: string;
  noteCount: number | null;
  titleLength: number | null;
  dominantMusicElement: string | null;
  dominantMusicElementCount: number | null;
  dominantMusicElementRatio: number | null;
  failedRules: string[];
  rules: string[];
};

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

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text ? { error: text } : null;
}

function getReadableDetails(details: unknown): string {
  if (typeof details === "string") return details;
  if (Array.isArray(details)) {
    return details
      .map((item) => getReadableDetails(item))
      .filter(Boolean)
      .join("；");
  }
  if (details && typeof details === "object") {
    const record = details as Record<string, unknown>;
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.error === "string"
          ? record.error
          : "";
    const stats =
      typeof record.noteCount === "number" || typeof record.titleLength === "number"
        ? `当前：标题长度 ${typeof record.titleLength === "number" ? record.titleLength : "-"}，音乐内容 ${typeof record.noteCount === "number" ? record.noteCount : "-"} 个。`
        : "";
    const rules = Array.isArray(record.rules)
      ? `规则：${record.rules.filter((rule): rule is string => typeof rule === "string").join("；")}`
      : "";

    return [message, stats, rules].filter(Boolean).join(" ");
  }

  return "";
}

function getApiErrorMessage(
  payload: unknown,
  fallback: string,
  status: number,
  statusText: string
): string {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  const message =
    typeof record?.error === "string"
      ? record.error
      : typeof record?.message === "string"
        ? record.message
        : "";
  const details = getReadableDetails(record?.details);
  const statusMessage = status ? `请求失败（${status}${statusText ? ` ${statusText}` : ""}）` : "";
  const baseMessage = message || statusMessage || fallback;

  return details && details !== baseMessage ? `${baseMessage}：${details}` : baseMessage;
}

function getPublicationFailureDetails(payload: unknown, fallbackTitle: string): PublicationFailureDetails | null {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  const details =
    record?.details && typeof record.details === "object"
      ? (record.details as Record<string, unknown>)
      : null;

  if (!details) return null;

  const rules = Array.isArray(details.rules)
    ? details.rules.filter((rule): rule is string => typeof rule === "string")
    : [];
  const failedRules = Array.isArray(details.failedRules)
    ? details.failedRules.filter((rule): rule is string => typeof rule === "string")
    : [];
  const message =
    typeof details.message === "string"
      ? details.message
      : typeof record?.error === "string"
        ? record.error
        : fallbackTitle;

  return {
    title: typeof record?.error === "string" ? record.error : fallbackTitle,
    message,
    noteCount: typeof details.noteCount === "number" ? details.noteCount : null,
    titleLength: typeof details.titleLength === "number" ? details.titleLength : null,
    dominantMusicElement:
      typeof details.dominantMusicElement === "string" ? details.dominantMusicElement : null,
    dominantMusicElementCount:
      typeof details.dominantMusicElementCount === "number" ? details.dominantMusicElementCount : null,
    dominantMusicElementRatio:
      typeof details.dominantMusicElementRatio === "number" ? details.dominantMusicElementRatio : null,
    failedRules,
    rules,
  };
}

function PublicationFailureDialog({
  details,
  onClose,
}: {
  details: PublicationFailureDetails;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div
        aria-modal="true"
        className="max-h-[min(86vh,44rem)] w-full max-w-2xl overflow-hidden rounded-lg border border-red-200 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="border-b border-red-100 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700">
              <InfoIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-red-950">{details.title}</h2>
              <p className="mt-1 text-sm leading-6 text-red-800">{details.message}</p>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(min(86vh,44rem)-8.5rem)] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-medium text-slate-500">标题长度</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{details.titleLength ?? "-"}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-medium text-slate-500">音乐内容</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{details.noteCount ?? "-"} 个</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-medium text-slate-500">最高重复占比</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">
                {details.dominantMusicElementRatio === null
                  ? "-"
                  : `${Math.round(details.dominantMusicElementRatio * 100)}%`}
              </div>
            </div>
          </div>

          {details.dominantMusicElement && (
            <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              重复最多的元素：
              <span className="font-semibold text-slate-950">{details.dominantMusicElement}</span>
              {details.dominantMusicElementCount !== null && (
                <span>，出现 {details.dominantMusicElementCount} 次</span>
              )}
            </div>
          )}

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-950">未满足的规则</h3>
            <div className="mt-2 space-y-2">
              {(details.failedRules.length > 0 ? details.failedRules : [details.message]).map((rule) => (
                <div key={rule} className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-900">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-600" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-950">全部公开规则</h3>
            <div className="mt-2 space-y-2">
              {details.rules.map((rule) => {
                const failed = details.failedRules.includes(rule);

                return (
                  <div
                    key={rule}
                    className={`flex gap-2 rounded-md border px-3 py-2 text-sm leading-6 ${
                      failed
                        ? "border-red-200 bg-red-50 text-red-900"
                        : "border-emerald-200 bg-emerald-50 text-emerald-900"
                    }`}
                  >
                    {failed ? (
                      <InfoIcon className="mt-1 h-4 w-4 flex-shrink-0 text-red-600" />
                    ) : (
                      <CheckIcon className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-700" />
                    )}
                    <span>{rule}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-white px-5 py-3">
          <Button onClick={onClose}>我知道了</Button>
        </div>
      </div>
    </div>
  );
}

export function ScoreCard({
  scoreId,
  title,
  instrumentType = "12-hole",
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
  const [publicationFailure, setPublicationFailure] = useState<PublicationFailureDetails | null>(null);
  const href = editorHref || `/protected/scores?scoreId=${encodeURIComponent(scoreId)}`;
  const instrumentLabel = instrumentType === "6-hole" ? "六孔" : "十二孔";

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

      const payload = await readResponsePayload(res);
      if (!res.ok) {
        const message = getApiErrorMessage(
          payload,
          nextIsPublic ? "公开失败，请稍后重试" : "取消公开失败，请稍后重试",
          res.status,
          res.statusText
        );
        const failureDetails = getPublicationFailureDetails(payload, "公开乐谱未通过质量检查");

        if (failureDetails) {
          setPublicationFailure(failureDetails);
          showError("公开未通过，请查看检查结果");
        } else {
          showError(message);
        }
        return;
      }

      if (!payload || typeof payload !== "object") {
        showError("服务器返回数据为空，公开状态可能未更新");
        return;
      }

      const visibilityPayload = payload as {
        isPublic?: boolean;
        publishedAt?: string | null;
      };

      onVisibilityChange?.(scoreId, {
        isPublic: visibilityPayload.isPublic ?? nextIsPublic,
        publishedAt: visibilityPayload.publishedAt,
      });
      setPublicationFailure(null);
      showSuccess(nextIsPublic ? "已公开到乐谱广场" : "已取消公开");
    } catch (error) {
      showError(error instanceof Error ? error.message : "更新公开状态失败，请重试");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  return (
    <>
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
          <Badge variant="outline" className="text-xs">
            {instrumentLabel}
          </Badge>
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
            <PendingLink href={href} pendingText="打开中..." showPendingSpinner>
              <Edit2Icon className="mr-1 h-3 w-3" />
              编辑
            </PendingLink>
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2Icon className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
    {publicationFailure && (
      <PublicationFailureDialog
        details={publicationFailure}
        onClose={() => setPublicationFailure(null)}
      />
    )}
    </>
  );
}
