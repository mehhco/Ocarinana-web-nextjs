/**
 * 环境变量检查脚本
 * 运行: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查环境变量配置...\n');

// 检查 .env.local 文件
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

// 必需的环境变量
const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase项目URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase匿名密钥',
  'NEXT_PUBLIC_APP_URL': '应用URL（生产环境域名）',
};

// SEO相关的环境变量（可选但推荐）
const seoVars = {
  'NEXT_PUBLIC_BAIDU_SITE_VERIFICATION': '百度站长工具验证码',
  'BAIDU_PUSH_SITE': '百度推送API站点URL',
  'BAIDU_PUSH_TOKEN': '百度推送API Token',
  'NEXT_PUBLIC_BAIDU_ANALYTICS_ID': '百度统计ID',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID': 'Google Analytics ID',
};

// 检查文件是否存在
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ 未找到 .env.local 文件');
  console.log('📝 请执行以下步骤：');
  console.log('   1. 复制 env.example 为 .env.local:');
  console.log('      cp env.example .env.local');
  console.log('   2. 编辑 .env.local 文件，填入实际配置值\n');
  process.exit(1);
}

console.log('✅ 找到 .env.local 文件\n');

// 读取环境变量
const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  }
});

// 检查必需的环境变量
console.log('📋 必需的环境变量检查：');
console.log('─'.repeat(50));

let allRequiredSet = true;
for (const [key, description] of Object.entries(requiredVars)) {
  const value = envVars[key];
  if (!value || value === '' || value.includes('your-') || value.includes('localhost')) {
    console.log(`❌ ${key}`);
    console.log(`   描述: ${description}`);
    if (key === 'NEXT_PUBLIC_APP_URL') {
      if (value && value.includes('localhost')) {
        console.log(`   当前值: ${value}`);
        console.log(`   ⚠️  生产环境必须设置为实际域名（如: https://yourdomain.com）`);
      } else {
        console.log(`   未设置或为空`);
      }
    } else {
      console.log(`   未设置或使用默认值`);
    }
    console.log('');
    allRequiredSet = false;
  } else {
    console.log(`✅ ${key}`);
    if (key === 'NEXT_PUBLIC_APP_URL') {
      console.log(`   值: ${value}`);
      if (value.startsWith('https://')) {
        console.log(`   ✅ 使用HTTPS（推荐）`);
      } else if (value.startsWith('http://')) {
        console.log(`   ⚠️  建议使用HTTPS`);
      }
    }
    console.log('');
  }
}

// 检查SEO相关的环境变量
console.log('📊 SEO相关环境变量检查（可选但推荐）：');
console.log('─'.repeat(50));

let seoCount = 0;
for (const [key, description] of Object.entries(seoVars)) {
  const value = envVars[key];
  if (value && value !== '' && !value.includes('your-')) {
    console.log(`✅ ${key}`);
    console.log(`   描述: ${description}`);
    if (key.includes('TOKEN') || key.includes('KEY') || key.includes('ID')) {
      // 隐藏敏感信息的部分内容
      const masked = value.length > 10 
        ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
        : '***';
      console.log(`   值: ${masked}`);
    }
    console.log('');
    seoCount++;
  } else {
    console.log(`⚪ ${key} - 未配置`);
    console.log(`   描述: ${description}`);
    console.log('');
  }
}

// 总结
console.log('─'.repeat(50));
console.log('📊 检查总结：\n');

if (allRequiredSet) {
  console.log('✅ 所有必需的环境变量已配置');
} else {
  console.log('❌ 部分必需的环境变量未配置或使用默认值');
  console.log('   请编辑 .env.local 文件并填入实际配置值\n');
}

if (seoCount > 0) {
  console.log(`✅ SEO相关配置: ${seoCount}/${Object.keys(seoVars).length} 已配置`);
} else {
  console.log('⚪ SEO相关配置: 未配置（可选，但推荐配置以提升SEO效果）');
}

console.log('\n💡 提示：');
console.log('   - 本地开发环境可以使用 localhost');
console.log('   - 生产环境必须设置实际域名');
console.log('   - 环境变量更新后需要重启开发服务器或重新部署');

