import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
  countLandingScores,
  shouldIndexLanding,
  type LandingScoreCounts,
} from '@/lib/scores/landing-policy';
import { fetchPublicScoreSettingsSamples } from '@/lib/scores/public-list';
import { publicStaticRoutes, SITE_LAST_MODIFIED } from '@/lib/seo/public-routes';
import { siteUrl } from '@/lib/seo/site';

export const revalidate = 3600;

type PublicScoreSitemapRow = {
  score_id: string;
  updated_at: string | null;
  published_at: string | null;
};

async function getPublicScoreUrls(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from('scores')
      .select('score_id, updated_at, published_at')
      .eq('is_public', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(1000);

    if (error || !data) {
      return [];
    }

    return (data as PublicScoreSitemapRow[]).map((score) => ({
      url: `${siteUrl}/scores/${score.score_id}`,
      lastModified: score.updated_at ? new Date(score.updated_at) : SITE_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));
  } catch {
    return [];
  }
}

/**
 * 动态生成 sitemap.xml
 * Next.js 会自动将此文件转换为 /sitemap.xml
 *
 * 静态页清单来自 lib/seo/public-routes.ts，与百度主动推送共用同一份来源。
 */
const LANDING_ROUTE_RESOLVERS: Record<
  string,
  (counts: LandingScoreCounts) => boolean
> = {
  '/scores/instrument/6-hole': (counts) => shouldIndexLanding(counts.instrument['6-hole']),
  '/scores/instrument/12-hole': (counts) => shouldIndexLanding(counts.instrument['12-hole']),
  '/scores/key/c': (counts) => shouldIndexLanding(counts.key.C),
  '/scores/key/f': (counts) => shouldIndexLanding(counts.key.F),
  '/scores/key/g': (counts) => shouldIndexLanding(counts.key.G),
};

/**
 * 薄内容落地页不进 sitemap：页面本身已经是 noindex，
 * 再放进 sitemap 会给搜索引擎相反的信号。
 */
async function getIndexableStaticRoutes(): Promise<typeof publicStaticRoutes> {
  const samples = await fetchPublicScoreSettingsSamples();

  if (!samples) {
    return publicStaticRoutes;
  }

  const counts = countLandingScores(samples);

  return publicStaticRoutes.filter((route) => {
    const resolver = LANDING_ROUTE_RESOLVERS[route.path];
    return resolver ? resolver(counts) : true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, publicScorePages] = await Promise.all([
    getIndexableStaticRoutes(),
    getPublicScoreUrls(),
  ]);

  const staticPages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: route.path === '/' ? siteUrl : `${siteUrl}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticPages, ...publicScorePages];
}
