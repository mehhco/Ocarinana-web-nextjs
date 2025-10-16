"use client";

import { useEffect, useRef } from "react";
import { showSuccess, showError } from "@/lib/toast";

type ScoreDocument = {
  version: string;
  scoreId: string;
  ownerUserId?: string;
  title: string;
  measures: unknown[];
  ties: unknown[];
  lyrics: unknown[];
  settings: {
    keySignature: string;
    timeSignature: string;
    tempo: number;
    skin: string;
    showLyrics: boolean;
    showFingering: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

interface ScoresBridgeProps {
  iframeId: string;
}

export default function ScoresBridge({ iframeId }: ScoresBridgeProps) {
  const iframeWindowRef = useRef<Window | null>(null);

  // 获取 iframe window 引用
  useEffect(() => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    iframeWindowRef.current = iframe?.contentWindow || null;
  }, [iframeId]);

  // 接收 iframe 消息，处理自动保存、创建记录等
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      // 🔒 安全检查：验证消息来源
      // 只接受来自同域的消息（iframe 加载的是 /webfile/index.html）
      const allowedOrigin = window.location.origin;
      if (event.origin !== allowedOrigin) {
        return;
      }

      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      
      // 自动保存（仅针对已持久化的乐谱）
      if (msg.type === "score:autosave" && msg.payload) {
        const doc: ScoreDocument = msg.payload;
        try {
          const res = await fetch(`/api/scores/${encodeURIComponent(doc.scoreId)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
          });
          if (!res.ok) {
            throw new Error(`自动保存失败: ${res.status}`);
          }
          // 自动保存成功（静默，不打扰用户）
        } catch (e) {
          // 显示友好的错误提示
          const errorMsg = e instanceof Error ? e.message : "自动保存失败";
          showError(`${errorMsg}，数据已保存到本地`);
        }
      }
      
      // 首次创建记录（用户手动保存并确认）
      if (msg.type === "score:create" && msg.payload) {
        const doc: ScoreDocument = msg.payload;
        try {
          const res = await fetch('/api/scores', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
          });
          
          if (res.ok) {
            const { scoreId } = await res.json();
            showSuccess('乐谱已保存到云端');
            // 通知iframe创建成功，返回真实ID
            iframeWindowRef.current?.postMessage({ 
              type: 'score:created',
              success: true,
              scoreId 
            }, window.location.origin);
          } else {
            const errorText = await res.text().catch(() => '未知错误');
            showError(`保存失败: ${errorText}`);
            // 通知iframe创建失败
            iframeWindowRef.current?.postMessage({ 
              type: 'score:created',
              success: false,
              error: '创建失败'
            }, window.location.origin);
          }
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : '网络错误';
          showError(`保存失败: ${errorMsg}`);
          // 通知iframe创建失败
          iframeWindowRef.current?.postMessage({ 
            type: 'score:created',
            success: false,
            error: errorMsg
          }, window.location.origin);
        }
      }
      
      // 更新URL（草稿ID → 真实ID）
      if (msg.type === "score:updateUrl" && msg.payload?.scoreId) {
        const newUrl = `/protected/scores?scoreId=${encodeURIComponent(msg.payload.scoreId)}`;
        window.history.replaceState({}, '', newUrl);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // 如 URL 带有 scoreId，则尝试从后端加载并注入到 iframe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scoreId = params.get("scoreId");
    if (!scoreId) return;

    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/scores/${encodeURIComponent(scoreId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const doc: ScoreDocument = await res.json();
        if (aborted) return;
        if (iframeWindowRef.current) {
          // 🔒 指定目标源，不使用通配符 "*"
          iframeWindowRef.current.postMessage(
            { type: "score:load", payload: doc },
            window.location.origin
          );
        }
      } catch {}
    })();

    return () => {
      aborted = true;
    };
  }, []);

  return null;
}


