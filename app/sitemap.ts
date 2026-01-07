import { MetadataRoute } from 'next';

/**
 * 动态生成 sitemap.xml
 * Next.js 会自动将此文件转换为 /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ocarinana.com';
  
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date('2025-10-12'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date('2025-10-12'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/cookies`,
      lastModified: new Date('2025-10-12'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 如果需要，可以在这里添加动态页面（如用户的公开乐谱）
  // 示例：
  // const dynamicPages = await fetchPublicScores();
  // if (dynamicPages && dynamicPages.length > 0) {
  //   return [
  //     ...staticPages,
  //     ...dynamicPages.map((score) => ({
  //       url: `${baseUrl}/${score.userId}/notes/${score.id}`,
  //       lastModified: score.updatedAt,
  //       changeFrequency: 'weekly' as const,
  //       priority: 0.6,
  //     })),
  //   ];
  // }
  
  return staticPages;
}

