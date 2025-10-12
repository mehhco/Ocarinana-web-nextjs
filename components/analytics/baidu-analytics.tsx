"use client";

import Script from "next/script";

interface BaiduAnalyticsProps {
  baiduId: string;
}

/**
 * 百度统计组件
 * 仅在生产环境且提供了百度统计 ID 时加载
 */
export function BaiduAnalytics({ baiduId }: BaiduAnalyticsProps) {
  if (!baiduId || process.env.NODE_ENV !== "production") {
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

