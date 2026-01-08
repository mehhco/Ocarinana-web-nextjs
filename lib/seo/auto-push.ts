/**
 * 自动化推送工具
 * 用于自动推送sitemap中的所有URL到百度
 */

import { getBaiduPushConfig, pushUrlsToBaidu } from './baidu-push';

/**
 * 从sitemap获取所有URL
 */
async function getSitemapUrls(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ocarinana.com';
  
  // 静态页面列表（与sitemap.ts保持一致）
  const staticPages = [
    baseUrl,
    `${baseUrl}/home`,
    `${baseUrl}/shop`,
    `${baseUrl}/auth/login`,
    `${baseUrl}/auth/sign-up`,
    `${baseUrl}/legal/privacy`,
    `${baseUrl}/legal/terms`,
    `${baseUrl}/legal/cookies`,
  ];

  // 如果需要，可以在这里添加动态页面
  // 例如：从数据库获取公开的乐谱页面
  
  return staticPages;
}

/**
 * 自动推送sitemap中的所有URL到百度
 * @param options 推送选项
 * @returns 推送结果
 */
export async function autoPushSitemap(options?: {
  /** 是否只推送新页面（默认false，推送所有） */
  onlyNew?: boolean;
  /** 要推送的URL列表（如果不提供，则从sitemap获取） */
  urls?: string[];
}): Promise<{
  success: boolean;
  message: string;
  pushed: number;
  failed: number;
  details?: any;
}> {
  const config = getBaiduPushConfig();
  
  if (!config) {
    return {
      success: false,
      message: '百度推送配置未设置，请检查环境变量 BAIDU_PUSH_SITE 和 BAIDU_PUSH_TOKEN',
      pushed: 0,
      failed: 0,
    };
  }

  try {
    // 获取要推送的URL列表
    const urls = options?.urls || await getSitemapUrls();
    
    if (urls.length === 0) {
      return {
        success: false,
        message: '没有找到需要推送的URL',
        pushed: 0,
        failed: 0,
      };
    }

    // 批量推送
    const result = await pushUrlsToBaidu(urls, config);
    
    if (result.success) {
      const successCount = result.details?.success || 0;
      const remain = result.details?.remain || 0;
      
      return {
        success: true,
        message: `成功推送 ${successCount} 个URL，剩余配额：${remain}`,
        pushed: successCount,
        failed: urls.length - successCount,
        details: result.details,
      };
    } else {
      return {
        success: false,
        message: result.message,
        pushed: 0,
        failed: urls.length,
        details: result.details,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      pushed: 0,
      failed: 0,
    };
  }
}

/**
 * 推送单个URL到百度（带错误处理）
 */
export async function autoPushUrl(url: string): Promise<{
  success: boolean;
  message: string;
}> {
  const config = getBaiduPushConfig();
  
  if (!config) {
    return {
      success: false,
      message: '百度推送配置未设置',
    };
  }

  try {
    const { pushUrlToBaidu } = await import('./baidu-push');
    return await pushUrlToBaidu(url, config);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '推送失败',
    };
  }
}

