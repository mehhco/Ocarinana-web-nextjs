import type { Metadata } from 'next';

/**
 * SEO工具函数库
 * 提供统一的SEO相关功能，便于维护和扩展
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article'; // OpenGraph只支持website和article
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

/**
 * 生成标准的Metadata对象
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const siteName = 'Ocarinana';
  
  const metadata: Metadata = {
    title: config.title.includes('Ocarinana') 
      ? config.title 
      : `${config.title} | ${siteName}`,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      type: config.type || 'website',
      locale: 'zh_CN',
      url: config.url || baseUrl,
      title: config.title,
      description: config.description,
      siteName,
      images: config.image
        ? [
            {
              url: config.image.startsWith('http') 
                ? config.image 
                : `${baseUrl}${config.image}`,
              width: 1200,
              height: 630,
              alt: config.title,
            },
          ]
        : [
            {
              url: `${baseUrl}/opengraph-image.webp`,
              width: 1200,
              height: 630,
              alt: config.title,
            },
          ],
      ...(config.type === 'article' && {
        publishedTime: config.publishedTime,
        modifiedTime: config.modifiedTime,
        authors: config.author ? [config.author] : undefined,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: config.image
        ? [config.image.startsWith('http') ? config.image : `${baseUrl}${config.image}`]
        : [`${baseUrl}/twitter-image.webp`],
    },
    robots: {
      index: !config.noindex,
      follow: !config.noindex,
      googleBot: {
        index: !config.noindex,
        follow: !config.noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: config.url || baseUrl,
    },
  };

  return metadata;
}

/**
 * 规范化URL
 * 确保URL格式正确，移除尾部斜杠等
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // 移除尾部斜杠（除了根路径）
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    return urlObj.toString();
  } catch {
    // 如果不是完整URL，返回原值
    return url;
  }
}

/**
 * 生成关键词数组
 * 从字符串或数组中提取关键词
 */
export function generateKeywords(
  input: string | string[],
  additional?: string[]
): string[] {
  const keywords: string[] = [];
  
  if (typeof input === 'string') {
    // 从字符串中提取关键词（用逗号或空格分隔）
    keywords.push(...input.split(/[,\s]+/).filter(Boolean));
  } else if (Array.isArray(input)) {
    keywords.push(...input);
  }
  
  if (additional && Array.isArray(additional)) {
    keywords.push(...additional);
  }
  
  // 去重并过滤空值
  return Array.from(new Set(keywords.filter(Boolean)));
}

/**
 * 生成面包屑导航数据
 */
export function generateBreadcrumbs(
  items: Array<{ name: string; url: string }>
): Array<{ name: string; url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return [
    { name: '首页', url: baseUrl },
    ...items.map((item) => ({
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  ];
}

/**
 * 提取页面标题（用于SEO）
 * 从完整标题中提取主要部分
 */
export function extractPageTitle(fullTitle: string): string {
  // 移除常见的后缀，如 " | Ocarinana"
  return fullTitle.replace(/\s*\|\s*Ocarinana\s*$/i, '').trim();
}

/**
 * 生成中文友好的URL slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u4e00-\u9fa5]+/g, '-') // 将中文和空格替换为连字符
    .replace(/[^\w\-]+/g, '') // 移除特殊字符
    .replace(/\-+/g, '-') // 合并多个连字符
    .replace(/^\-+|\-+$/g, ''); // 移除首尾连字符
}

/**
 * 验证URL格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取页面的SEO评分建议
 */
export function getSEOSuggestions(config: SEOConfig): string[] {
  const suggestions: string[] = [];
  
  if (!config.title || config.title.length < 10) {
    suggestions.push('标题应该至少包含10个字符');
  }
  
  if (config.title && config.title.length > 60) {
    suggestions.push('标题建议控制在60个字符以内');
  }
  
  if (!config.description || config.description.length < 50) {
    suggestions.push('描述应该至少包含50个字符');
  }
  
  if (config.description && config.description.length > 160) {
    suggestions.push('描述建议控制在160个字符以内');
  }
  
  if (!config.keywords || config.keywords.length === 0) {
    suggestions.push('建议添加关键词以提升SEO效果');
  }
  
  if (!config.image) {
    suggestions.push('建议添加Open Graph图片以提升社交媒体分享效果');
  }
  
  return suggestions;
}

