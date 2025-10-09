"use client";

import { useEffect, useRef } from "react";

type ScoreDocument = {
  version: string;
  scoreId: string;
  ownerUserId?: string;
  title: string;
  measures: any[];
  ties: any[];
  lyrics: any[];
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

  // 接收 iframe 自动保存消息，并转发到 API
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "score:autosave" && msg.payload) {
        const doc: ScoreDocument = msg.payload;
        try {
          await fetch(`/api/scores/${encodeURIComponent(doc.scoreId)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
          });
        } catch (e) {
          // 忽略网络/权限错误，前端仍有本地存储兜底
          console.warn("Autosave failed:", e);
        }
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
          iframeWindowRef.current.postMessage({ type: "score:load", payload: doc }, "*");
        }
      } catch {}
    })();

    return () => {
      aborted = true;
    };
  }, []);

  return null;
}


