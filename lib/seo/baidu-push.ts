/**
 * 百度推送API工具
 * 用于主动向百度推送新内容，加快收录速度
 * 
 * 参考文档：https://ziyuan.baidu.com/college/courseinfo?id=267&page=2#h2_article_title16
 */

interface BaiduPushOptions {
  site: string;
  token: string;
}

interface BaiduPushResponse {
  success: number;
  remain: number;
  not_same_site?: string[];
  not_valid?: string[];
}

/**
 * 推送单个URL到百度
 */
export async function pushUrlToBaidu(
  url: string,
  options: BaiduPushOptions
): Promise<{ success: boolean; message: string }> {
  const { site, token } = options;

  if (!site || !token) {
    return {
      success: false,
      message: '百度推送配置不完整，请检查环境变量 BAIDU_PUSH_SITE 和 BAIDU_PUSH_TOKEN',
    };
  }

  try {
    // 确保site URL格式正确（移除尾部斜杠）
    const siteUrl = site.replace(/\/$/, '');
    
    const apiUrl = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(siteUrl)}&token=${token}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: url,
    });

    if (!response.ok) {
      // 尝试获取详细的错误信息
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch {
        // 忽略解析错误
      }
      throw new Error(errorMessage);
    }

    const data: BaiduPushResponse = await response.json();

    if (data.success > 0) {
      return {
        success: true,
        message: `成功推送 ${data.success} 个URL，剩余配额：${data.remain}`,
      };
    } else {
      return {
        success: false,
        message: '推送失败，请检查URL格式和配置',
      };
    }
  } catch (error) {
    console.error('百度推送失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 批量推送URL到百度
 */
export async function pushUrlsToBaidu(
  urls: string[],
  options: BaiduPushOptions
): Promise<{ success: boolean; message: string; details?: BaiduPushResponse }> {
  const { site, token } = options;

  if (!site || !token) {
    return {
      success: false,
      message: '百度推送配置不完整，请检查环境变量 BAIDU_PUSH_SITE 和 BAIDU_PUSH_TOKEN',
    };
  }

  if (urls.length === 0) {
    return {
      success: false,
      message: 'URL列表为空',
    };
  }

  try {
    // 确保site URL格式正确（移除尾部斜杠和前后空格）
    const siteUrl = site.trim().replace(/\/$/, '');
    const cleanToken = token.trim();
    
    const apiUrl = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(siteUrl)}&token=${encodeURIComponent(cleanToken)}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: urls.join('\n'),
    });

    if (!response.ok) {
      // 尝试获取详细的错误信息
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch {
        // 忽略解析错误
      }
      throw new Error(errorMessage);
    }

    const data: BaiduPushResponse = await response.json();

    if (data.success > 0) {
      let message = `成功推送 ${data.success} 个URL，剩余配额：${data.remain}`;
      
      if (data.not_same_site && data.not_same_site.length > 0) {
        message += `，${data.not_same_site.length} 个URL不属于当前站点`;
      }
      
      if (data.not_valid && data.not_valid.length > 0) {
        message += `，${data.not_valid.length} 个URL无效`;
      }

      return {
        success: true,
        message,
        details: data,
      };
    } else {
      return {
        success: false,
        message: '推送失败，请检查URL格式和配置',
        details: data,
      };
    }
  } catch (error) {
    console.error('百度批量推送失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 从sitemap推送所有URL到百度
 */
export async function pushSitemapToBaidu(
  sitemapUrl: string,
  options: BaiduPushOptions
): Promise<{ success: boolean; message: string }> {
  const { site, token } = options;

  if (!site || !token) {
    return {
      success: false,
      message: '百度推送配置不完整',
    };
  }

  try {
    // 首先获取sitemap内容
    const sitemapResponse = await fetch(sitemapUrl);
    if (!sitemapResponse.ok) {
      throw new Error(`无法获取sitemap: ${sitemapResponse.status}`);
    }

    const sitemapText = await sitemapResponse.text();
    
    // 简单解析sitemap XML，提取URL
    const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches || urlMatches.length === 0) {
      return {
        success: false,
        message: 'sitemap中没有找到URL',
      };
    }

    const urls = urlMatches.map((match) => match.replace(/<\/?loc>/g, ''));
    
    // 批量推送
    return await pushUrlsToBaidu(urls, options);
  } catch (error) {
    console.error('推送sitemap失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取默认的百度推送配置（从环境变量）
 */
export function getBaiduPushConfig(): BaiduPushOptions | null {
  const site = process.env.BAIDU_PUSH_SITE?.trim();
  const token = process.env.BAIDU_PUSH_TOKEN?.trim();

  if (!site || !token) {
    return null;
  }

  // 移除尾部斜杠，但保留协议
  const cleanSite = site.replace(/\/$/, '');

  return { site: cleanSite, token };
}

