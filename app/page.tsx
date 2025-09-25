import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CtaStartButton } from "@/components/cta-start-button";
import Image from "next/image";
import { Spicy_Rice } from "next/font/google";

const spicyRice = Spicy_Rice({ subsets: ["latin"], weight: "400", display: "swap" });

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-stretch">
      {/* 顶部导航 */}
      <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className={`${spicyRice.className} font-bold text-4xl text-emerald-600 drop-shadow`}>Ocarinana</Link>
            <div className="hidden md:flex items-center gap-5 text-xl">
              <Link href="/" className="hover:underline">首页</Link>
              <Link href="#" className="hover:underline">乐曲</Link>
              <Link href="#" className="hover:underline">我的</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="w-full border-b">
        <div className="w-full max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              生成你的数字简谱与陶笛指法谱
            </h1>
            <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
              Ocarinana 是一款面向音乐爱好者与创作者的在线乐谱生成器。通过直观的交互面板，快速编排数字简谱，并自动匹配陶笛指法图，随时导出与分享。
            </p>
            <div className="flex items-center gap-4">
              <CtaStartButton />
              <Link href="#features" className="text-sm underline underline-offset-4">
                了解功能
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-2 text-xs text-foreground/60">
              <span>无需安装</span>
              <span>实时编辑</span>
              <span>导出图片</span>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow border bg-muted/20">
            {/* 开源无版权配图：来自 unsplash 源。仅作占位图片引用链接，不下载到项目中。*/}
            <Image
              src="/webfile/static/Cfinger.png"
              alt="Ocarina and sheet music"
              width={1200}
              height={800}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full border-b">
        <div className="w-full max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6">
          {[
            { title: "所见即所得", desc: "点击即可编排音符、休止与修饰符号。" },
            { title: "陶笛指法联动", desc: "自动根据调号与音高显示指法图。" },
            { title: "一键导出", desc: "高分辨率图片导出，适合打印与分享。" },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border p-6 bg-background">
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grids */}
      <section className="w-full border-b">
        <div className="w-full max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6 auto-rows-[200px]">
          <div className="md:col-span-2 row-span-2 rounded-xl border p-6 flex flex-col justify-between bg-gradient-to-br from-muted/40 to-background">
            <div>
              <h3 className="font-semibold mb-2">快速上手</h3>
              <p className="text-sm text-foreground/70">打开即用，内置常用节拍与调号模版。</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop"
              alt="Music notes"
              className="rounded-lg object-cover w-full h-40"
              loading="lazy"
            />
          </div>
          <div className="rounded-xl border p-6 bg-background">
            <h3 className="font-semibold mb-2">键盘友好</h3>
            <p className="text-sm text-foreground/70">支持键盘输入、快捷切换与撤销/恢复。</p>
          </div>
          <div className="rounded-xl border p-6 bg-background">
            <h3 className="font-semibold mb-2">本地保存</h3>
            <p className="text-sm text-foreground/70">自动保存到浏览器，随时继续创作。</p>
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
      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
