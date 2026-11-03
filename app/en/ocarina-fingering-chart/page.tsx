import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { BreadcrumbSchema, FAQPageSchema } from "@/components/seo/structured-data";
import { PrintFingeringButton } from "@/components/tools/print-fingering-button";
import { Button } from "@/components/ui/button";
import {
  getOcarinaFingeringCharts,
  getTotalFingeringCount,
  type OcarinaFingeringChart,
} from "@/lib/tools/ocarina-fingering";
import { absoluteUrl } from "@/lib/seo/site";

const url = absoluteUrl("/en/ocarina-fingering-chart");

const faqs = [
  {
    question: 'Which fingering chart do I need?',
    answer:
      'Match two things: the number of holes on your ocarina (6 or 12), and the key written on the score (1=C, 1=F or 1=G). A chart only applies to one combination.',
  },
  {
    question: 'What do the dots above and below the numbers mean?',
    answer:
      'A dot above a number means the note is one octave higher than the plain number; a dot below means one octave lower. The chart keeps the same notation as the editor.',
  },
  {
    question: 'Why are some notes missing?',
    answer:
      'Each ocarina size and key has a fixed playable range. Notes outside that range have no fingering on that instrument, so they are not listed.',
  },
  {
    question: 'What do the black and white circles mean?',
    answer:
      'A filled circle is a covered (closed) hole; an empty circle is an open hole. Check the hole pattern before each note change.',
  },
];

export const metadata: Metadata = {
  title: "Ocarina Fingering Chart — 6-hole & 12-hole, C / F / G",
  description:
    "Printable ocarina fingering charts for 6-hole and 12-hole ocarinas in C, F and G. Every playable note is listed from low to high with its fingering diagram.",
  keywords: [
    "ocarina fingering chart",
    "12 hole ocarina fingering chart",
    "6 hole ocarina fingering chart",
    "ocarina fingering",
    "ocarina notes chart",
    "printable ocarina chart",
  ],
  alternates: {
    canonical: url,
    languages: {
      en: url,
      'zh-CN': absoluteUrl('/tools/ocarina-fingering'),
      'x-default': absoluteUrl('/tools/ocarina-fingering'),
    },
  },
  openGraph: {
    title: "Ocarina Fingering Chart — 6-hole & 12-hole",
    description:
      "Printable fingering charts for 6-hole and 12-hole ocarinas in C, F and G.",
    type: "article",
    url,
    locale: "en_US",
  },
};

function getEnglishLabel(note: OcarinaFingeringChart["notes"][number]): string {
  if (note.register === "high") return `high ${note.degree}`;
  if (note.register === "low") return `low ${note.degree}`;
  return note.degree;
}

function ChartBlock({ chart }: { chart: OcarinaFingeringChart }) {
  const instrumentLabel = chart.instrument === "6-hole" ? "6-hole ocarina" : "12-hole ocarina";

  return (
    <section className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-bold">
          {instrumentLabel} · 1={chart.keySignature}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {chart.notes.length} notes · range {getEnglishLabel(chart.lowest!)} to{" "}
          {getEnglishLabel(chart.highest!)}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-5 print:gap-2">
        {chart.notes.map((note) => (
          <figure
            key={note.key}
            data-fingering-card
            className="break-inside-avoid rounded-lg border border-zinc-200 bg-white p-2.5 print:p-1 print:shadow-none"
          >
            <Image
              src={note.image}
              alt={`${instrumentLabel} fingering for ${getEnglishLabel(note)} in key ${chart.keySignature}`}
              width={438}
              height={239}
              unoptimized
              loading="eager"
              decoding="async"
              className="h-auto w-full"
            />
            <figcaption className="mt-1.5 flex items-baseline justify-between gap-2 border-t border-dashed border-zinc-200 pt-1.5">
              <span className="text-base font-semibold tabular-nums text-zinc-900">
                {note.degree}
              </span>
              <span className="truncate text-[11px] text-zinc-500">{note.register}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function EnglishFingeringChartPage() {
  const charts = getOcarinaFingeringCharts();
  const twelveHole = charts.filter((chart) => chart.instrument === "12-hole");
  const sixHole = charts.filter((chart) => chart.instrument === "6-hole");
  const total = getTotalFingeringCount(charts);

  return (
    <div lang="en">
      <main className="min-h-screen bg-[#fbfaf6] text-zinc-950 dark:bg-[#0b120d] dark:text-white">
        <BreadcrumbSchema
          items={[
            { name: "Home", url: absoluteUrl("/en") },
            { name: "Ocarina fingering chart", url },
          ]}
        />
        <FAQPageSchema faqs={faqs} />

        <header className="border-b border-emerald-900/10 bg-[#eef3dd] dark:border-white/10 dark:bg-[#111908] print:hidden">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/en" className="brand-font text-2xl text-emerald-800 dark:text-emerald-200">
              Ocarinana
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/tools/ocarina-fingering"
                hrefLang="zh-CN"
                className="rounded-full border border-emerald-900/25 px-3 py-1 text-xs font-semibold text-emerald-900 transition-colors hover:bg-white dark:border-white/25 dark:text-emerald-100"
              >
                中文
              </Link>
              <Button asChild className="h-9 bg-emerald-700 px-4 text-white hover:bg-emerald-800">
                <Link href="/editor">Open editor</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Ocarina fingering chart
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
              6-hole and 12-hole ocarina fingering charts
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-600 md:text-base dark:text-zinc-300">
              Every playable note for C, F and G, ordered from the lowest note to the highest.
              These are the same diagrams the editor uses, so what you see here matches what you
              export.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {total} diagrams · 2 ocarina types · 3 keys
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
              <PrintFingeringButton label="Print this chart" preparingLabel="Preparing…" />
              <Button asChild className="h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                <Link href="/editor">
                  Open the editor
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </header>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">12-hole ocarina</h2>
            <div className="mt-5 space-y-8">
              {twelveHole.map((chart) => (
                <ChartBlock key={chart.anchor} chart={chart} />
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold">6-hole ocarina</h2>
            <div className="mt-5 space-y-8">
              {sixHole.map((chart) => (
                <ChartBlock key={chart.anchor} chart={chart} />
              ))}
            </div>
          </section>

          <section className="mt-12 print:hidden">
            <h2 className="text-2xl font-bold">FAQ</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]"
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
        </div>

        <footer className="border-t border-zinc-200 px-5 py-8 text-xs dark:border-white/10 print:hidden">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
            <p>© {new Date().getFullYear()} Ocarinana · Ocarina sheet music editor</p>
            <div className="flex items-center gap-6">
              <Link href="/en" className="underline-offset-4 hover:underline">
                Home
              </Link>
              <Link href="/tools/ocarina-fingering" className="underline-offset-4 hover:underline">
                中文指法表
              </Link>
              <LazyThemeSwitcher />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
