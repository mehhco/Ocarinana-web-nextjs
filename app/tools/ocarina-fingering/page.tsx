import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Music2 } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { BreadcrumbSchema, FAQPageSchema } from "@/components/seo/structured-data";
import { PrintFingeringButton } from "@/components/tools/print-fingering-button";
import { JianpuNote } from "@/components/jianpu-note";
import { Button } from "@/components/ui/button";
import {
  OCARINA_FINGERING_PATH,
  getOcarinaFingeringCharts,
  getTotalFingeringCount,
  type OcarinaFingeringChart,
} from "@/lib/tools/ocarina-fingering";
import { absoluteUrl } from "@/lib/seo/site";
import { SiteOwnerContact } from "../../site-owner-contact";

const url = absoluteUrl(OCARINA_FINGERING_PATH);

export const metadata: Metadata = {
  title: "陶笛指法表：六孔、十二孔 C/F/G 调指法图查询",
  description:
    "按孔数和调号查询陶笛指法：六孔、十二孔陶笛的 C 调、F 调、G 调指法图一页看全，每个音级都标注唱名和按孔方式，可打印，也可与编辑器里的指法图对照。",
  keywords: [
    "陶笛指法表",
    "六孔陶笛指法",
    "十二孔陶笛指法",
    "陶笛指法图",
    "陶笛 C 调指法",
    "陶笛 F 调指法",
    "陶笛 G 调指法",
    "陶笛音域",
    "ocarina fingering chart",
  ],
  openGraph: {
    title: "陶笛指法表：六孔、十二孔 C/F/G 调",
    description:
      "六孔、十二孔陶笛在 C / F / G 三个调下的指法图，按音高从低到高排列，可打印、可对照编辑器使用。",
    type: "article",
    url,
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "陶笛指法表：六孔、十二孔 C/F/G 调",
    description:
      "按孔数和调号查询陶笛指法图，含唱名、音域与按孔说明。",
  },
  alternates: {
    canonical: url,
    languages: {
      "zh-CN": url,
      en: absoluteUrl("/en/ocarina-fingering-chart"),
      "x-default": url,
    },
  },
};

const faqs = [
  {
    question: "六孔和十二孔的指法表能通用吗？",
    answer:
      "不能。两种陶笛的孔位数量和排列不同，同一个音级对应的按孔方式也不一样，查表前要先确认自己拿的是六孔还是十二孔。",
  },
  {
    question: "1=C、1=F、1=G 分别代表什么？",
    answer:
      "这是调号，表示简谱里的 1 对应哪个实际音高。同一支陶笛换调之后，每个音级的指法会整体变化，所以表要按调号分开看。",
  },
  {
    question: "为什么表里没有我想找的那个音？",
    answer:
      "每个孔数、每个调号都有可用音域，超出音域的音级没有对应指法，编辑器里同样不会提供。遇到这种情况可以换调、换陶笛，或者把旋律改写到可用音域内。",
  },
  {
    question: "指法图里的实心圆和空心圆是什么意思？",
    answer:
      "实心圆表示按住（闭合）这个孔，空心圆表示放开。换指时先确认按孔状态，再逐步缩短手指移动的距离。",
  },
  {
    question: "这张指法表和编辑器里显示的一致吗？",
    answer:
      "一致。页面和编辑器读取的是同一套指法映射，编辑器中切换孔数或调号后，谱面上的指法图和导出的图片都会随之更新。",
  },
];

