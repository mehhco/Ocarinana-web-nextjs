import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ScoreLandingView } from "@/components/scores/score-landing-view";
import {
  getKeyLanding,
  instrumentLandings,
  keyLandings,
} from "@/lib/scores/landing";
import { shouldIndexLanding } from "@/lib/scores/landing-policy";
import { fetchPublicScores } from "@/lib/scores/public-list";
import { absoluteUrl } from "@/lib/seo/site";

interface KeyLandingPageProps {
  params: Promise<{ key: string }>;
}

export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return keyLandings.map((landing) => ({ key: landing.slug }));
}

const getLandingScores = cache((keySignature: "C" | "F" | "G") =>
  fetchPublicScores({ keySignature, limit: 18 })
);

export async function generateMetadata({
  params,
}: KeyLandingPageProps): Promise<Metadata> {
  const { key } = await params;
  const landing = getKeyLanding(key);

  if (!landing) {
    return { title: '页面不存在', robots: { index: false, follow: false } };
  }

  const scores = await getLandingScores(landing.keySignature);
  const indexable = shouldIndexLanding(scores.length);
  const url = absoluteUrl(`/scores/key/${landing.slug}`);

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

export default async function KeyLandingPage({ params }: KeyLandingPageProps) {
  const { key } = await params;
  const landing = getKeyLanding(key);

  if (!landing) {
    notFound();
  }

  const scores = await getLandingScores(landing.keySignature);

  const chips = [
    ...keyLandings.map((item) => ({
      href: `/scores/key/${item.slug}`,
      label: item.label,
      active: item.slug === landing.slug,
    })),
    ...instrumentLandings.map((item) => ({
      href: `/scores/instrument/${item.slug}`,
      label: item.label,
      active: false,
    })),
  ];

  return (
    <ScoreLandingView
      breadcrumbLabel={landing.label}
      canonicalPath={`/scores/key/${landing.slug}`}
      eyebrow="陶笛谱库 · 按调号浏览"
      heading={landing.label}
      intro={landing.intro}
      chips={chips}
      scores={scores}
      faqs={landing.faqs}
      relatedLinks={[
        { href: '/tools/ocarina-fingering', label: '陶笛指法表' },
        { href: '/music-classroom/basic-music-theory', label: '调号与音高基础' },
        { href: '/music-classroom/ocarina-fingering', label: '指法与音域' },
        { href: '/scores', label: '乐谱广场' },
      ]}
    />
  );
}
