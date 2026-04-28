import Link from "next/link";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { CtaStartButton } from "@/components/cta-start-button";
import { AppNav } from "@/components/app-nav";
import Image from "next/image";
import { Metadata } from "next";
import { 
  WebSiteSchema, 
  SoftwareApplicationSchema, 
  OrganizationSchema,
  FAQPageSchema
} from "@/components/seo/structured-data";
import { ImagePreloader, CRITICAL_IMAGES } from "@/components/image-preloader";

export const metadata: Metadata = {
  title: "Ocarinana - 陶笛谱生成器 | 在线数字简谱编辑工具",
  description: "Ocarinana 是专业的在线陶笛谱生成器，支持数字简谱编辑、陶笛指法图自动匹配、歌词编辑、高清图片导出。适合音乐爱好者、陶笛学习者和音乐教师使用。",
  keywords: [
    "陶笛谱生成器",
    "数字简谱编辑器",
    "在线乐谱制作",
    "陶笛指法图",
    "简谱编辑工具",
    "音乐制作软件",
    "陶笛学习工具",
    "乐谱导出",
    "数字简谱",
    "陶笛谱",
  ],
  openGraph: {
    title: "Ocarinana - 陶笛谱生成器 | 在线数字简谱编辑工具",
    description: "专业的在线陶笛谱生成器，支持数字简谱编辑、陶笛指法图自动匹配、歌词编辑、高清图片导出",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return (
    <>
      {/* SEO: 结构化数据 */}
      <WebSiteSchema
        url={baseUrl}
        name="Ocarinana - 陶笛谱生成器"
        description="专业的在线陶笛谱生成器，支持数字简谱编辑、陶笛指法图自动匹配、歌词编辑、高清图片导出"
      />
      <SoftwareApplicationSchema
        name="Ocarinana"
        description="在线陶笛谱生成器，支持数字简谱编辑、陶笛指法图自动匹配"
        url={baseUrl}
        applicationCategory="MusicApplication"
        operatingSystem="Web Browser"
        offers={{
          price: "0",
          priceCurrency: "CNY",
        }}
      />
      <OrganizationSchema
        name="Ocarinana"
        url={baseUrl}
        logo={`${baseUrl}/opengraph-image.webp`}
        description="专业的在线音乐工具平台"
        sameAs={[
          // 可以添加社交媒体链接
          // "https://twitter.com/ocarinana",
          // "https://facebook.com/ocarinana",
        ]}
      />
      <FAQPageSchema
        faqs={[
          { 
            question: "需要登录才能使用吗？", 
            answer: "浏览与了解功能不需要登录；点击立即开始时会根据状态跳转。" 
          },
          { 
            question: "支持哪些导出格式？", 
            answer: "当前支持高质量 PNG 图片导出，其他格式待支持。" 
          },
          { 
            question: "数据会保存在云端吗？", 
            answer: "导出图片默认保存在浏览器本地，登录后可选择云端同步（筹备中）。" 
          },
          { 
            question: "是否收费？", 
            answer: "当前免费，后续可能根据使用情况调整价格。" 
          },
        ]}
      />
      
      {/* 顶部导航 */}
      <main className="min-h-screen flex flex-col items-stretch">
      {/* 性能优化：关键图片预加载 */}
      <ImagePreloader images={CRITICAL_IMAGES} priority={true} />

      <AppNav currentPath="/" />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b bg-[#fbfaf6]">
        <div className="absolute inset-0 opacity-[0.08]">
          <Image
            src="/webfile/static/Cfinger.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,250,246,0.98)_0%,rgba(251,250,246,0.9)_48%,rgba(251,250,246,0.68)_100%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-5 py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold text-emerald-800">
              在线陶笛谱生成器
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-zinc-950 md:text-6xl">
              在线制作数字简谱，自动生成陶笛指法图
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg">
              Ocarinana 面向陶笛学习者、音乐教师和内容创作者。输入简谱音符，实时预览 C/F/G 调指法图，完成后可导出适合打印与分享的高清图片。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaStartButton />
              <Link
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-300 bg-white/70 px-6 text-sm font-medium text-zinc-800 transition-colors hover:border-emerald-700 hover:text-emerald-800"
              >
                查看功能
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
              <span>无需安装</span>
              <span>支持指法图联动</span>
              <span>PNG 高清导出</span>
              <span>云端乐谱管理</span>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="grid border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 text-xs font-medium text-zinc-500 md:grid-cols-[1fr_auto] md:items-center">
              <span>示例输出：天空之城片段 · 1=C · 4/4</span>
              <span className="mt-1 text-emerald-800 md:mt-0">简谱 + 陶笛指法图</span>
            </div>
            <div className="grid gap-6 p-5 md:grid-cols-[1.4fr_0.8fr] md:p-6">
              <div className="rounded-md bg-[#fffdf7] p-5 ring-1 ring-zinc-200">
                <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
                  <span>1=C</span>
                  <span>4/4</span>
                  <span>♩=88</span>
                </div>
                <div className="grid grid-cols-4 gap-y-5 text-center text-2xl font-bold leading-none text-zinc-900 md:text-3xl">
                  {["5", "6", "7", "1", "7", "6", "5", "3", "5", "3", "2", "1"].map((note, index) => (
                    <span key={`${note}-${index}`} className="relative pb-4">
                      {note}
                      {index === 3 && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base leading-none">·</span>
                      )}
                      {[1, 5, 9].includes(index) && (
                        <span className="absolute bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-zinc-900" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center rounded-md bg-zinc-950 p-4">
                <Image
                  src="/webfile/static/Cfinger.png"
                  alt="陶笛指法图预览"
                  width={440}
                  height={300}
                  className="max-h-56 w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full border-b bg-white">
        <div className="w-full max-w-6xl mx-auto px-5 py-14">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-zinc-950 md:text-3xl">
              为陶笛谱制作而设计的核心流程
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              从输入音符到生成指法图，再到导出图片，围绕实际练习、教学和分享场景组织功能。
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
          {[
            { title: "所见即所得", desc: "点击即可编排音符、休止与修饰符号。" },
            { title: "陶笛指法联动", desc: "自动根据调号与音高显示指法图。" },
            { title: "一键导出", desc: "高分辨率图片导出，适合打印与分享。" },
          ].map((f) => (
            <div key={f.title} className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-6">
              <h3 className="mb-2 font-semibold text-zinc-950">{f.title}</h3>
              <p className="text-sm leading-6 text-zinc-600">{f.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Bento Grids */}
      <section className="w-full border-b bg-[#fbfaf6]">
        <div className="w-full max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-5 auto-rows-[200px]">
          <div className="md:col-span-2 row-span-2 rounded-md border border-zinc-200 p-6 flex flex-col justify-between bg-white">
            <div>
              <h3 className="font-semibold mb-2 text-zinc-950">快速上手</h3>
              <p className="text-sm leading-6 text-zinc-600">打开即用，内置常用节拍与调号模版。</p>
            </div>
            <Image
              src="/webfile/static/Cfinger.png"
              alt="陶笛指法图和简谱编辑预览"
              width={1200}
              height={400}
              className="rounded-md object-contain w-full h-40 bg-[#fffdf7] p-3 ring-1 ring-zinc-200"
              loading="lazy"
            />
          </div>
          <div className="rounded-md border border-zinc-200 p-6 bg-white">
            <h3 className="font-semibold mb-2 text-zinc-950">键盘友好</h3>
            <p className="text-sm leading-6 text-zinc-600">支持键盘输入、快捷切换与撤销/恢复。</p>
          </div>
          <div className="rounded-md border border-zinc-200 p-6 bg-white">
            <h3 className="font-semibold mb-2 text-zinc-950">本地保存</h3>
            <p className="text-sm leading-6 text-zinc-600">自动保存到浏览器，随时继续创作。</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full border-b">
        <div className="w-full max-w-6xl mx-auto px-5 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">准备好开始创作你的第一首乐曲了吗？</h2>
          <p className="mt-3 text-foreground/70">点击下方按钮立即使用 Ocarinana，或先了解常见问题。</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <CtaStartButton />
            <Link href="#faq" className="text-sm underline underline-offset-4">FAQ</Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      {/* <section className="w-full border-b">
        <div className="w-full max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6">
          {[
            { name: "免费版", price: "¥0", features: ["在线编辑", "图片导出", "本地保存"] },
            { name: "专业版", price: "¥29/月", features: ["高分辨率导出", "更多模版", "优先支持"] },
            { name: "团队版", price: "¥79/月", features: ["多人协作", "共享素材库", "团队管理"] },
          ].map((p) => (
            <div key={p.name} className="rounded-xl border p-6 bg-background flex flex-col">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="text-3xl font-extrabold mt-2">{p.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                {p.features.map((it) => (
                  <li key={it}>• {it}</li>
                ))}
              </ul>
              <div className="mt-6">
                <CtaStartButton />
              </div>
            </div>
          ))}
        </div>
      </section> */}

 

      {/* FAQ */}
      <section id="faq" className="w-full">
        <div className="w-full max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-8">
          {[
            { q: "需要登录才能使用吗？", a: "浏览与了解功能不需要登录；点击立即开始时会根据状态跳转。" },
            { q: "支持哪些导出格式？", a: "当前支持高质量 PNG 图片导出，其他格式待支持。" },
            { q: "数据会保存在云端吗？", a: "导出图片默认保存在浏览器本地，登录后可选择云端同步（筹备中）。" },
            { q: "是否收费？", a: "当前免费，后续可能根据使用情况调整价格。" },
          ].map((f) => (
            <div key={f.q} className="rounded-lg border p-6 bg-background">
              <div className="font-semibold mb-2">{f.q}</div>
              <div className="text-sm text-foreground/70">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 页脚 */}
      <footer className="w-full border-t">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/60">
              © {new Date().getFullYear()} Ocarinana · 陶笛谱生成器
            </p>
            <div className="flex items-center gap-6 text-xs">
              <Link href="/legal/privacy" className="text-foreground/60 hover:text-foreground transition-colors">
                隐私政策
              </Link>
              <Link href="/legal/terms" className="text-foreground/60 hover:text-foreground transition-colors">
                用户协议
              </Link>
              <LazyThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
      </main>
    </>
  );
}
