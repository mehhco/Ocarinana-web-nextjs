"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

interface BaiduAnalyticsProps {
  baiduId: string;
}

/**
 * 百度统计组件
 * 仅在生产环境、提供了百度统计 ID 且用户同意 Cookie 时加载
 */
export function BaiduAnalytics({ baiduId }: BaiduAnalyticsProps) {
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
  if (!baiduId || process.env.NODE_ENV !== "production" || !hasConsent) {
    return null;
  }

  return (
    <Script
      id="baidu-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?${baiduId}";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
          })();
        `,
      }}
    />
  );
}

