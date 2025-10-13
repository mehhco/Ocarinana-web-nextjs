const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 转换单个目录
async function convertDirectory(dir) {
  console.log(`\n📁 处理目录: ${dir}`);
  
  try {
    const files = await fs.readdir(dir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    console.log(`找到 ${pngFiles.length} 个 PNG 文件`);
    
    let totalOriginalSize = 0;
    let totalWebPSize = 0;
    
    for (const file of pngFiles) {
      const input = path.join(dir, file);
      const output = path.join(dir, file.replace('.png', '.webp'));
      
      // 检查是否已存在
      try {
        await fs.access(output);
        console.log(`⏭️  跳过（已存在）: ${file}`);
        continue;
      } catch (e) {
        // 文件不存在，继续转换
      }
      
      // 转换为 WebP
      await sharp(input)
        .webp({ 
          quality: 85,     // 质量：85%（平衡质量和大小）
          effort: 6,       // 压缩力度：6（0-6，越高越慢但越小）
          lossless: false  // 有损压缩（更小）
        })
        .toFile(output);
      
      // 获取文件大小
      const originalStats = await fs.stat(input);
      const webpStats = await fs.stat(output);
      
      totalOriginalSize += originalStats.size;
      totalWebPSize += webpStats.size;
      
      const savedPercent = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);
      const originalKB = (originalStats.size / 1024).toFixed(1);
      const webpKB = (webpStats.size / 1024).toFixed(1);
      
      console.log(`✅ ${file}`);
      console.log(`   ${originalKB}KB → ${webpKB}KB (省 ${savedPercent}%)`);
    }
    
    if (pngFiles.length > 0) {
      const totalSavedPercent = ((totalOriginalSize - totalWebPSize) / totalOriginalSize * 100).toFixed(1);
      const totalOriginalMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
      const totalWebPMB = (totalWebPSize / 1024 / 1024).toFixed(2);
      
      console.log(`\n📊 目录总计:`);
      console.log(`   原始大小: ${totalOriginalMB}MB`);
      console.log(`   WebP 大小: ${totalWebPMB}MB`);
      console.log(`   节省: ${totalSavedPercent}%`);
    }
  } catch (error) {
    console.error(`❌ 处理目录失败 ${dir}:`, error);
  }
}

// 需要转换的目录
const directories = [
  'public/webfile/static/C-graph',
  'public/webfile/static/F-graph',
  'public/webfile/static/G-graph',
];

// 转换所有目录
async function convertAll() {
  console.log('🚀 开始批量转换图片为 WebP 格式...\n');
  
  for (const dir of directories) {
    await convertDirectory(dir);
  }
  
  console.log('\n🎉 所有图片转换完成！');
  console.log('\n💡 下一步：');
  console.log('   1. 更新 script.js 使用 WebP');
  console.log('   2. 测试功能是否正常');
  console.log('   3. 运行 Lighthouse 审计查看效果');
}

convertAll().catch(console.error);

