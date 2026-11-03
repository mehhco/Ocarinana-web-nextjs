import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = publicStaticRoutes.map((route) => ({
    url: route.path === '/' ? siteUrl : `${siteUrl}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const publicScorePages = await getPublicScoreUrls();

  return [...staticPages, ...publicScorePages];
}
