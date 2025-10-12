import { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "Ocarinana 隐私政策 - 我们如何收集、使用和保护您的个人信息",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen flex flex-col">
      <AppNav currentPath="/legal/privacy" />
      
      <div className="max-w-4xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-bold mb-8">隐私政策</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-foreground/70">
            <strong>最后更新日期：</strong> 2025年10月12日<br />
            <strong>生效日期：</strong> 2025年10月12日
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. 引言</h2>
            <p>
              欢迎使用 Ocarinana（"我们"、"我们的"或"本平台"）。我们重视您的隐私，并致力于保护您的个人信息。
              本隐私政策说明了我们如何收集、使用、存储和保护您在使用本平台时提供的信息。
            </p>
            <p>
              使用 Ocarinana 即表示您同意本隐私政策中描述的做法。如果您不同意本政策，请不要使用我们的服务。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. 我们收集的信息</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 您主动提供的信息</h3>
            <ul>
              <li><strong>账户信息：</strong>注册时提供的邮箱地址、密码（加密存储）</li>
              <li><strong>乐谱内容：</strong>您创建和保存的数字简谱、歌词、设置等</li>
              <li><strong>用户反馈：</strong>您通过表单或邮件发送的反馈和问题</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 自动收集的信息</h3>
            <ul>
              <li><strong>使用数据：</strong>页面访问记录、功能使用情况、操作日志</li>
              <li><strong>设备信息：</strong>浏览器类型、操作系统、IP 地址（匿名化）</li>
              <li><strong>Cookie：</strong>用于身份验证和功能优化的必要 Cookie</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 我们不收集的信息</h3>
            <ul>
              <li>✅ 我们不收集您的姓名、电话号码、地址等个人身份信息</li>
              <li>✅ 我们不跟踪您在其他网站的活动</li>
              <li>✅ 我们不出售或共享您的个人信息给第三方</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. 信息的使用方式</h2>
            <p>我们收集的信息仅用于以下目的：</p>
            <ul>
              <li><strong>提供服务：</strong>创建账户、保存乐谱、同步数据</li>
              <li><strong>改进产品：</strong>分析用户行为以优化功能和体验</li>
              <li><strong>技术支持：</strong>解决技术问题、回复用户咨询</li>
              <li><strong>安全保护：</strong>防止欺诈、滥用和未经授权的访问</li>
              <li><strong>通信：</strong>发送服务通知、功能更新（您可随时退订）</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. 数据存储和安全</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 存储位置</h3>
            <p>
              您的数据存储在 Supabase（PostgreSQL 数据库）和 Vercel（应用托管）上，
              服务器位于 <strong>美国</strong>。我们使用符合行业标准的云服务提供商。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 安全措施</h3>
            <ul>
              <li>✅ <strong>加密传输：</strong>所有数据通过 HTTPS/TLS 加密传输</li>
              <li>✅ <strong>密码保护：</strong>密码使用 bcrypt 加密存储</li>
              <li>✅ <strong>访问控制：</strong>行级安全策略（RLS）确保用户只能访问自己的数据</li>
              <li>✅ <strong>定期备份：</strong>数据库每日自动备份</li>
              <li>✅ <strong>安全审计：</strong>定期进行安全漏洞扫描</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 数据保留</h3>
            <p>
              - <strong>账户数据：</strong>在您账户激活期间一直保留<br />
              - <strong>删除请求：</strong>账户删除后，所有个人数据在 30 天内永久删除<br />
              - <strong>法律要求：</strong>某些数据可能因法律要求保留更长时间（如财务记录）
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookie 和追踪技术</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 必要 Cookie</h3>
            <p>用于身份验证和会话管理，无法禁用，否则无法使用服务。</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 分析 Cookie</h3>
            <p>使用 Google Analytics 分析网站使用情况（匿名化）。您可以通过浏览器设置禁用。</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 管理 Cookie</h3>
            <p>
              大多数浏览器允许您控制 Cookie。请注意，禁用 Cookie 可能影响网站功能。
              <Link href="https://www.allaboutcookies.org/" className="text-primary underline" target="_blank">
                了解如何管理 Cookie
              </Link>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. 第三方服务</h2>
            <p>我们使用以下第三方服务，它们各有自己的隐私政策：</p>
            <ul>
              <li>
                <strong>Supabase：</strong>数据库和认证服务 - 
                <Link href="https://supabase.com/privacy" className="text-primary underline" target="_blank">
                  隐私政策
                </Link>
              </li>
              <li>
                <strong>Vercel：</strong>应用托管 - 
                <Link href="https://vercel.com/legal/privacy-policy" className="text-primary underline" target="_blank">
                  隐私政策
                </Link>
              </li>
              <li>
                <strong>Google Analytics：</strong>网站分析 - 
                <Link href="https://policies.google.com/privacy" className="text-primary underline" target="_blank">
                  隐私政策
                </Link>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. 您的权利（GDPR/CCPA）</h2>
            <p>根据适用的数据保护法律，您拥有以下权利：</p>
            <ul>
              <li>✅ <strong>访问权：</strong>请求获取我们持有的您的个人数据副本</li>
              <li>✅ <strong>更正权：</strong>要求更正不准确的个人数据</li>
              <li>✅ <strong>删除权：</strong>要求删除您的个人数据（"被遗忘权"）</li>
              <li>✅ <strong>限制处理权：</strong>要求限制对您个人数据的处理</li>
              <li>✅ <strong>数据可移植权：</strong>以结构化、常用格式接收您的数据</li>
              <li>✅ <strong>反对权：</strong>反对我们处理您的个人数据</li>
            </ul>

            <p className="mt-4">
              如需行使这些权利，请发送邮件至：
              <strong className="text-primary"> privacy@ocarinana.com</strong><br />
              我们将在 30 天内回复您的请求。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. 儿童隐私</h2>
            <p>
              Ocarinana 不针对 13 岁以下儿童。我们不会故意收集 13 岁以下儿童的个人信息。
              如果我们发现无意中收集了儿童的信息，将立即删除。
            </p>
            <p>
              如果您是家长/监护人并发现您的孩子向我们提供了个人信息，请联系我们。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. 国际数据传输</h2>
            <p>
              您的信息可能会被传输到您所在国家/地区以外的服务器并在那里进行处理。
              这些国家/地区的数据保护法律可能与您所在司法管辖区的法律不同。
            </p>
            <p>
              通过使用我们的服务，您同意将您的信息传输到这些国家/地区。
              我们将采取合理措施确保您的数据得到安全处理，并符合本隐私政策。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. 隐私政策变更</h2>
            <p>
              我们可能会不时更新本隐私政策。任何更改将在本页面发布，并更新"最后更新日期"。
            </p>
            <p>
              <strong>重大变更：</strong>如果我们对隐私政策做出重大更改，我们将通过邮件或网站通知您。
            </p>
            <p>
              建议您定期查看本隐私政策，以了解我们如何保护您的信息。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. 联系我们</h2>
            <p>
              如果您对本隐私政策或我们的隐私实践有任何疑问、意见或请求，请通过以下方式联系我们：
            </p>
            <div className="bg-muted p-6 rounded-lg mt-4">
              <p className="mb-2"><strong>邮箱：</strong> mehhco@163.com</p>
              <p><strong>响应时间：</strong> 我们将在 48 小时内回复您的询问</p>
            </div>
          </section>

          <section className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📌 重要提示</h3>
            <p className="text-sm">
              本隐私政策构成您与 Ocarinana 之间协议的一部分。
              继续使用我们的服务即表示您接受本隐私政策的条款。
            </p>
          </section>

          <div className="mt-12 pt-8 border-t text-center text-sm text-foreground/60">
            <p>
              相关文档：
              <Link href="/legal/terms" className="text-primary underline ml-2">用户协议</Link> |
              <Link href="/legal/cookies" className="text-primary underline ml-2">Cookie 政策</Link>
            </p>
            <p className="mt-4">© 2025 Ocarinana. 保留所有权利。</p>
          </div>
        </div>
      </div>
    </main>
  );
}

