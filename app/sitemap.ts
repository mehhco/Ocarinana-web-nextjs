import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { siteUrl } from '@/lib/seo/site';

const siteLastModified = new Date('2026-05-13');
const legalLastModified = new Date('2025-10-12');

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
      lastModified: score.updated_at ? new Date(score.updated_at) : siteLastModified,
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
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: siteLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/scores`,
      lastModified: siteLastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/music-classroom`,
      lastModified: siteLastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: siteLastModified,
      changeFrequency: 'weekly',
      priority: 0.86,
    },
    {
      url: `${siteUrl}/legal/privacy`,
      lastModified: legalLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/terms`,
      lastModified: legalLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/cookies`,
      lastModified: legalLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const publicScorePages = await getPublicScoreUrls();

  return [...staticPages, ...publicScorePages];
}
