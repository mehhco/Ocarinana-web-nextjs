import Link from "next/link";
import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { PublicScoreCard } from "@/components/scores/public-score-card";
import { BreadcrumbSchema, FAQPageSchema } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import type { PublicScoreListItem } from "@/lib/scores/public-list";
import { absoluteUrl } from "@/lib/seo/site";
import { SiteOwnerContact } from "@/app/site-owner-contact";

export interface ScoreLandingFaq {
  question: string;
  answer: string;
}

interface ScoreLandingViewProps {
  breadcrumbLabel: string;
  canonicalPath: string;
  eyebrow: string;
  heading: string;
  intro: string[];
  chips: Array<{ href: string; label: string; active?: boolean }>;
  scores: PublicScoreListItem[];
  faqs: ScoreLandingFaq[];
  relatedLinks: Array<{ href: string; label: string }>;
  children?: ReactNode;
}

export function ScoreLandingView({
  breadcrumbLabel,
  canonicalPath,
  eyebrow,
  heading,
  intro,
  chips,
  scores,
  faqs,
  relatedLinks,
  children,
}: ScoreLandingViewProps) {
  const canonical = absoluteUrl(canonicalPath);

  return (
    <main className="min-h-screen flex flex-col bg-[#fbfaf6] text-zinc-950 dark:bg-[#0b120d] dark:text-white">
      <BreadcrumbSchema
        items={[
          { name: "首页", url: absoluteUrl("/") },
          { name: "乐谱广场", url: absoluteUrl("/scores") },
          { name: breadcrumbLabel, url: canonical },
        ]}
      />
      <FAQPageSchema faqs={faqs} />

      <AppNav currentPath="/scores" />

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-normal md:text-4xl">
            {heading}
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600 md:text-base dark:text-zinc-300">
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <nav aria-label="筛选" className="mt-6 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={
                chip.active
                  ? "rounded-full border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-emerald-900 transition-colors hover:border-emerald-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-emerald-100"
              }
            >
              {chip.label}
            </Link>
          ))}
        </nav>

        {children}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold">公开发布的乐谱</h2>
            <Link
              href="/scores"
              className="text-sm text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-300"
            >
              在乐谱广场查看更多筛选
            </Link>
          </div>

          {scores.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scores.map((score) => (
                <PublicScoreCard key={score.score_id} score={score} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center dark:border-white/15 dark:bg-white/[0.04]">
              <h3 className="text-base font-semibold">这个分类下还没有公开乐谱</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                公开的乐谱会显示在这里。你可以先按调号或陶笛类型看看其他分类，也可以直接做一份并公开分享。
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="h-10 bg-emerald-700 px-4 text-white hover:bg-emerald-800">
                  <Link href="/editor">做一份陶笛谱</Link>
                </Button>
                <Button asChild variant="outline" className="h-10 px-4">
                  <Link href="/scores">浏览全部公开谱</Link>
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "先看调号与孔数",
              body: "同一首简谱在不同孔数、不同调号下的指法完全不同，先确认这两个信息再开始练习。",
            },
            {
              title: "对照指法图找音",
              body: "谱面自带的指法图按当前调号生成，查不到的音说明超出了这支陶笛的音域。",
            },
            {
              title: "需要改编就进编辑器",
              body: "换调、改音域、加歌词都在编辑器里完成，导出图片时指法图会同步更新。",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <h2 className="text-sm font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">常见问题</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]"
              >
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">继续看</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-12 w-full border-t px-5 py-10 text-xs dark:border-white/10">
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
