import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { ErrorBoundary } from "@/components/error-boundary";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { BaiduAnalytics } from "@/components/analytics/baidu-analytics";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ResourceHints, COMMON_RESOURCE_HINTS } from "@/components/resource-hints";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Ocarinana - 陶笛谱生成器 | 在线数字简谱编辑工具",
    template: "%s | Ocarinana",
  },
  description: "Ocarinana 是专业的在线陶笛谱生成器，支持数字简谱编辑、陶笛指法图自动匹配、歌词编辑、高清图片导出。适合音乐爱好者、陶笛学习者和音乐教师使用。",
  keywords: [
    "陶笛谱",
    "数字简谱",
    "简谱生成器",
    "陶笛指法",
    "在线乐谱编辑",
    "音乐制作",
    "陶笛学习",
    "乐谱导出",
    "ocarina",
    "sheet music",
  ],
  authors: [{ name: "Ocarinana Team" }],
  creator: "Ocarinana",
  publisher: "Ocarinana",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: defaultUrl,
    title: "Ocarinana - 陶笛谱生成器",
    description: "专业的在线陶笛谱生成器，支持数字简谱编辑、指法图自动匹配、高清导出",
    siteName: "Ocarinana",
    images: [
      {
        url: `${defaultUrl}/opengraph-image.webp`,
        width: 1200,
        height: 630,
        alt: "Ocarinana - 陶笛谱生成器",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocarinana - 陶笛谱生成器",
    description: "专业的在线陶笛谱生成器，支持数字简谱编辑、指法图自动匹配",
    images: [`${defaultUrl}/twitter-image.webp`],
    creator: "@ocarinana",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: defaultUrl,
  },
  // 百度站长工具验证
  other: process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
    ? {
        'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION,
      }
    : {},
};

// 性能优化：字体优化配置
const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap", // 防止字体闪烁
  subsets: ["latin"],
  preload: true, // 预加载字体
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToastProvider />
            <CookieConsent />
          </ThemeProvider>
        </ErrorBoundary>
        
        {/* Analytics - 仅在用户同意后加载 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID && (
          <BaiduAnalytics baiduId={process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID} />
        )}
        
        {/* Service Worker - 性能优化：离线访问支持 */}
        <ServiceWorkerRegister />
        
        {/* 资源提示 - 性能优化：DNS预解析、预连接、预加载 */}
        <ResourceHints {...COMMON_RESOURCE_HINTS} />
      </body>
    </html>
  );
}
