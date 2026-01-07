import { NextRequest, NextResponse } from 'next/server';
import { pushUrlToBaidu, pushUrlsToBaidu, getBaiduPushConfig } from '@/lib/seo/baidu-push';

/**
 * 百度推送API路由
 * POST /api/seo/baidu-push
 * 
 * 请求体格式：
 * {
 *   "urls": ["https://example.com/page1", "https://example.com/page2"]
 * }
 * 
 * 或者单个URL：
 * {
 *   "url": "https://example.com/page"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const config = getBaiduPushConfig();
    
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          message: '百度推送配置未设置，请检查环境变量 BAIDU_PUSH_SITE 和 BAIDU_PUSH_TOKEN',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { url, urls } = body;

    // 单个URL推送
    if (url) {
      const result = await pushUrlToBaidu(url, config);
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }

    // 批量URL推送
    if (urls && Array.isArray(urls)) {
      const result = await pushUrlsToBaidu(urls, config);
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: '请求格式错误，请提供 url 或 urls 字段',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('百度推送API错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器错误',
      },
      { status: 500 }
    );
  }
}

