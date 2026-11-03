import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Music2, Printer, Sparkles } from "lucide-react";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { LanguageSwitch } from "@/components/language-switch";
import { BreadcrumbSchema, FAQPageSchema } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo/site";

const faqs = [
  {
    question: 'What is Ocarinana?',
    answer:
      'Ocarinana is a browser-based editor for numbered musical notation (jianpu) used with ocarinas. You type numbers, and the editor lays out measures, lyrics and fingering diagrams, then exports a print-ready PNG.',
  },
  {
    question: 'Does it support both 6-hole and 12-hole ocarinas?',
    answer:
      'Yes. Choose 6-hole or 12-hole, then pick C, F or G as the key. Fingering diagrams and the playable range follow those settings automatically.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No. It runs in the browser. You can start without an account, and sign in later if you want to save scores to the cloud.',
  },
  {
    question: 'Is the editor interface in English?',
    answer:
      'The editing interface is currently in Chinese. The notation itself, fingering charts and exported images are language independent. An English interface is on the roadmap.',
  },
];

const features = [
  {
    title: 'Numbered notation editor',
    body: 'Enter 1–7 with octave dots, set the key and time signature, and see the layout update while you type.',
    icon: Music2,
  },
  {
    title: 'Automatic fingering',
    body: 'Every note can show the matching fingering diagram for your ocarina type and key — no separate chart to keep open.',
    icon: Sparkles,
  },
  {
    title: 'Print-ready export',
    body: 'Export a high-resolution PNG with notation and fingering, ready for printing, classroom handouts or sharing.',
    icon: Printer,
  },
];

const steps = [
  'Pick ocarina type and key signature',
  'Type the melody numbers and lyrics',
  'Check fingering and measure spacing',
  'Export a PNG and print it',
];

export const metadata: Metadata = {
  title: 'Ocarina Sheet Music Editor — Free Online Jianpu Notation',
  description:
    'Ocarinana is a free browser-based editor for ocarina sheet music. Write numbered notation, see automatic fingering charts for 6-hole and 12-hole ocarinas in C, F and G, and export print-ready images.',
  keywords: [
    'ocarina sheet music',
    'ocarina tabs',
    'ocarina notation editor',
    'jianpu editor',
    'ocarina fingering chart',
    '12 hole ocarina sheet music',
    '6 hole ocarina tabs',
  ],
  alternates: {
    canonical: absoluteUrl('/en'),
    languages: {
      en: absoluteUrl('/en'),
      'zh-CN': absoluteUrl('/'),
      'x-default': absoluteUrl('/'),
    },
  },
  openGraph: {
    title: 'Ocarina Sheet Music Editor — Ocarinana',
    description:
      'Write ocarina sheet music in numbered notation, see automatic fingering diagrams, export print-ready images.',
    type: 'website',
    url: absoluteUrl('/en'),
    locale: 'en_US',
  },
};

export default function EnglishHomePage() {
  return (
    <div lang="en">
      <main className="min-h-screen bg-[#f7f8f2] text-zinc-950 dark:bg-[#0b120d] dark:text-white">
        <BreadcrumbSchema
          items={[
            { name: 'Home', url: absoluteUrl('/en') },
          ]}
        />
        <FAQPageSchema faqs={faqs} />

        <header className="border-b border-emerald-900/10 bg-[#eef3dd] dark:border-white/10 dark:bg-[#111908]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/en" className="brand-font text-2xl text-emerald-800 dark:text-emerald-200">
              Ocarinana
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <LanguageSwitch
                href="/"
                hrefLang="zh-CN"
                label="中文"
                title="切换到中文站"
              />
              <Button asChild className="h-9 bg-emerald-700 px-4 text-white hover:bg-emerald-800">
                <Link href="/editor">Open editor</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Ocarina sheet music · 6-hole &amp; 12-hole
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            Write ocarina sheet music in your browser
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg dark:text-zinc-200">
            Ocarinana turns numbered notation into a readable score with matching fingering
            diagrams. Pick 6-hole or 12-hole, choose C, F or G, type the melody, then export a
            print-ready PNG.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
              <Link href="/editor">
                Start a score
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href="/en/ocarina-fingering-chart">
                Browse fingering charts
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            No install. Free to start. The editing interface is currently in Chinese; notation and
            exported images are language independent.
          </p>
        </section>

        <section className="border-y border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0f1711]">
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-zinc-200 bg-[#fbfaf6] p-6 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  <h2 className="mt-3 font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">From a melody to a printed score</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-zinc-200 bg-[#eef3dd] dark:border-white/10 dark:bg-[#111908]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Not sure which holes to cover?</h2>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                The fingering chart lists every playable note for 6-hole and 12-hole ocarinas in C,
                F and G, with print support.
              </p>
            </div>
            <Button asChild className="h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
              <Link href="/en/ocarina-fingering-chart">
                Open fingering charts
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">FAQ</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
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

        <footer className="border-t border-zinc-200 px-5 py-8 text-xs dark:border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
            <p>© {new Date().getFullYear()} Ocarinana · Ocarina sheet music editor</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="underline-offset-4 hover:underline">
                中文站
              </Link>
              <Link href="/scores" className="underline-offset-4 hover:underline">
                Score library
              </Link>
              <LazyThemeSwitcher />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
