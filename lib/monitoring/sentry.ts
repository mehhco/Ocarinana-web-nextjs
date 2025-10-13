/**
 * Sentry 错误追踪配置
 * 
 * 使用方法：
 * 1. 安装 Sentry: npm install @sentry/nextjs
 * 2. 运行初始化向导: npx @sentry/wizard@latest -i nextjs
 * 3. 配置环境变量:
 *    NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
 *    SENTRY_AUTH_TOKEN=your-auth-token
 * 4. 本文件会被自动生成的 sentry.client.config.ts 和 sentry.server.config.ts 使用
 */

export const sentryConfig = {
  // Sentry DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 环境
  environment: process.env.NODE_ENV,
  
  // 采样率
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 忽略的错误
  ignoreErrors: [
    // 浏览器扩展导致的错误
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // 网络错误
    'NetworkError',
    'Network request failed',
    // 用户取消的请求
    'AbortError',
    'The user aborted a request',
  ],
  
  // 忽略的 URL
  denyUrls: [
    // Chrome 扩展
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
  ],
  
  // 附加上下文
  beforeSend(event: any, _hint: any) {
    // 在生产环境中过滤敏感信息
    if (process.env.NODE_ENV === 'production') {
      // 移除可能包含敏感信息的 headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }
    return event;
  },
};

/**
 * 手动捕获异常
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Sentry not initialized:', error, context);
  }
}

/**
 * 添加面包屑
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      message,
      data,
      level: 'info',
    });
  }
}

/**
 * 设置用户上下文
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser(user);
  }
}

