"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  gaId: string;
}

/**
 * Google Analytics 组件
 * 仅在生产环境且提供了 GA ID 时加载
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId || process.env.NODE_ENV !== "production") {
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
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
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
  if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
    ((window as Window & { gtag: Function }).gtag)("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * 发送页面浏览事件
 */
export function sendPageView(url: string) {
  if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
    ((window as Window & { gtag: Function }).gtag)("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

