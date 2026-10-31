import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  ListTree,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import {
  ArticleSchema,
  BreadcrumbSchema,
} from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import {
  getMusicClassroomTopic,
  getMusicClassroomTopicHref,
  musicClassroomTopics,
} from "@/lib/music-classroom/topics";
import {
  SITE_NAME,
  absoluteUrl,
  defaultOpenGraphImage,
} from "@/lib/seo/site";
import { SiteOwnerContact } from "../../site-owner-contact";

interface ClassroomTopicPageProps {
  params: Promise<{ slug: string }>;
}

const publishedAt = "2026-10-30";

export const dynamicParams = false;

export function generateStaticParams() {
  return musicClassroomTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: ClassroomTopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getMusicClassroomTopic(slug);

  if (!topic) {
    return {
      title: "专题不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const url = absoluteUrl(getMusicClassroomTopicHref(topic));

  return {
    title: topic.seoTitle,
    description: topic.description,
    keywords: topic.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      locale: "zh_CN",
      url,
      title: topic.seoTitle,
      description: topic.description,
      siteName: SITE_NAME,
      publishedTime: publishedAt,
      modifiedTime: publishedAt,
      images: [
        {
          url: absoluteUrl(defaultOpenGraphImage),
          width: 1200,
          height: 630,
          alt: topic.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: topic.seoTitle,
      description: topic.description,
      images: [absoluteUrl(defaultOpenGraphImage)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ClassroomTopicPage({
  params,
}: ClassroomTopicPageProps) {
  const { slug } = await params;
  const topic = getMusicClassroomTopic(slug);

  if (!topic) {
    notFound();
  }

  const topicUrl = absoluteUrl(getMusicClassroomTopicHref(topic));
  const relatedTopics = topic.relatedSlugs
    .map((relatedSlug) => getMusicClassroomTopic(relatedSlug))
    .filter((relatedTopic) => relatedTopic !== undefined);
  const heroFigure = topic.sections.find((section) => section.figure)?.figure;

  return (
    <main className="night-page night-page-classroom min-h-screen bg-[#fbfaf6]">
      <ArticleSchema
        headline={topic.title}
        description={topic.description}
        url={topicUrl}
        image={heroFigure?.src ?? defaultOpenGraphImage}
        datePublished={publishedAt}
        dateModified={publishedAt}
      />
      <BreadcrumbSchema
        items={[
          { name: "首页", url: absoluteUrl("/") },
          { name: "音乐课堂", url: absoluteUrl("/music-classroom") },
          { name: topic.shortTitle, url: topicUrl },
        ]}
      />
      <AppNav
        currentPath={`/music-classroom/${topic.slug}`}
        variant="classroom"
      />

      <header className="relative isolate overflow-hidden border-b border-lime-950/10 bg-[#eef3dd] dark:border-white/10 dark:bg-[#111908]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(132,204,22,0.2),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(16,185,129,0.12),transparent_24%)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
          <nav
            aria-label="面包屑"
            className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300"
          >
            <Link href="/" className="hover:text-lime-800 hover:underline">
              首页
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/music-classroom"
              className="hover:text-lime-800 hover:underline"
            >
              音乐课堂
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-900 dark:text-white">{topic.shortTitle}</span>
          </nav>

          <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-800 dark:text-lime-300">
                Lesson {String(topic.order).padStart(2, "0")}
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight tracking-normal text-zinc-950 md:text-5xl dark:text-white">
                {topic.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700 dark:text-zinc-200">
                {topic.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-900/10 bg-white/65 px-3 py-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {topic.level}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-900/10 bg-white/65 px-3 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  约 {topic.readMinutes} 分钟
                </span>
                <span>更新于 2026-10-30</span>
              </div>
            </div>

            <div className="rounded-lg border border-lime-950/10 bg-white/65 p-4 dark:border-white/10 dark:bg-white/[0.06]">
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                这篇专题适合
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                {topic.searchQueries.map((query) => (
                  <li key={query} className="flex gap-2">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-lime-700" />
                    <span>{query}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-start">
        <aside className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="lg:sticky lg:top-24">
            <nav
              aria-label="本文目录"
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                <ListTree className="h-4 w-4 text-lime-700 dark:text-lime-300" />
                本文目录
              </div>
              <ol className="mt-3 space-y-2 text-sm">
                {topic.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex gap-2 leading-6 text-zinc-600 transition-colors hover:text-lime-800 dark:text-zinc-300 dark:hover:text-lime-200"
                    >
                      <span className="text-xs tabular-nums text-zinc-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-4 rounded-lg border border-zinc-200 bg-[#fffdf6] p-4 dark:border-white/10 dark:bg-white/[0.045]">
              <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                继续学习
              </p>
              <div className="mt-3 space-y-2">
                {relatedTopics.map((relatedTopic) => (
                  <Link
                    key={relatedTopic.slug}
                    href={getMusicClassroomTopicHref(relatedTopic)}
                    className="group flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 transition-colors hover:border-lime-700 hover:text-lime-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
                  >
                    {relatedTopic.shortTitle}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <article className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="space-y-12">
            {topic.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-24 border-b border-zinc-200 pb-12 last:border-b-0 last:pb-0 dark:border-white/10"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-800 text-xs font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2
                      id={`${section.id}-title`}
                      className="text-2xl font-bold leading-tight text-zinc-950 md:text-3xl dark:text-white"
                    >
                      {section.title}
                    </h2>
                    <p className="mt-3 text-base leading-8 text-zinc-700 dark:text-zinc-300">
                      {section.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5 pl-0 sm:pl-11">
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[15px] leading-8 text-zinc-700 dark:text-zinc-300"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.callout && (
                    <aside className="rounded-lg border border-lime-900/10 bg-lime-50 p-5 dark:border-lime-200/10 dark:bg-lime-300/[0.06]">
                      <p className="font-semibold text-lime-950 dark:text-lime-100">
                        {section.callout.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-lime-950/78 dark:text-lime-50/75">
                        {section.callout.body}
                      </p>
                    </aside>
                  )}

                  {section.bullets && (
                    <ul className="grid gap-3 text-sm leading-7 text-zinc-700 sm:grid-cols-2 dark:text-zinc-300">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-2.5 rounded-md border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <Check className="mt-1.5 h-4 w-4 shrink-0 text-lime-700 dark:text-lime-300" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.table && (
                    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10">
                      {section.table.caption && (
                        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200">
                          {section.table.caption}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] border-collapse bg-white text-left text-sm dark:bg-zinc-950">
                          <thead className="bg-zinc-950 text-white">
                            <tr>
                              {section.table.headers.map((header) => (
                                <th
                                  key={header}
                                  scope="col"
                                  className="px-4 py-3 font-semibold"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row) => (
                              <tr
                                key={row.join("|")}
                                className="border-t border-zinc-200 dark:border-white/10"
                              >
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={`${row[0]}-${cellIndex}`}
                                    className={
                                      cellIndex === 0
                                        ? "px-4 py-3 font-medium text-zinc-950 dark:text-white"
                                        : "px-4 py-3 leading-6 text-zinc-600 dark:text-zinc-300"
                                    }
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {section.steps && (
                    <ol className="space-y-3">
                      {section.steps.map((step, stepIndex) => (
                        <li
                          key={step.title}
                          className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[2rem_1fr] dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-100 text-xs font-bold text-lime-900 dark:bg-lime-300/10 dark:text-lime-200">
                            {stepIndex + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-zinc-950 dark:text-white">
                              {step.title}
                            </p>
                            <p className="mt-1 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                              {step.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.figure && (
                    <figure className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10">
                      <Image
                        src={section.figure.src}
                        alt={section.figure.alt}
                        width={section.figure.width}
                        height={section.figure.height}
                        className="h-auto w-full"
                        loading="lazy"
                      />
                      <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-5 text-zinc-600 dark:border-white/10 dark:text-zinc-300">
                        {section.figure.caption}
                      </figcaption>
                    </figure>
                  )}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-zinc-200 pt-10 dark:border-white/10">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
              常见问题
            </h2>
            <div className="mt-5 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
              {topic.faqs.map((faq) => (
                <details key={faq.question} className="group p-5">
                  <summary className="cursor-pointer list-none pr-8 font-semibold text-zinc-950 marker:hidden dark:text-white">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-5 rounded-xl border border-lime-900/10 bg-[#eef3dd] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6 dark:border-white/10 dark:bg-[#111908]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-800 dark:text-lime-300">
                动手练习
              </p>
              <h2 className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">
                把刚学到的内容做成一段 4 小节练习谱
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                短谱例更容易检查调号、节奏、换指和排版，也能马上形成可打印、可分享的成品。
              </p>
            </div>
            <Button asChild className="h-11 bg-lime-800 px-5 text-white hover:bg-lime-900">
              <Link href="/editor">
                打开陶笛谱编辑器
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                继续学习
              </h2>
              <Link
                href="/music-classroom"
                className="text-sm text-lime-800 underline-offset-4 hover:underline dark:text-lime-300"
              >
                返回课堂首页
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {relatedTopics.map((relatedTopic) => (
                <Link
                  key={relatedTopic.slug}
                  href={getMusicClassroomTopicHref(relatedTopic)}
                  className="group rounded-lg border border-zinc-200 bg-white p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-lime-700 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <p className="text-xs font-semibold text-lime-800 dark:text-lime-300">
                    Lesson {String(relatedTopic.order).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-semibold leading-6 text-zinc-950 group-hover:text-lime-800 dark:text-white dark:group-hover:text-lime-200">
                    {relatedTopic.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {relatedTopic.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </div>

      <footer className="mt-12 w-full border-t bg-[#fbfaf6] px-5 py-10 dark:border-white/10 dark:bg-[#0b120d]">
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
