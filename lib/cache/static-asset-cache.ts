export interface HeaderRule {
  key: string;
  value: string;
}

/**
 * 开发环境禁止浏览器长期缓存 JS/CSS，避免 Turbopack 热更新后继续加载旧模块。
 * 生产环境使用内容哈希资源，因此可以安全启用长期不可变缓存。
 */
export function getStaticAssetCacheHeaders(
  isProduction: boolean
): HeaderRule[] {
  if (!isProduction) {
    return [
      {
        key: 'Cache-Control',
        value: 'no-store, max-age=0',
      },
    ];
  }

  return [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
    {
      key: 'Vary',
      value: 'Accept',
    },
  ];
}

/**
 * 开发环境的 HTML 响应主动清理旧站点缓存。
 * 这可以移除 Turbopack 复用地址下残留的旧 chunk，以及旧 Service Worker 缓存。
 */
export function applyDevelopmentDocumentCacheReset(
  headers: Headers,
  isProduction: boolean,
  acceptHeader: string | null
) {
  if (isProduction || !acceptHeader?.includes('text/html')) {
    return;
  }

  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Clear-Site-Data', '"cache"');
}
