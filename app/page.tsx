import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { CtaStartButton } from "@/components/cta-start-button";
import { AppNav } from "@/components/app-nav";
import { SiteOwnerContact } from "./site-owner-contact";
import {
  WebSiteSchema,
  SoftwareApplicationSchema,
  OrganizationSchema,
  FAQPageSchema,
} from "@/components/seo/structured-data";
import { ImagePreloader, CRITICAL_IMAGES } from "@/components/image-preloader";

export const metadata: Metadata = {
  title: "Ocarinana - 陶笛谱生成器 | 在线数字简谱编辑工具",
  description:
    "Ocarinana 是专业的在线陶笛谱生成器，支持六孔和十二孔陶笛数字简谱编辑、指法图自动匹配、歌词编辑与高清图片导出。",
  keywords: [
    "陶笛谱生成器",
    "数字简谱编辑器",
    "在线乐谱制作",
    "陶笛指法图",
    "六孔陶笛谱",
    "十二孔陶笛谱",
    "简谱编辑工具",
    "音乐制作",
    "ocarina",
    "sheet music",
  ],
  openGraph: {
    title: "Ocarinana - 陶笛谱生成器",
    description:
      "在线制作六孔或十二孔陶笛数字简谱，自动生成指法图，并导出适合打印与分享的高清图片。",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

const faqs = [
  {
    question: "需要登录才能使用吗？",
    answer: "浏览与试用不需要登录；登录后可以保存并管理你的云端乐谱。",
  },
  {
    question: "支持哪些导出格式？",
    answer: "当前支持高清 PNG 图片导出，适合打印、教学资料和社交分享。",
  },
  {
    question: "数据会保存在哪里？",
    answer: "游客可在本地试用导出；登录后可以将乐谱保存到云端并持续编辑。",
  },
  {
    question: "现在是否收费？",
    answer: "当前核心编辑和导出能力免费开放，后续高级能力会再单独说明。",
  },
];

const features = [
  {
    title: "所见即所得",
    desc: "在同一个工作区输入音符、歌词和装饰符，实时检查谱面排版。",
  },
  {
    title: "指法图联动",
    desc: "根据陶笛类型、调号和音高自动匹配指法图，减少手动查表。",
  },
  {
    title: "高清导出",
    desc: "一键生成适合打印、课堂演示和分享传播的 PNG 成品图。",
  },
];

const workflow = [
  "选择调号与节拍模板",
  "录入数字简谱和歌词",
  "检查指法图与行距",
  "导出高清图片",
];

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <>
      <WebSiteSchema
        url={baseUrl}
        name="Ocarinana - 陶笛谱生成器"
        description="在线陶笛谱生成器，支持六孔和十二孔数字简谱编辑、陶笛指法图自动匹配、歌词编辑与高清图片导出。"
      />
      <SoftwareApplicationSchema
        name="Ocarinana"
        description="在线陶笛谱生成器，支持六孔和十二孔数字简谱编辑、陶笛指法图自动匹配。"
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
        description="面向陶笛学习、教学和内容创作的在线音乐工具。"
        sameAs={[]}
      />
      <FAQPageSchema faqs={faqs} />

      <main className="min-h-screen bg-white text-zinc-950 dark:bg-slate-950 dark:text-white">
        <ImagePreloader images={CRITICAL_IMAGES} priority={true} />
        <AppNav currentPath="/" variant="banner" />

        <section className="relative isolate w-full overflow-hidden border-b border-emerald-950/10 bg-[#e9f5ec] dark:border-white/10 dark:bg-[#061511]">
          <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]">
            <Image
              src="/webfile/static/note.webp"
              alt=""
              fill
              className="object-cover object-center"
              priority
              aria-hidden="true"
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_18%_70%,rgba(20,184,166,0.18),transparent_28%),linear-gradient(135deg,rgba(233,245,236,0.98)_0%,rgba(226,243,232,0.94)_46%,rgba(212,236,226,0.88)_100%)] dark:bg-[radial-gradient(circle_at_84%_18%,rgba(45,212,191,0.2),transparent_32%),radial-gradient(circle_at_18%_72%,rgba(16,185,129,0.13),transparent_28%),linear-gradient(135deg,rgba(6,21,17,0.98)_0%,rgba(7,35,28,0.96)_50%,rgba(9,48,39,0.9)_100%)]" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(176deg,transparent_0%,transparent_48%,rgba(255,255,255,0.98)_50%,rgba(255,255,255,1)_100%)] dark:bg-[linear-gradient(176deg,transparent_0%,transparent_48%,rgba(2,6,23,0.98)_50%,rgba(2,6,23,1)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute right-[-12rem] top-24 h-80 w-80 rounded-full border border-emerald-700/15 dark:border-emerald-200/10"
          />
          <div
            aria-hidden="true"
            className="absolute left-[-8rem] bottom-16 h-56 w-56 rounded-full border border-teal-700/10 dark:border-teal-100/10"
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pb-24 pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(380px,1fr)] md:items-center md:pb-28 md:pt-20">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                在线陶笛谱生成器
              </p>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-normal md:text-6xl">
                在线制作六孔和十二孔陶笛谱
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg dark:text-emerald-50/78">
                Ocarinana 面向陶笛学习者、音乐教师和内容创作者。输入简谱音符，实时预览
                六孔或十二孔 C/F/G 调指法图，完成后导出适合打印与分享的高清图片。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CtaStartButton />
                <Link
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-900/15 bg-white/58 px-6 text-sm font-medium text-emerald-950 transition-colors hover:border-emerald-700 hover:bg-white/82 hover:text-emerald-800 dark:border-white/15 dark:bg-white/8 dark:text-emerald-50 dark:hover:border-emerald-200/50 dark:hover:bg-white/14"
                >
                  查看功能
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-emerald-50/68">
                <span>无需安装</span>
                <span>支持六孔/十二孔</span>
                <span>PNG 高清导出</span>
                <span>云端乐谱管理</span>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-[2rem] bg-emerald-700/10 blur-2xl dark:bg-emerald-300/10"
              />
              <div className="relative overflow-hidden rounded-lg border border-white/72 bg-white/68 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <div className="grid border-b border-emerald-950/10 bg-white/56 px-4 py-3 text-xs font-medium text-zinc-600 md:grid-cols-[1fr_auto] md:items-center dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/64">
                  <span>示例输出：故乡的原风景片段 · 1=G 4/4</span>
                  <span className="mt-1 text-emerald-800 md:mt-0 dark:text-emerald-200">
                    成品谱面预览
                  </span>
                </div>
                <div className="bg-[#fffdf7]/88 p-3 md:p-5 dark:bg-zinc-950/55">
                  <Image
                    src="/webfile/static/note.webp"
                    alt="故乡的原风景片段陶笛谱示例输出"
                    width={2266}
                    height={742}
                    className="h-auto w-full rounded-md object-contain ring-1 ring-zinc-200 dark:bg-white dark:ring-white/10"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-slate-950">
          <div className="mx-auto w-full max-w-6xl px-5 py-14">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">
                为陶笛谱制作设计的核心流程
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-slate-300">
                从输入音符到生成指法图，再到导出图片，围绕练习、教学和分享场景组织能力。
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-6 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-slate-300">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-b border-zinc-200 bg-[#fbfaf6] dark:border-white/10 dark:bg-slate-900">
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-16 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-6 md:col-span-2 dark:border-white/10 dark:bg-slate-950">
              <div>
                <h3 className="mb-2 font-semibold">快速上手</h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-slate-300">
                  打开即可使用，内置常用节拍与调号模板，适合从短谱例开始验证排版。
                </p>
              </div>
              <Image
                src="/webfile/static/note.webp"
                alt="陶笛指法图和简谱编辑预览"
                width={1200}
                height={400}
                className="mt-6 h-40 w-full rounded-md bg-[#fffdf7] object-contain p-3 ring-1 ring-zinc-200 dark:bg-white dark:ring-white/10"
                loading="lazy"
              />
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
              <h3 className="mb-4 font-semibold">制作步骤</h3>
              <ol className="space-y-3 text-sm text-zinc-600 dark:text-slate-300">
                {workflow.map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="w-full border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-slate-950">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              准备好开始创作你的第一首乐谱了吗？
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-slate-300">
              直接进入编辑器制作陶笛谱，也可以先查看常见问题。
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <CtaStartButton />
              <Link
                href="#faq"
                className="text-sm text-emerald-800 underline underline-offset-4 dark:text-emerald-200"
              >
                FAQ
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full bg-white dark:bg-slate-950">
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-16 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-md border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="mb-2 font-semibold">{faq.question}</div>
                <div className="text-sm leading-6 text-zinc-600 dark:text-slate-300">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="w-full border-t border-zinc-200 bg-white dark:border-white/10 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <div className="flex flex-col gap-6">
              <SiteOwnerContact />
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  © {new Date().getFullYear()} Ocarinana · 陶笛谱生成器
                </p>
                <div className="flex items-center gap-6 text-xs">
                  <Link
                    href="/legal/privacy"
                    className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    隐私政策
                  </Link>
                  <Link
                    href="/legal/terms"
                    className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    用户协议
                  </Link>
                  <LazyThemeSwitcher />
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
