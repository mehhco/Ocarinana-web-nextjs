import { NextRequest, NextResponse } from 'next/server';
import { autoPushUrl } from '@/lib/seo/auto-push';

/**
 * 推送单个URL到百度
 * POST /api/seo/auto-push-single
 * 
 * 请求体格式：
 * {
 *   "url": "https://example.com/page"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: '请求格式错误，请提供 url 字段',
        },
        { status: 400 }
      );
    }

    const result = await autoPushUrl(url);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('单个URL推送API错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器错误',
      },
      { status: 500 }
    );
  }
}

