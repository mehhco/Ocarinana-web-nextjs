import { MetadataRoute } from 'next';
import { isShopEnabled } from '@/lib/supabase/config';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ocarinana.com').replace(/\/$/, '');
const siteLastModified = new Date('2026-04-29');
const legalLastModified = new Date('2025-10-12');

/**
 * 动态生成 sitemap.xml
 * Next.js 会自动将此文件转换为 /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: siteLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: legalLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: legalLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/cookies`,
      lastModified: legalLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let shopEnabled = false;
  try {
    shopEnabled = await isShopEnabled();
  } catch {
    shopEnabled = false;
  }

  if (shopEnabled) {
    staticPages.splice(1, 0, {
      url: `${baseUrl}/shop`,
      lastModified: siteLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  
  return staticPages;
}

