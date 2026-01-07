import { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Cookie 政策 - Ocarinana",
  description: "Ocarinana Cookie 政策 - 我们如何使用 Cookie 及其他追踪技术。了解我们使用的Cookie类型和管理方式。",
  keywords: [
    "Cookie政策",
    "Cookie使用",
    "追踪技术",
    "数据收集",
    "Ocarinana Cookie",
  ],
  openGraph: {
    title: "Cookie 政策 - Ocarinana",
    description: "了解Ocarinana如何使用Cookie和其他追踪技术",
    type: "website",
  },
};

export default function CookiePolicy() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return (
    <main className="min-h-screen flex flex-col">
      <BreadcrumbSchema
        items={[
          { name: "首页", url: baseUrl },
          { name: "Cookie政策", url: `${baseUrl}/legal/cookies` },
        ]}
      />
      <AppNav currentPath="/legal/cookies" />
      
      <div className="max-w-4xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-bold mb-8">Cookie 政策</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-foreground/70">
            <strong>最后更新日期：</strong> 2025年10月12日<br />
            <strong>生效日期：</strong> 2025年10月12日
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. 什么是 Cookie？</h2>
            <p>
              Cookie 是当您访问网站时存储在您设备（电脑、手机或平板）上的小型文本文件。
              Cookie 使网站能够识别您的设备并记住您的偏好或操作。
            </p>
            <p>
              Cookie 有多种用途，例如帮助网站所有者了解用户如何使用其网站、
              让您保持登录状态或记住您的语言偏好。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. 我们使用的 Cookie 类型</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 必要 Cookie（始终启用）</h3>
            <p>
              这些 Cookie 对于网站的正常运行至关重要，无法禁用。
              它们通常仅在响应您的操作时设置，例如设置隐私偏好、登录或填写表单。
            </p>
            
            <div className="bg-muted p-4 rounded-lg my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Cookie 名称</th>
                    <th className="text-left py-2">用途</th>
                    <th className="text-left py-2">有效期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>sb-*-auth-token</code></td>
                    <td className="py-2">用户身份验证</td>
                    <td className="py-2">会话</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>cookie-consent</code></td>
                    <td className="py-2">记录 Cookie 同意状态</td>
                    <td className="py-2">永久</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code>theme</code></td>
                    <td className="py-2">保存主题偏好（亮/暗模式）</td>
                    <td className="py-2">永久</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 分析/性能 Cookie（可选）</h3>
            <p>
              这些 Cookie 帮助我们了解访问者如何与网站互动，收集匿名数据以改进网站。
              <strong>这些 Cookie 需要您的明确同意才会启用。</strong>
            </p>

            <div className="bg-muted p-4 rounded-lg my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">服务</th>
                    <th className="text-left py-2">Cookie 名称</th>
                    <th className="text-left py-2">用途</th>
                    <th className="text-left py-2">有效期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2"><code>_ga, _gid, _gat</code></td>
                    <td className="py-2">分析网站使用情况</td>
                    <td className="py-2">2年 / 24小时</td>
                  </tr>
                  <tr>
                    <td className="py-2">百度统计</td>
                    <td className="py-2"><code>HMACCOUNT, Hm_*</code></td>
                    <td className="py-2">分析访问者行为</td>
                    <td className="py-2">永久 / 会话</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 my-4">
              <p className="text-sm">
                📊 <strong>数据匿名化：</strong>
                我们已启用 IP 匿名化功能，Google Analytics 和百度统计收集的数据不包含任何可识别个人身份的信息。
              </p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 我们不使用的 Cookie</h3>
            <ul>
              <li>❌ <strong>广告 Cookie：</strong>我们不使用任何广告或营销 Cookie</li>
              <li>❌ <strong>社交媒体 Cookie：</strong>我们不嵌入社交媒体插件</li>
              <li>❌ <strong>第三方追踪 Cookie：</strong>除了分析工具外，我们不使用其他第三方追踪</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. 如何管理 Cookie</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 通过我们的网站</h3>
            <p>
              您可以随时通过页面底部的 Cookie 横幅来管理您的 Cookie 偏好。
              如果您已经做出选择，可以清除浏览器的本地存储来重新显示横幅。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 通过浏览器设置</h3>
            <p>
              大多数现代浏览器允许您控制 Cookie 设置。您可以：
            </p>
            <ul>
              <li>查看当前存储的 Cookie</li>
              <li>删除所有或特定 Cookie</li>
              <li>阻止所有或特定网站的 Cookie</li>
              <li>关闭浏览器时删除所有 Cookie</li>
            </ul>

            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">主流浏览器 Cookie 管理指南：</p>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Chrome：</strong>{" "}
                  <Link
                    href="https://support.google.com/chrome/answer/95647"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    管理 Cookie 设置
                  </Link>
                </li>
                <li>
                  <strong>Firefox：</strong>{" "}
                  <Link
                    href="https://support.mozilla.org/zh-CN/kb/clear-cookies-and-site-data-firefox"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    清除 Cookie 和站点数据
                  </Link>
                </li>
                <li>
                  <strong>Safari：</strong>{" "}
                  <Link
                    href="https://support.apple.com/zh-cn/guide/safari/sfri11471/mac"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    管理 Cookie 和网站数据
                  </Link>
                </li>
                <li>
                  <strong>Edge：</strong>{" "}
                  <Link
                    href="https://support.microsoft.com/zh-cn/microsoft-edge/删除-microsoft-edge-中的-cookie-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    删除 Cookie
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 my-4">
              <p className="text-sm">
                ⚠️ <strong>注意：</strong>
                如果您禁用或删除必要 Cookie，网站的某些功能可能无法正常工作（例如保持登录状态）。
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Do Not Track（DNT）</h2>
            <p>
              我们尊重浏览器的"Do Not Track"信号。如果您的浏览器启用了 DNT，
              我们将不会加载分析 Cookie，即使您尚未做出 Cookie 选择。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookie 政策更新</h2>
            <p>
              我们可能会不时更新本 Cookie 政策，以反映技术、法律或业务发展的变化。
              任何更改都会在本页面发布，并更新"最后更新日期"。
            </p>
            <p>
              我们建议您定期查看本政策，以了解我们如何使用 Cookie。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. 联系我们</h2>
            <p>
              如果您对我们的 Cookie 使用有任何疑问或担忧，请通过以下方式联系我们：
            </p>
            <div className="bg-muted p-6 rounded-lg mt-4">
              <p className="mb-2"><strong>邮箱：</strong> mehhco@163.com</p>
              <p><strong>响应时间：</strong> 我们将在 48 小时内回复您的询问</p>
            </div>
          </section>

          <section className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📌 您的权利</h3>
            <p className="text-sm">
              根据 GDPR 和 CCPA，您有权：
            </p>
            <ul className="text-sm mt-2">
              <li>✅ 知道我们收集的 Cookie 类型</li>
              <li>✅ 选择接受或拒绝非必要 Cookie</li>
              <li>✅ 随时撤回您的同意</li>
              <li>✅ 访问和删除我们收集的数据</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t text-center text-sm text-foreground/60">
            <p>
              相关文档：
              <Link href="/legal/privacy" className="text-primary underline ml-2">隐私政策</Link> |
              <Link href="/legal/terms" className="text-primary underline ml-2">用户协议</Link>
            </p>
            <p className="mt-4">© 2025 Ocarinana. 保留所有权利。</p>
          </div>
        </div>
      </div>
    </main>
  );
}

