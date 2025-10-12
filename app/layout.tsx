import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/providers/toast-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { BaiduAnalytics } from "@/components/analytics/baidu-analytics";
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
        url: `${defaultUrl}/opengraph-image.png`,
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
    images: [`${defaultUrl}/twitter-image.png`],
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: defaultUrl,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastProvider />
        </ThemeProvider>
        
        {/* Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID && (
          <BaiduAnalytics baiduId={process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