function ChartSection({ chart }: { chart: OcarinaFingeringChart }) {
  return (
    <div id={chart.anchor} className="scroll-mt-24 break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
          1={chart.keySignature} 调
        </h3>
        <p className="flex flex-wrap items-center gap-1 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
          <span>可用音域</span>
          {chart.lowest && (
            <JianpuNote degree={chart.lowest.degree} octave={chart.lowest.register} />
          )}
          <span>—</span>
          {chart.highest && (
            <JianpuNote degree={chart.highest.degree} octave={chart.highest.register} />
          )}
          <span>· 共 {chart.notes.length} 个音</span>
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-5 print:gap-2">
        {chart.notes.map((note) => (
          <figure
            key={note.key}
            data-fingering-card
            className="break-inside-avoid rounded-lg border border-zinc-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] print:p-1 print:shadow-none"
          >
            <Image
              src={note.image}
              alt={note.alt}
              width={438}
              height={239}
              unoptimized
              loading="eager"
              decoding="async"
              className="h-auto w-full"
            />
            <figcaption className="mt-1.5 flex items-baseline justify-between gap-2 border-t border-dashed border-zinc-200 pt-1.5">
              <JianpuNote
                degree={note.degree}
                octave={note.register}
                className="text-base font-semibold text-zinc-900"
              />
              <span className="truncate text-[11px] text-zinc-500">{note.solfege}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function OcarinaFingeringPage() {
  const charts = getOcarinaFingeringCharts();
  const twelveHoleCharts = charts.filter((chart) => chart.instrument === "12-hole");
  const sixHoleCharts = charts.filter((chart) => chart.instrument === "6-hole");
  const totalFingering = getTotalFingeringCount(charts);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-zinc-950 dark:bg-[#0b120d] dark:text-white">
      <BreadcrumbSchema
        items={[
          { name: "首页", url: absoluteUrl("/") },
          { name: "陶笛指法表", url },
        ]}
      />
      <FAQPageSchema faqs={faqs} />

      <div className="print:hidden">
        <AppNav currentPath={OCARINA_FINGERING_PATH} />
      </div>

      <header className="border-b border-zinc-200 bg-[#eef3dd] dark:border-white/10 dark:bg-[#111908]">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            陶笛指法查询 · 2 种孔数 × 3 个调号
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-normal md:text-5xl">
            陶笛指法表：六孔与十二孔，C / F / G 调一页查完
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg dark:text-zinc-200">
            下表列出编辑器实际使用的指法图，按音高从低到高排列，每个音级都标注唱名。练琴时查音、打印出来贴在谱架上、或者对照课堂讲义，都比翻图片更方便。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <span>共 {totalFingering} 张指法图</span>
            <span>含低音与高音区</span>
            <span>可直接打印</span>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
            <PrintFingeringButton />
            <Button asChild className="h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
              <Link href="/editor">
                边查边制谱
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <nav aria-label="指法表跳转" className="mt-8 flex flex-wrap gap-2 print:hidden">
            {charts.map((chart) => (
              <a
                key={chart.anchor}
                href={`#${chart.anchor}`}
                className="rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-emerald-900 transition-colors hover:border-emerald-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-emerald-100"
              >
                {chart.instrumentLabel} · 1={chart.keySignature}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0f1711] print:hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-10 md:grid-cols-3">
          {[
            {
              title: "先确认孔数",
              body: "六孔和十二孔的孔位排列不同，同一个音级的按孔方式也不一样，拿错表会越练越乱。",
            },
            {
              title: "再确认调号",
              body: "谱面左上角的 1=C、1=F、1=G 决定用哪一张表，调号换了指法就要整组换。",
            },
            {
              title: "实心按住，空心放开",
              body: "图里的实心圆代表按住（闭合）的孔，空心圆代表放开，换指时按这个顺序检查。",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-zinc-200 bg-[#fbfaf6] p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                <Music2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <section>
          <h2 className="text-2xl font-bold md:text-3xl">十二孔陶笛指法表</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            十二孔陶笛可用的音级更多：C 调兼顾低音与高音，F 调、G 调更偏向低音区。换调时请整组查看，不要只记单个音。
          </p>
          <div className="mt-8 space-y-10">
            {twelveHoleCharts.map((chart) => (
              <ChartSection key={chart.anchor} chart={chart} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold md:text-3xl">六孔陶笛指法表</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            六孔陶笛音域较窄：C 调的高音最完整，F 调只有一个高音，G 调没有高音区。选曲时先看曲子的最高音，再决定用哪张表。
          </p>
          <div className="mt-8 space-y-10">
            {sixHoleCharts.map((chart) => (
              <ChartSection key={chart.anchor} chart={chart} />
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-amber-200/70 bg-[#fff9ec] p-5 md:p-6 dark:border-amber-300/20 dark:bg-amber-400/10 print:hidden">
          <h2 className="text-base font-bold text-zinc-950 dark:text-white">
            表里没有的音，是陶笛音域不够
          </h2>
          <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-200">
            每个「孔数 + 调号」组合都有固定的可用音域，超出范围的音级没有对应指法。遇到这种情况，可以在编辑器里换调、换陶笛类型，或者把旋律改写到音域内。
          </p>
        </section>

        <section className="mt-14 print:hidden">
          <h2 className="text-2xl font-bold md:text-3xl">常见问题</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-zinc-200 bg-white p-4 open:shadow-sm dark:border-white/10 dark:bg-white/[0.045]"
              >
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-zinc-950 marker:hidden dark:text-white">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 rounded-xl border border-emerald-900/10 bg-[#eef3dd] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6 dark:border-white/10 dark:bg-[#111908] print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
              下一步
            </p>
            <h2 className="mt-2 text-xl font-bold">用查到的指法，做一首自己的陶笛谱</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              在编辑器里输入简谱，指法图会跟着孔数和调号自动匹配，导出时连谱带指法一起生成图片。
            </p>
          </div>
          <Button asChild className="h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
            <Link href="/editor">
              打开陶笛谱编辑器
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section className="mt-12 print:hidden">
          <h2 className="text-xl font-bold">继续看</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                href: "/music-classroom/ocarina-fingering",
                title: "六孔与十二孔指法怎么练",
                desc: "孔位、音域、换指顺序的完整讲解。",
              },
              {
                href: "/music-classroom/score-editor-guide",
                title: "在线制作陶笛谱教程",
                desc: "从新建谱面到导出图片的完整流程。",
              },
              {
                href: "/scores",
                title: "乐谱广场",
                desc: "看看别人公开的陶笛谱怎么写。",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg border border-zinc-200 bg-white p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-emerald-700 dark:border-white/10 dark:bg-white/[0.045]"
              >
                <h3 className="text-sm font-semibold text-zinc-950 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-zinc-200 px-5 py-10 text-xs dark:border-white/10 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5">
          <SiteOwnerContact align="center" />
          <div className="flex items-center justify-center gap-8 text-center">
            <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
            <LazyThemeSwitcher />
          </div>
        </div>
      </footer>
    </main>
  );
}
