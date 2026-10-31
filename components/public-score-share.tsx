"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Link2, LoaderCircle, QrCode, Share2, X } from "lucide-react";
import { sendGAEvent } from "@/components/analytics/google-analytics";
import { Button } from "@/components/ui/button";
import {
  buildPublicScoreShareText,
  buildPublicScoreShareUrl,
  type PublicScoreShareChannel,
} from "@/lib/share/public-score";
import { showError, showSuccess } from "@/lib/toast";

interface PublicScoreShareProps {
  scoreId: string;
  title: string;
  instrumentLabel: string;
  keySignature: string;
  timeSignature: string;
  url: string;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("浏览器未允许复制链接");
  }
}

export function PublicScoreShare({
  scoreId,
  title,
  instrumentLabel,
  keySignature,
  timeSignature,
  url,
}: PublicScoreShareProps) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const qrTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trackShare = useCallback(
    (channel: PublicScoreShareChannel) => {
      sendGAEvent("score_share", "public_score", `${scoreId}:${channel}`);
    },
    [scoreId]
  );

  const copyShareLink = useCallback(
    async (channel: PublicScoreShareChannel) => {
      try {
        await copyText(buildPublicScoreShareUrl(url, channel));
        setCopied(true);
        trackShare(channel);
        showSuccess("分享链接已复制");
        window.setTimeout(() => setCopied(false), 2200);
      } catch (error) {
        showError(error instanceof Error ? error.message : "复制失败，请稍后重试");
      }
    },
    [trackShare, url]
  );

  const handleShare = useCallback(async () => {
    const shareUrl = buildPublicScoreShareUrl(url, "native");
    const shareText = buildPublicScoreShareText({
      title,
      instrumentLabel,
      keySignature,
      timeSignature,
      url: shareUrl,
    });

    if (!navigator.share) {
      await copyShareLink("native");
      return;
    }

    try {
      await navigator.share({
        title: `《${title}》${instrumentLabel}陶笛谱`,
        text: shareText,
        url: shareUrl,
      });
      trackShare("native");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      showError("未能打开系统分享，请改用复制链接");
    }
  }, [
    copyShareLink,
    instrumentLabel,
    keySignature,
    timeSignature,
    title,
    trackShare,
    url,
  ]);

  const handleShowQr = useCallback(async () => {
    setQrOpen(true);
    if (qrImage) {
      trackShare("qr");
      return;
    }

    setQrLoading(true);
    try {
      const { default: QRCode } = await import("qrcode");
      const image = await QRCode.toDataURL(
        buildPublicScoreShareUrl(url, "qr"),
        {
          width: 640,
          margin: 2,
          errorCorrectionLevel: "M",
          color: {
            dark: "#12382b",
            light: "#fffdf6",
          },
        }
      );
      setQrImage(image);
      trackShare("qr");
    } catch {
      showError("二维码生成失败，请改用复制链接");
    } finally {
      setQrLoading(false);
    }
  }, [qrImage, trackShare, url]);

  useEffect(() => {
    if (!qrOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQrOpen(false);
      }
    };

    const trigger = qrTriggerRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      trigger?.focus();
    };
  }, [qrOpen]);

  return (
    <>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-zinc-600">分享乐谱</p>
          <p className="text-[11px] text-zinc-500">发给笛友或扫码查看</p>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-zinc-300 bg-white/70 px-3 text-zinc-700 hover:border-emerald-700 hover:bg-white hover:text-emerald-800"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            分享
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 border-zinc-300 bg-white/70 text-zinc-600 hover:border-emerald-700 hover:bg-white hover:text-emerald-800"
            aria-label="复制分享链接"
            title="复制分享链接"
            onClick={() => copyShareLink("copy")}
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            ref={qrTriggerRef}
            className="h-9 w-9 border-zinc-300 bg-white/70 text-zinc-600 hover:border-emerald-700 hover:bg-white hover:text-emerald-800"
            aria-label="显示分享二维码"
            title="显示分享二维码"
            onClick={handleShowQr}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mounted && qrOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setQrOpen(false);
                }
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="public-score-qr-title"
                aria-describedby="public-score-qr-description"
                className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-emerald-950/10 bg-[#fffdf6] p-4 text-zinc-950 shadow-2xl sm:p-5"
              >
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fffdf6]/90 text-zinc-500 transition-colors hover:bg-zinc-950/5 hover:text-zinc-950"
                  aria-label="关闭二维码"
                  title="关闭二维码"
                  onClick={() => setQrOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Ocarinana
                </p>
                <h2 id="public-score-qr-title" className="mt-2 pr-10 text-lg font-bold sm:text-xl">
                  《{title}》
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {instrumentLabel}陶笛谱 · 1={keySignature} · {timeSignature}
                </p>
                <div className="mx-auto mt-4 flex aspect-square w-full max-w-60 items-center justify-center rounded-xl border border-emerald-900/10 bg-white p-3">
                  {qrLoading ? (
                    <LoaderCircle className="h-8 w-8 animate-spin text-emerald-700" />
                  ) : qrImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrImage}
                      alt={`《${title}》分享二维码`}
                      className="h-auto max-h-full w-full object-contain"
                      width={240}
                      height={240}
                    />
                  ) : (
                    <p className="text-sm text-zinc-500">二维码暂不可用</p>
                  )}
                </div>
                <p
                  id="public-score-qr-description"
                  className="mt-3 text-center text-xs leading-5 text-zinc-500"
                >
                  使用微信或手机相机扫码，打开后仍然可以预览、导出和分享这份乐谱。
                </p>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
