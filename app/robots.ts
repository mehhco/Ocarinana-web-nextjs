import { MetadataRoute } from 'next';

/**
 * 动态生成 robots.txt
 * Next.js 会自动将此文件转换为 /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ocarinana.com').replace(/\/$/, '');
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // 禁止爬取 API 路由
          '/protected/',     // 禁止爬取需要登录的页面
          '/home',           // 个人中心入口不参与搜索索引
          '/editor',         // 交互编辑器不作为 SEO 落地页
          '/auth/confirm',   // 禁止爬取邮箱确认页
          '/auth/error',     // 禁止爬取错误页
        ],
      },
      // 针对常见搜索引擎的特殊规则
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/protected/', '/home', '/editor'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/protected/', '/home', '/editor'],
      },
      // 百度爬虫特殊规则
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: [
          '/api/',
          '/protected/',
          '/home',
          '/editor',
          '/auth/confirm',
          '/auth/error',
        ],
      },
      // 百度移动爬虫
      {
        userAgent: 'Baiduspider-mobile',
        allow: '/',
        disallow: [
          '/api/',
          '/protected/',
          '/home',
          '/editor',
          '/auth/confirm',
          '/auth/error',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

