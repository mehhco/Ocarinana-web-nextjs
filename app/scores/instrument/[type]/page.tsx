import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ScoreLandingView } from "@/components/scores/score-landing-view";
import {
  getInstrumentLanding,
  instrumentLandings,
  keyLandings,
  type ScoreInstrumentSlug,
} from "@/lib/scores/landing";
import { shouldIndexLanding } from "@/lib/scores/landing-policy";
import { fetchPublicScores } from "@/lib/scores/public-list";
import { absoluteUrl } from "@/lib/seo/site";

interface InstrumentLandingPageProps {
  params: Promise<{ type: string }>;
}

export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return instrumentLandings.map((landing) => ({ type: landing.slug }));
}

const getLandingScores = cache((instrumentType: '6-hole' | '12-hole') =>
  fetchPublicScores({ instrumentType, limit: 18 })
);

export async function generateMetadata({
  params,
}: InstrumentLandingPageProps): Promise<Metadata> {
  const { type } = await params;
  const landing = getInstrumentLanding(type);

  if (!landing) {
    return { title: '页面不存在', robots: { index: false, follow: false } };
  }

  const scores = await getLandingScores(landing.instrumentType);
  const indexable = shouldIndexLanding(scores.length);
  const url = absoluteUrl(`/scores/instrument/${landing.slug}`);

  return {
    title: landing.title,
    description: landing.description,
    keywords: landing.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: landing.title,
      description: landing.description,
      type: 'website',
      url,
      locale: 'zh_CN',
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function InstrumentLandingPage({
  params,
}: InstrumentLandingPageProps) {
  const { type } = await params;
  const landing = getInstrumentLanding(type);

  if (!landing) {
    notFound();
  }

  const scores = await getLandingScores(landing.instrumentType);

  const chips = [
    ...instrumentLandings.map((item) => ({
      href: `/scores/instrument/${item.slug}`,
      label: item.label,
      active: item.slug === (landing.slug as ScoreInstrumentSlug),
    })),
    ...keyLandings.map((item) => ({
      href: `/scores/key/${item.slug}`,
      label: item.label,
      active: false,
    })),
  ];

  return (
    <ScoreLandingView
      breadcrumbLabel={landing.label}
      canonicalPath={`/scores/instrument/${landing.slug}`}
      eyebrow="陶笛谱库 · 按孔数浏览"
      heading={landing.label}
      intro={landing.intro}
      chips={chips}
      scores={scores}
      faqs={landing.faqs}
      relatedLinks={[
        { href: '/tools/ocarina-fingering', label: '陶笛指法表' },
        { href: '/music-classroom/ocarina-fingering', label: '六孔与十二孔指法怎么练' },
        { href: '/music-classroom/score-editor-guide', label: '在线制谱教程' },
        { href: '/scores', label: '乐谱广场' },
      ]}
    />
  );
}
