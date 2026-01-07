/**
 * 百度推送API测试脚本
 * 使用方法: node scripts/test-baidu-push.js
 */

const testUrl = 'https://www.ocarinana.com/api/seo/baidu-push';

async function testPush() {
  console.log('🚀 测试百度推送API\n');

  // 测试1: 推送单个URL
  console.log('📤 测试1: 推送首页...');
  try {
    const response1 = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.ocarinana.com',
      }),
    });

    const result1 = await response1.json();
    console.log('响应:', JSON.stringify(result1, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.log('');
  }

  // 测试2: 批量推送
  console.log('📤 测试2: 批量推送多个页面...');
  try {
    const response2 = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [
          'https://www.ocarinana.com',
          'https://www.ocarinana.com/shop',
          'https://www.ocarinana.com/home',
        ],
      }),
    });

    const result2 = await response2.json();
    console.log('响应:', JSON.stringify(result2, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.log('');
  }

  console.log('✅ 测试完成！\n');
  console.log('💡 提示：');
  console.log('   - 如果返回 "配置未设置"，请检查Vercel环境变量');
  console.log('   - 如果返回 "推送失败"，请检查token和URL格式');
  console.log('   - 成功响应应包含 "成功推送" 字样');
}

// 运行测试
testPush();

