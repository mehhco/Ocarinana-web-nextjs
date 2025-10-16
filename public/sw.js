// Service Worker for Ocarinana
// 版本: 1.0.0
// 功能: 静态资源缓存、离线访问支持

const CACHE_NAME = 'ocarinana-v1.0.0';
const STATIC_CACHE = 'ocarinana-static-v1.0.0';
const DYNAMIC_CACHE = 'ocarinana-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/webfile/index.html',
  '/webfile/script.js',
  '/webfile/styles.css',
  // 关键图片资源
  '/webfile/static/Cfinger.png',
  '/webfile/static/C-graph/1.webp',
  '/webfile/static/F-graph/1.webp',
  '/webfile/static/G-graph/1.webp',
  // 其他关键指法图（前几张）
  '/webfile/static/C-graph/2.webp',
  '/webfile/static/C-graph/3.webp',
  '/webfile/static/F-graph/2.webp',
  '/webfile/static/F-graph/3.webp',
  '/webfile/static/G-graph/2.webp',
  '/webfile/static/G-graph/3.webp',
];

// 需要缓存的 API 路径模式
const API_CACHE_PATTERNS = [
  /^\/api\/health$/,
  /^\/api\/scores$/,
  /^\/api\/scores\/[^\/]+$/,
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Static assets cached');
        // 立即激活新的 Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to cache static assets', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated and ready');
        // 立即控制所有客户端
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 处理不同类型的请求
  if (isStaticAsset(request)) {
    // 静态资源：缓存优先策略
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    // API 请求：网络优先，缓存备用
    event.respondWith(networkFirst(request));
  } else if (isPageRequest(request)) {
    // 页面请求：网络优先，缓存备用
    event.respondWith(networkFirst(request));
  }
});

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/webfile/static/') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  );
}

// 判断是否为 API 请求
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// 判断是否为页面请求
function isPageRequest(request) {
  const url = new URL(request.url);
  return (
    request.method === 'GET' &&
    !url.pathname.startsWith('/api/') &&
    !isStaticAsset(request)
  );
}

// 缓存优先策略（适用于静态资源）
async function cacheFirst(request) {
  try {
    // 先尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Service Worker: Serving from cache', request.url);
      return cachedResponse;
    }
    
    // 缓存中没有，从网络获取
    console.log('🌐 Service Worker: Fetching from network', request.url);
    const networkResponse = await fetch(request);
    
    // 如果是成功的响应，缓存它
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Cache first failed', error);
    // 如果都失败了，返回离线页面（如果有的话）
    return new Response('Offline', { status: 503 });
  }
}

// 网络优先策略（适用于 API 和页面）
async function networkFirst(request) {
  try {
    // 先尝试从网络获取
    console.log('🌐 Service Worker: Fetching from network', request.url);
    const networkResponse = await fetch(request);
    
    // 如果是成功的响应，缓存它
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Service Worker: Network failed, trying cache', request.url);
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('✅ Service Worker: Serving from cache', request.url);
      return cachedResponse;
    }
    
    // 如果都没有，返回错误
    console.error('❌ Service Worker: Both network and cache failed', error);
    return new Response('Offline', { status: 503 });
  }
}

// 监听消息（用于手动缓存控制）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.payload;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(urls))
    );
  }
});

console.log('🎵 Service Worker: Ocarinana SW loaded successfully');
