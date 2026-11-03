import { musicClassroomTopics } from '@/lib/music-classroom/topics';
import { OCARINA_FINGERING_PATH } from '@/lib/tools/ocarina-fingering';

export type PublicRouteChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PublicRoute {
  /** 站内路径，首页为 / */
  path: string;
  lastModified: Date;
  changeFrequency: PublicRouteChangeFrequency;
  priority: number;
}

const siteLastModified = new Date('2026-05-13');
const classroomLastModified = new Date('2026-10-30');
const toolsLastModified = new Date('2026-11-03');
const landingLastModified = new Date('2026-11-03');
const legalLastModified = new Date('2025-10-12');

export const SITE_LAST_MODIFIED = siteLastModified;

/**
 * 参与搜索收录的静态页面。
 *
 * sitemap 与百度主动推送共用这份清单，避免出现「sitemap 里有、推送里没有」，
 * 或者反过来把 robots 已禁止的路径推给搜索引擎。
 */
export const publicStaticRoutes: PublicRoute[] = [
  {
    path: '/',
    lastModified: siteLastModified,
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    path: '/scores',
    lastModified: siteLastModified,
    changeFrequency: 'daily',
    priority: 0.9,
  },
  ...[
    '/scores/instrument/6-hole',
    '/scores/instrument/12-hole',
    '/scores/key/c',
    '/scores/key/f',
    '/scores/key/g',
  ].map((path) => ({
    path,
    lastModified: landingLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })),
  {
    path: '/music-classroom',
    lastModified: classroomLastModified,
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  ...musicClassroomTopics.map((topic) => ({
    path: `/music-classroom/${topic.slug}`,
    lastModified: classroomLastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.78,
  })),
  {
    path: OCARINA_FINGERING_PATH,
    lastModified: toolsLastModified,
    changeFrequency: 'monthly',
    priority: 0.82,
  },
  {
    path: '/shop',
    lastModified: siteLastModified,
    changeFrequency: 'weekly',
    priority: 0.86,
  },
  {
    path: '/legal/privacy',
    lastModified: legalLastModified,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    path: '/legal/terms',
    lastModified: legalLastModified,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    path: '/legal/cookies',
    lastModified: legalLastModified,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
];

export function getPublicStaticUrls(baseUrl: string): string[] {
  const normalizedBase = baseUrl.replace(/\/$/, '');

  return publicStaticRoutes.map((route) =>
    route.path === '/' ? normalizedBase : `${normalizedBase}${route.path}`
  );
}
