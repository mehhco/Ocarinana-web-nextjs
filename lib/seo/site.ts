export const SITE_NAME = 'Ocarinana';

export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ocarinana.com')
).replace(/\/$/, '');

export const siteDescription =
  'Ocarinana 是在线陶笛谱生成器和数字简谱编辑工具，支持六孔、十二孔陶笛制谱、指法图匹配、歌词排版、高清导出和公开乐谱分享。';

export const defaultKeywords = [
  '陶笛谱',
  '陶笛谱生成器',
  '数字简谱',
  '简谱编辑器',
  '在线乐谱编辑',
  '陶笛指法',
  '六孔陶笛谱',
  '十二孔陶笛谱',
  '陶笛教程',
  'ocarina sheet music',
];

export const defaultOpenGraphImage = '/opengraph-image.webp';
export const defaultTwitterImage = '/twitter-image.webp';

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!path || path === '/') {
    return siteUrl;
  }

  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

