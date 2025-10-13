"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Cookie 同意横幅组件
 * 符合 GDPR/CCPA 要求
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 检查用户是否已经做出选择
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // 延迟显示，避免干扰首屏加载
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    
    // 触发自定义事件，通知 Analytics 可以加载
    window.dispatchEvent(new Event("cookie-consent-accepted"));
    
    // 如果页面已经加载但 Analytics 未初始化，刷新页面
    if (typeof window !== "undefined") {
      const w = window as unknown as Window & { gtag?: Function };
      if (!w.gtag) {
        window.location.reload();
      }
    }
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowBanner(false);
    
    // 触发自定义事件，通知不加载 Analytics
    window.dispatchEvent(new Event("cookie-consent-rejected"));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie 同意横幅"
    >
      <div className="max-w-6xl mx-auto px-5 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* 说明文本 */}
          <div className="flex-1">
            <p className="text-sm text-foreground/80">
              🍪 我们使用 Cookie 来改善您的浏览体验、分析网站流量并提供个性化内容。
              通过点击"接受"，您同意我们使用 Cookie。
              了解更多请查看我们的{" "}
              <Link
                href="/legal/privacy"
                className="text-primary underline hover:no-underline"
              >
                隐私政策
              </Link>
              {" "}和{" "}
              <Link
                href="/legal/cookies"
                className="text-primary underline hover:no-underline"
              >
                Cookie 政策
              </Link>
              。
            </p>
          </div>

          {/* 按钮组 */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
              aria-label="拒绝 Cookie"
            >
              拒绝
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              aria-label="接受 Cookie"
            >
              接受所有 Cookie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 检查用户是否已同意 Cookie
 */
export function hasConsentedToCookies(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem("cookie-consent") === "accepted";
}

/**
 * 清除 Cookie 同意状态（用于测试或重置）
 */
export function clearCookieConsent(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cookie-consent");
  }
}

