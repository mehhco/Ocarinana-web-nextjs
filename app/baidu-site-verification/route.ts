import { NextResponse } from 'next/server';

/**
 * 百度站长工具验证路由
 * 支持文件验证方式（如：/baidu-site-verification/xxxxx.html）
 * 
 * 使用方法：
 * 1. 在百度站长平台选择"文件验证"
 * 2. 下载验证文件（如：baidu_verify_xxxxx.html）
 * 3. 将文件名中的验证码设置为环境变量 NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
 * 4. 访问 /baidu-site-verification/xxxxx.html 即可验证
 * 
 * 注意：此路由需要配合动态路由使用
 * 实际文件应放在：app/baidu-site-verification/[filename]/route.ts
 * 或者使用重写规则将请求转发到此路由
 */
export async function GET(request: Request) {
  const verificationCode = process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION;
  
  // 如果没有配置验证码，返回404
  if (!verificationCode) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 从URL路径中提取验证文件名
  const url = new URL(request.url);
  const pathname = url.pathname;
  const filename = pathname.split('/').pop() || '';
  
  // 检查文件名是否包含验证码
  // 支持多种格式：baidu_verify_xxxxx.html, xxxxx.html 等
  if (filename.includes(verificationCode) || filename === `baidu_verify_${verificationCode}.html`) {
    // 返回百度验证文件内容
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>百度站长平台验证</title>
</head>
<body>
    <p>这是百度站长平台的验证文件。</p>
    <p>如果您看到此页面，说明验证文件已正确配置。</p>
</body>
</html>`;
    
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}

