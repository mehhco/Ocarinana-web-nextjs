import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Music2,
  Route,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { BreadcrumbSchema } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import {
  getMusicClassroomTopicHref,
  musicClassroomTopics,
} from "@/lib/music-classroom/topics";
import { absoluteUrl, siteUrl } from "@/lib/seo/site";
import { SiteOwnerContact } from "../site-owner-contact";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || siteUrl).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "音乐课堂 - 陶笛、简谱与基础乐理学习路径",
  description:
    "Ocarinana 音乐课堂按基础乐理、简谱符号、陶笛指法、演奏技巧和制谱教程组织学习内容，帮助陶笛学习者从读谱、练习到制作自己的乐谱。",
  keywords: [
    "音乐课堂",
    "陶笛教程",
    "基础乐理",
    "简谱知识",
    "简谱符号",
    "陶笛指法",
    "陶笛演奏技巧",
    "陶笛谱制作",
    "Ocarinana 教程",
  ],
  openGraph: {
    title: "音乐课堂 - 陶笛、简谱与基础乐理学习路径",
    description:
      "从基础乐理、简谱符号到陶笛指法、演奏和制谱，按搜索专题组织的一套陶笛学习路径。",
    type: "website",
    url: `${baseUrl}/music-classroom`,
  },
  alternates: {
    canonical: `${baseUrl}/music-classroom`,
  },
};

const quickAnswers = [
  {
    label: "六孔和十二孔有什么区别？",
    href: "/music-classroom/ocarina-fingering#types",
  },
  {
    label: "简谱上的附点怎么读？",
    href: "/music-classroom/jianpu-symbols#duration",
  },
  {
    label: "高音吹不上去怎么办？",
    href: "/music-classroom/ocarina-playing#high-notes",
  },
  {
    label: "怎样在线制作陶笛谱？",
    href: "/music-classroom/score-editor-guide#prepare",
  },
];

export default function MusicClassroomPage() {
  return (
    <main className="night-page night-page-classroom min-h-screen bg-[#fbfaf6] dark:bg-[#0b120d]">
      <BreadcrumbSchema
        items={[
          { name: "首页", url: absoluteUrl("/") },
          { name: "音乐课堂", url: absoluteUrl("/music-classroom") },
        ]}
      />
      <AppNav currentPath="/music-classroom" variant="classroom" />

      <header className="relative isolate overflow-hidden border-b border-lime-950/10 bg-[#eef3dd] dark:border-white/10 dark:bg-[#111908]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(132,204,22,0.24),transparent_30%),radial-gradient(circle_at_12%_82%,rgba(16,185,129,0.14),transparent_26%)]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:py-16">
          <div>
            <p className="text-sm font-semibold text-lime-800 dark:text-lime-300">
              Ocarinana 系统学习路径
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-normal text-zinc-950 md:text-5xl dark:text-white">
              从看懂简谱，到做出自己的陶笛谱
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg dark:text-zinc-200">
              五个专题分别解决乐理、简谱、指法、演奏和制谱问题。可以从第一课顺序学习，也可以带着具体问题直接进入对应专题。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 bg-lime-800 px-5 text-white hover:bg-lime-900">
                <Link href="/music-classroom/basic-music-theory">
                  从基础乐理开始
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-lime-900/15 bg-white/65 px-5 text-lime-950 hover:bg-white"
              >
                <Link href="#learning-path">查看全部专题</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-lime-950/10 bg-[#fffdf6]/85 p-4 shadow-[0_20px_60px_rgba(44,73,25,0.1)]">
            <div className="flex items-center justify-between border-b border-lime-950/10 pb-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                <Route className="h-4 w-4 text-lime-700" />
                建议学习路线
              </span>
              <span className="text-xs text-zinc-500">5 个专题</span>
            </div>
            <ol className="mt-4 space-y-2">
              {musicClassroomTopics.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={getMusicClassroomTopicHref(topic)}
                    className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md border border-transparent px-2 py-2 transition-colors hover:border-lime-900/10 hover:bg-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-100 text-xs font-bold text-lime-900">
                      {topic.order}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-zinc-950 group-hover:text-lime-800">
                        {topic.shortTitle}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {topic.level} · {topic.readMinutes} 分钟
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-lime-700" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0f1711]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-800 dark:text-lime-300">
                快速入口
              </p>
              <h2 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">
                你现在最想解决哪个问题？
              </h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:max-w-2xl">
              {quickAnswers.map((answer) => (
                <Link
                  key={answer.href}
                  href={answer.href}
                  className="group flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-[#fbfaf6] px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:border-lime-700 hover:text-lime-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:text-lime-200"
                >
                  {answer.label}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="learning-path" className="scroll-mt-24">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-lime-800 dark:text-lime-300">
              Learning path
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-950 md:text-3xl dark:text-white">
              五个专题，各自解决一类搜索问题
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              每篇专题都可以独立阅读，并通过目录、常见问题和相关专题继续深入，不再把所有内容挤在同一个页面。
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {musicClassroomTopics.map((topic, index) => (
              <article
                key={topic.slug}
                id={topic.legacyAnchor}
                className={
                  index === 0
                    ? "scroll-mt-24 rounded-xl border border-lime-900/15 bg-[#eef3dd] p-6 md:col-span-2 dark:border-white/10 dark:bg-[#111908]"
                    : "scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.045]"
                }
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-800 font-bold text-white">
                      {String(topic.order).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {topic.level}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {topic.readMinutes} 分钟
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold leading-tight text-zinc-950 dark:text-white">
                        {topic.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                        {topic.excerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {topic.searchQueries.map((query) => (
                          <span
                            key={query}
                            className="rounded-full border border-zinc-200 bg-white/70 px-2.5 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
                          >
                            {query}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant={index === 0 ? "default" : "outline"}
                    className={
                      index === 0
                        ? "h-10 shrink-0 bg-lime-800 hover:bg-lime-900"
                        : "h-10 shrink-0 border-zinc-300 bg-white hover:border-lime-700 hover:text-lime-800 dark:border-white/10 dark:bg-transparent"
                    }
                  >
                    <Link href={getMusicClassroomTopicHref(topic)}>
                      阅读专题
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0f1711]">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-12 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-lime-800 text-white">
                <Music2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-lime-800 dark:text-lime-300">
                  学完就练
                </p>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                  用短谱例检查是否真的理解
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              每学完一个专题，录入四到八小节就够了。它能同时检验调号、节奏、符号、指法图和排版，比只读一遍更容易发现问题。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild variant="outline" className="h-11 border-zinc-300 bg-transparent">
              <Link href="/scores">浏览乐谱广场</Link>
            </Button>
            <Button asChild className="h-11 bg-lime-800 text-white hover:bg-lime-900">
              <Link href="/editor">
                新建练习谱
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#fbfaf6] px-5 py-10 dark:bg-[#0b120d]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <SiteOwnerContact />
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-zinc-500 md:flex-row dark:text-zinc-400">
            <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
            <div className="flex items-center gap-6">
              <Link href="/legal/privacy" className="hover:text-zinc-950">
                隐私政策
              </Link>
              <Link href="/legal/terms" className="hover:text-zinc-950">
                用户协议
              </Link>
              <LazyThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
