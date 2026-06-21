import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { ErrorBoundary } from "@/components/error-boundary";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { BaiduAnalytics } from "@/components/analytics/baidu-analytics";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ResourceHints, COMMON_RESOURCE_HINTS } from "@/components/resource-hints";
import {
  SITE_NAME,
  absoluteUrl,
  defaultKeywords,
  defaultOpenGraphImage,
  defaultTwitterImage,
  siteDescription,
  siteUrl,
} from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  title: {
    default: "Ocarinana - 在线陶笛谱生成器与数字简谱编辑器",
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  keywords: defaultKeywords,
  authors: [{ name: `${SITE_NAME} Team` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "music",
  classification: "MusicApplication",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    title: "Ocarinana - 在线陶笛谱生成器与数字简谱编辑器",
    description: siteDescription,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl(defaultOpenGraphImage),
        width: 1200,
        height: 630,
        alt: "Ocarinana 在线陶笛谱生成器",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocarinana - 在线陶笛谱生成器",
    description: siteDescription,
    images: [absoluteUrl(defaultTwitterImage)],
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
    canonical: siteUrl,
  },
  other: process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
    ? {
        "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION,
      }
    : {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <ToastProvider />
            <CookieConsent />
          </ThemeProvider>
        </ErrorBoundary>

        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID && (
          <BaiduAnalytics baiduId={process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID} />
        )}

        <ServiceWorkerRegister />
        <ResourceHints {...COMMON_RESOURCE_HINTS} />
      </body>
    </html>
  );
}
