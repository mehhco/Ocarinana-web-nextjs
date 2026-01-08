import { NextRequest, NextResponse } from 'next/server';
import { autoPushSitemap, autoPushUrl } from '@/lib/seo/auto-push';

/**
 * 自动化推送API路由
 * POST /api/seo/auto-push
 * 
 * 请求体格式（可选）：
 * {
 *   "urls": ["https://example.com/page1", "https://example.com/page2"]  // 指定要推送的URL
 * }
 * 
 * 如果不提供urls，则自动推送sitemap中的所有URL
 */
export async function POST(request: NextRequest) {
  try {
    let body: { urls?: string[] } = {};
    
    try {
      body = await request.json();
    } catch {
      // 如果没有请求体，使用默认值（推送sitemap中的所有URL）
    }

    // 如果提供了urls，推送指定的URL；否则推送sitemap中的所有URL
    const result = await autoPushSitemap({
      urls: body.urls,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('自动化推送API错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器错误',
        pushed: 0,
        failed: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * GET请求：推送sitemap中的所有URL
 */
export async function GET() {
  try {
    const result = await autoPushSitemap();
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('自动化推送API错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器错误',
        pushed: 0,
        failed: 0,
      },
      { status: 500 }
    );
  }
}

