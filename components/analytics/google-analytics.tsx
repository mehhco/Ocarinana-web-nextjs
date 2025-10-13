"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

interface GoogleAnalyticsProps {
  gaId: string;
}

/**
 * Google Analytics 组件
 * 仅在生产环境、提供了 GA ID 且用户同意 Cookie 时加载
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // 检查初始同意状态
    const checkConsent = () => {
      const consent = localStorage.getItem("cookie-consent");
      setHasConsent(consent === "accepted");
    };

    checkConsent();

    // 监听同意状态变化
    const handleConsentAccepted = () => {
      setHasConsent(true);
    };

    const handleConsentRejected = () => {
      setHasConsent(false);
    };

    window.addEventListener("cookie-consent-accepted", handleConsentAccepted);
    window.addEventListener("cookie-consent-rejected", handleConsentRejected);

    return () => {
      window.removeEventListener("cookie-consent-accepted", handleConsentAccepted);
      window.removeEventListener("cookie-consent-rejected", handleConsentRejected);
    };
  }, []);

  // 不加载的条件
  if (!gaId || process.env.NODE_ENV !== "production" || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // 启用 IP 匿名化（GDPR 要求）
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

/**
 * 发送自定义事件到 GA
 */
export function sendGAEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined") {
    const w = window as unknown as Window & { gtag?: Function };
    if (w.gtag) {
      w.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }
}

/**
 * 发送页面浏览事件
 */
export function sendPageView(url: string) {
  if (typeof window !== "undefined") {
    const w = window as unknown as Window & { gtag?: Function };
    if (w.gtag) {
      w.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }
}

