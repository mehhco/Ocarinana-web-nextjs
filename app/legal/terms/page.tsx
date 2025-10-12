import { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";

export const metadata: Metadata = {
  title: "用户协议",
  description: "Ocarinana 用户协议 - 使用条款和服务条件",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen flex flex-col">
      <AppNav currentPath="/legal/terms" />
      
      <div className="max-w-4xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-bold mb-8">用户协议（服务条款）</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-foreground/70">
            <strong>最后更新日期：</strong> 2025年10月12日<br />
            <strong>生效日期：</strong> 2025年10月12日
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. 接受条款</h2>
            <p>
              欢迎使用 Ocarinana！本用户协议（"协议"）是您（"用户"或"您"）与 Ocarinana
              （"我们"、"我们的"或"本平台"）之间具有法律约束力的合同。
            </p>
            <p>
              <strong>使用我们的服务即表示您同意遵守本协议的所有条款。</strong>
              如果您不同意本协议，请不要注册或使用我们的服务。
            </p>
            <p className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-500">
              ⚠️ <strong>重要：</strong>请仔细阅读本协议。使用服务即表示您已阅读、理解并同意受本协议约束。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. 服务说明</h2>
            <p>
              Ocarinana 是一款在线数字简谱生成器，提供以下功能：
            </p>
            <ul>
              <li>📝 数字简谱编辑和创作</li>
              <li>🎵 陶笛指法图自动匹配（C/F/G 调）</li>
              <li>🎤 歌词编辑和对齐</li>
              <li>💾 云端同步和本地存储</li>
              <li>🖼️ 高清图片导出</li>
              <li>🌓 暗黑模式和主题切换</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 服务可用性</h3>
            <p>
              我们努力确保服务 24/7 可用，但<strong>不保证</strong>服务不会中断。
              我们保留随时修改、暂停或终止服务的权利，恕不另行通知。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. 账户注册</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 账户要求</h3>
            <ul>
              <li>您必须年满 13 岁才能注册账户</li>
              <li>您必须提供真实、准确的邮箱地址</li>
              <li>您有责任保护账户密码的安全</li>
              <li>一人只能注册一个账户</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 账户安全</h3>
            <p>
              您对账户下发生的所有活动负责。如果您怀疑账户被未经授权访问，
              请立即联系我们：<strong className="text-primary">support@ocarinana.com</strong>
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 账户终止</h3>
            <p>我们保留以下权利：</p>
            <ul>
              <li>❌ 暂停或终止违反本协议的账户</li>
              <li>❌ 拒绝服务或删除账户，无需说明理由</li>
              <li>❌ 删除长期未使用的账户（180 天无活动）</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. 用户内容</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 内容所有权</h3>
            <p>
              <strong>您保留对自己创建的乐谱内容的所有权利。</strong>
              我们不会声称拥有您创建的内容的所有权。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 授权许可</h3>
            <p>
              使用我们的服务，您授予我们以下非排他性、全球性、免版税的许可：
            </p>
            <ul>
              <li>存储、处理和传输您的内容以提供服务</li>
              <li>创建备份以确保数据安全</li>
              <li>在您的授权下分享内容（如公开分享功能）</li>
            </ul>
            <p className="text-sm text-foreground/70">
              注：我们不会将您的私有内容用于营销或其他未经授权的目的。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 禁止内容</h3>
            <p>您不得上传、发布或传输以下内容：</p>
            <ul>
              <li>❌ 非法、有害、威胁、辱骂、骚扰、诽谤的内容</li>
              <li>❌ 侵犯他人版权、商标或其他知识产权的内容</li>
              <li>❌ 包含病毒、恶意代码或有害组件的内容</li>
              <li>❌ 垃圾信息、广告或未经请求的促销材料</li>
              <li>❌ 违反适用法律法规的内容</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.4 内容删除</h3>
            <p>
              我们保留删除任何违反本协议的内容的权利，无需事先通知。
              重复违规可能导致账户被永久封禁。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. 使用规则</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 允许的使用</h3>
            <ul>
              <li>✅ 个人音乐创作和学习</li>
              <li>✅ 教育用途（教师、学生）</li>
              <li>✅ 非商业性分享</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 禁止的使用</h3>
            <ul>
              <li>❌ 逆向工程、反编译或反汇编本服务</li>
              <li>❌ 使用自动化工具（机器人、爬虫）访问服务</li>
              <li>❌ 试图获取未经授权的访问权限</li>
              <li>❌ 干扰或破坏服务的正常运行</li>
              <li>❌ 大规模复制或下载内容用于商业目的</li>
              <li>❌ 冒充他人或虚假陈述与任何人或实体的关系</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 使用限制</h3>
            <p>为确保服务质量，我们可能会实施以下限制：</p>
            <ul>
              <li>免费用户：最多保存 10 个乐谱</li>
              <li>API 请求频率限制：每分钟 60 次请求</li>
              <li>文件大小限制：每个乐谱最多 5 MB</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. 付费服务（未来）</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 定价</h3>
            <p>
              当前所有功能免费提供。我们保留在未来引入付费功能的权利。
              任何付费功能将在实施前至少 30 天通知用户。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 退款政策</h3>
            <p>
              付费服务实施后，我们将提供 14 天无理由退款保证（仅限首次购买）。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. 知识产权</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 平台所有权</h3>
            <p>
              Ocarinana 平台及其所有内容（包括但不限于软件、设计、文本、图形、徽标）
              均为 Ocarinana 或其许可方的财产，受版权、商标和其他知识产权法保护。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 商标</h3>
            <p>
              "Ocarinana"名称和徽标是我们的注册商标。未经我们书面许可，
              您不得使用我们的商标、商号或商业外观。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 侵权通知</h3>
            <p>
              如果您认为您的版权作品被侵犯，请发送通知至：
              <strong className="text-primary"> dmca@ocarinana.com</strong>
            </p>
            <p>通知应包括：</p>
            <ul className="text-sm">
              <li>版权作品的描述</li>
              <li>侵权内容的位置</li>
              <li>您的联系信息</li>
              <li>诚信声明</li>
              <li>版权所有者的电子或实体签名</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. 免责声明</h2>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
              <p className="font-semibold mb-4">⚠️ 重要法律声明</p>
              <p>
                服务"按原样"和"按可用性"提供，不提供任何明示或暗示的保证。
                我们明确拒绝所有保证，包括但不限于：
              </p>
              <ul className="mt-4">
                <li>适销性保证</li>
                <li>特定用途适用性保证</li>
                <li>不侵权保证</li>
                <li>服务不会中断或无错误的保证</li>
              </ul>
              <p className="mt-4">
                <strong>您使用本服务的风险由您自行承担。</strong>
                我们不对因使用或无法使用服务而导致的任何损害负责。
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. 责任限制</h2>
            <p>
              在法律允许的最大范围内，Ocarinana 及其关联公司、董事、员工、
              代理人或许可方不对以下情况承担责任：
            </p>
            <ul>
              <li>❌ 任何间接、附带、特殊、后果性或惩罚性损害</li>
              <li>❌ 利润损失、数据丢失、使用中断</li>
              <li>❌ 第三方内容或行为</li>
              <li>❌ 未经授权访问或更改您的传输或数据</li>
            </ul>
            <p className="mt-4">
              <strong>我们的总责任不超过您在过去 12 个月内向我们支付的金额（如果有）。</strong>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. 赔偿</h2>
            <p>
              您同意赔偿、辩护并使 Ocarinana 及其关联方免受因以下原因引起的
              任何索赔、损害、义务、损失、责任、成本或债务及费用的损害：
            </p>
            <ul>
              <li>您使用和访问服务</li>
              <li>您违反本协议的任何条款</li>
              <li>您侵犯任何第三方权利（包括版权、隐私权）</li>
              <li>您上传的内容</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. 适用法律和争议解决</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">11.1 适用法律</h3>
            <p>
              本协议受中华人民共和国法律管辖并依其解释，不考虑其法律冲突条款。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">11.2 争议解决</h3>
            <p>争议解决优先级：</p>
            <ol>
              <li><strong>协商：</strong>友好协商解决（30 天内）</li>
              <li><strong>调解：</strong>通过第三方调解机构调解</li>
              <li><strong>仲裁：</strong>提交至中国国际经济贸易仲裁委员会（CIETAC）</li>
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. 一般条款</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">12.1 协议变更</h3>
            <p>
              我们保留随时修改本协议的权利。重大变更将通过邮件或网站通知提前 30 天通知。
              继续使用服务即表示您接受修改后的协议。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.2 完整协议</h3>
            <p>
              本协议构成您与 Ocarinana 之间关于服务的完整协议，
              并取代先前的任何口头或书面协议。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.3 可分割性</h3>
            <p>
              如果本协议的任何条款被认定为无效或不可执行，
              其余条款将继续完全有效。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.4 不放弃权利</h3>
            <p>
              我们未能执行本协议的任何条款不应被视为放弃该权利。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.5 转让</h3>
            <p>
              未经我们书面同意，您不得转让本协议项下的权利或义务。
              我们可以自由转让本协议。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. 联系我们</h2>
            <p>如果您对本协议有任何疑问，请通过以下方式联系我们：</p>
            <div className="bg-muted p-6 rounded-lg mt-4">
              <p className="mb-2"><strong>邮箱：</strong> mehhco@163.com</p>
              <p className="mb-2"><strong>客服：</strong> TEL: 18755933416</p>
              <p><strong>响应时间：</strong> 48 小时内回复</p>
            </div>
          </section>

          <section className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary">
            <h3 className="text-lg font-semibold mb-2">✅ 确认声明</h3>
            <p className="text-sm">
              通过点击"注册"、"我同意"或访问/使用服务，您确认：
            </p>
            <ul className="text-sm mt-2">
              <li>✅ 您已阅读并理解本协议</li>
              <li>✅ 您同意受本协议约束</li>
              <li>✅ 您满足使用服务的资格要求</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t text-center text-sm text-foreground/60">
            <p>
              相关文档：
              <Link href="/legal/privacy" className="text-primary underline ml-2">隐私政策</Link> |
              <Link href="/legal/cookies" className="text-primary underline ml-2">Cookie 政策</Link>
            </p>
            <p className="mt-4">© 2025 Ocarinana. 保留所有权利。</p>
          </div>
        </div>
      </div>
    </main>
  );
}

