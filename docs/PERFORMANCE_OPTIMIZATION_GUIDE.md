# ⚡ Ocarinana 性能优化快速指南

**目标：** 1周内从 ~75 分提升至 90+ 分  
**预计时间：** 约 20 小时  
**优先级：** 🔴 高 - 直接影响用户体验

---

## 🎯 优化目标

### 当前状态（预估）
- Lighthouse Performance: ~75
- First Contentful Paint (FCP): ~2.5s
- Largest Contentful Paint (LCP): ~3.5s
- Time to Interactive (TTI): ~4.5s

### 目标状态
- ✅ Lighthouse Performance: **90+**
- ✅ First Contentful Paint (FCP): **< 1.5s**
- ✅ Largest Contentful Paint (LCP): **< 2.5s**
- ✅ Time to Interactive (TTI): **< 3.5s**
- ✅ Cumulative Layout Shift (CLS): **< 0.1**

---

## 📋 优化计划（按优先级）

### 🔴 第一优先级：图片优化（Day 1-2）⏰ 6-8小时

**影响：** 最大（图片占据 60-70% 的页面资源）

#### Step 1: 安装 Sharp（2分钟）

```bash
cd with-supabase-app
npm install sharp
```

#### Step 2: 创建批量转换脚本（10分钟）

创建 `scripts/convert-to-webp.js`：

```javascript
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
  console.log('   1. 创建 LazyImage 组件');
  console.log('   2. 更新编辑器页面使用 LazyImage');
  console.log('   3. 运行 Lighthouse 审计');
}

convertAll().catch(console.error);
```

#### Step 3: 运行转换（5分钟）

```bash
node scripts/convert-to-webp.js
```

**预期结果：**
```
📁 处理目录: public/webfile/static/C-graph
找到 15 个 PNG 文件
✅ 1.png
   45.2KB → 12.3KB (省 72.8%)
✅ 2.png
   38.7KB → 10.1KB (省 73.9%)
...
📊 目录总计:
   原始大小: 0.68MB
   WebP 大小: 0.18MB
   节省: 73.5%

🎉 所有图片转换完成！
```

#### Step 4: 创建 LazyImage 组件（30分钟）

创建 `components/lazy-image.tsx`：

```tsx
'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const [isLoading, setIsLoading] = useState(!priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 如果是优先加载，直接返回
    if (priority) {
      return;
    }

    // 检查浏览器是否支持 IntersectionObserver
    if (!window.IntersectionObserver) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          setIsLoading(false);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.01,    // 只要1%可见就开始加载
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  return (
    <div 
      ref={imgRef} 
      className={className}
      style={{ width, height }}
    >
      {imageSrc ? (
        <picture>
          {/* WebP 格式（现代浏览器） */}
          <source 
            srcSet={imageSrc.replace('.png', '.webp')} 
            type="image/webp" 
          />
          {/* PNG 格式（降级支持） */}
          <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onLoad={() => setIsLoading(false)}
            loading={priority ? 'eager' : 'lazy'}
            quality={90}
          />
        </picture>
      ) : (
        // 占位符（骨架屏效果）
        <div 
          className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width, height }}
          aria-label="加载中..."
        />
      )}
    </div>
  );
}
```

#### Step 5: 更新 iframe 中的图片引用（1小时）

编辑 `public/webfile/script.js`，查找所有图片加载的地方，更新为优先使用 WebP：

```javascript
// 在 script.js 中查找类似这样的代码
function loadFingerChart(note, key) {
  const img = new Image();
  const imagePath = `/webfile/static/${key}-graph/${note}.png`;
  
  // 改为：
  // 检查浏览器是否支持 WebP
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
  
  const imagePath = supportsWebP 
    ? `/webfile/static/${key}-graph/${note}.webp`
    : `/webfile/static/${key}-graph/${note}.png`;
  
  img.src = imagePath;
  // ...
}
```

**或者创建一个通用函数：**

```javascript
// 添加到 script.js 顶部
(function() {
  // 检测 WebP 支持
  window.supportsWebP = (function() {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();
  
  // 辅助函数：获取优化后的图片路径
  window.getOptimizedImagePath = function(path) {
    if (window.supportsWebP && path.endsWith('.png')) {
      return path.replace('.png', '.webp');
    }
    return path;
  };
})();

// 然后在所有图片加载处使用
img.src = getOptimizedImagePath('/webfile/static/C-graph/1.png');
```

#### Step 6: 测试（30分钟）

```bash
# 启动开发服务器
npm run dev

# 访问编辑器页面
http://localhost:3000/protected/scores

# 打开浏览器开发者工具
# Network 标签 → 筛选 Images
# 检查是否加载 .webp 文件
```

**验收标准：**
- ✅ 所有指法图都有 .webp 版本
- ✅ 现代浏览器优先加载 WebP
- ✅ 旧浏览器降级到 PNG
- ✅ 图片大小减少 60-80%

---

### 🟠 第二优先级：数据库优化（Day 3）⏰ 4小时

**影响：** 中等（提升 API 响应速度）

#### Step 1: 创建索引迁移（30分钟）

创建 `supabase/migrations/0003_add_performance_indexes.sql`：

```sql
-- ================================================
-- 性能优化：添加数据库索引
-- 创建时间：2025-10-13
-- 预期提升：查询速度提升 50-80%
-- ================================================

-- 1. scores 表索引
-- ================================================

-- 用户的乐谱列表（最常用）
CREATE INDEX IF NOT EXISTS idx_scores_user_created 
  ON scores(user_id, created_at DESC);

-- 用户的乐谱列表（按更新时间）
CREATE INDEX IF NOT EXISTS idx_scores_user_updated 
  ON scores(user_id, updated_at DESC);

-- 标题搜索（全文搜索）
CREATE INDEX IF NOT EXISTS idx_scores_title_trgm 
  ON scores USING gin(title gin_trgm_ops);

-- 如果有软删除字段
CREATE INDEX IF NOT EXISTS idx_scores_active 
  ON scores(user_id, created_at DESC) 
  WHERE deleted_at IS NULL;

-- 2. subscriptions 表索引（如果已创建）
-- ================================================

-- 用户当前订阅状态
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active 
  ON subscriptions(user_id) 
  WHERE status = 'active';

-- Stripe 客户 ID 查询
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer 
  ON subscriptions(stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

-- Stripe 订阅 ID 查询
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription 
  ON subscriptions(stripe_subscription_id) 
  WHERE stripe_subscription_id IS NOT NULL;

-- 3. 启用 pg_trgm 扩展（模糊搜索）
-- ================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. 更新表统计信息
-- ================================================
ANALYZE scores;
ANALYZE subscriptions;

-- 5. 验证索引
-- ================================================
-- 运行以下查询查看索引大小
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
JOIN pg_class ON indexname = relname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 查看表大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Step 2: 在 Supabase 运行迁移（5分钟）

```
1. 打开 Supabase Dashboard
2. SQL Editor → New Query
3. 粘贴上面的 SQL
4. 点击 Run
5. 检查结果（应该显示索引创建成功）
```

#### Step 3: 优化 API 查询（2小时）

**优化前：**
```typescript
// app/api/scores/route.ts
export async function GET() {
  const { data } = await supabase
    .from('scores')
    .select('*')
    .order('created_at', { ascending: false });
  
  return Response.json(data);
}
```

**优化后：**
```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 只查询需要的字段
  const { data, error, count } = await supabase
    .from('scores')
    .select('id, title, created_at, updated_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  // 添加缓存头
  return Response.json(
    { data, total: count },
    {
      headers: {
        'Cache-Control': 'private, s-maxage=10, stale-while-revalidate=30',
      },
    }
  );
}
```

**关键优化点：**
1. ✅ 只查询需要的字段（不要 `SELECT *`）
2. ✅ 添加分页（limit + offset）
3. ✅ 添加缓存头
4. ✅ 使用索引字段作为查询条件

#### Step 4: 测试性能提升（30分钟）

```bash
# 使用浏览器开发者工具 Network 标签
# 记录优化前后的响应时间

# 优化前：GET /api/scores
# Time: ~500-800ms

# 优化后：GET /api/scores
# Time: ~100-200ms（提升 60-75%）
```

---

### 🟡 第三优先级：代码分割（Day 4）⏰ 4小时

**影响：** 中等（减少初始加载大小）

#### Step 1: 分析当前 Bundle 大小（15分钟）

```bash
# 构建生产版本
npm run build

# 查看输出，找到最大的 chunks
# 输出类似：
# ┌ ○ /                           123 kB         45.6 kB
# ├ ○ /protected/scores          456 kB         89.2 kB  <- 太大！
# └ ○ /pricing                    89 kB          23.4 kB
```

#### Step 2: 动态导入大型组件（2小时）

**优化 `/protected/scores` 页面：**

```typescript
// app/protected/scores/page.tsx (优化前)
import { ScoresBridge } from '@/components/scores-bridge';
import { ScoreListClient } from '@/components/score-list-client';

export default function ScoresPage() {
  return (
    <>
      <ScoresBridge />
      <ScoreListClient />
    </>
  );
}
```

**优化后：**
```typescript
// app/protected/scores/page.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// 动态导入（代码分割）
const ScoresBridge = dynamic(
  () => import('@/components/scores-bridge').then(mod => ({ default: mod.ScoresBridge })),
  {
    ssr: false, // 编辑器不需要 SSR
    loading: () => (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    ),
  }
);

const ScoreListClient = dynamic(
  () => import('@/components/score-list-client').then(mod => ({ default: mod.ScoreListClient })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    ),
  }
);

export default function ScoresPage() {
  return (
    <>
      <ScoresBridge />
      <ScoreListClient />
    </>
  );
}
```

#### Step 3: 优化大型依赖（1小时）

**检查是否有不必要的导入：**

```typescript
// ❌ 不好：导入整个库
import _ from 'lodash';

// ✅ 好：只导入需要的函数
import debounce from 'lodash/debounce';

// 或者使用更轻量的替代品
import { debounce } from '@/lib/utils'; // 自己实现
```

#### Step 4: 预加载关键路由（30分钟）

```typescript
// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* 添加 prefetch 属性 */}
      <Link href="/protected/scores" prefetch={true}>
        开始创作
      </Link>
      
      <Link href="/pricing" prefetch={true}>
        查看价格
      </Link>
    </>
  );
}
```

---

### 🟢 第四优先级：Lighthouse 审计和修复（Day 5）⏰ 4小时

#### Step 1: 运行 Lighthouse（15分钟）

```bash
# 方法1：使用 Chrome DevTools
# 1. 打开 Chrome
# 2. F12 打开开发者工具
# 3. 切换到 Lighthouse 标签
# 4. 选择 Performance + Best Practices + Accessibility + SEO
# 5. 点击 "Analyze page load"

# 方法2：使用 CLI
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

#### Step 2: 根据报告逐项修复（3小时）

**常见问题和修复：**

**问题1: 图片没有明确的宽高**
```tsx
// ❌ 不好
<img src="/image.png" />

// ✅ 好
<Image 
  src="/image.png" 
  width={500} 
  height={300} 
  alt="描述"
/>
```

**问题2: 缺少 alt 文本**
```tsx
// 添加有意义的 alt
<Image src="/finger-chart.png" alt="C调1音符的陶笛指法图" />
```

**问题3: 字体加载阻塞渲染**
```typescript
// next.config.ts
const nextConfig = {
  // ...
  optimizeFonts: true,
};
```

**问题4: 未使用的 CSS**
```bash
# 安装 PurgeCSS（如果使用 Tailwind，已自动处理）
# Tailwind 会自动移除未使用的样式
```

#### Step 3: 验证改进（30分钟）

再次运行 Lighthouse，对比结果：

```
优化前：
- Performance: 75
- Accessibility: 88
- Best Practices: 92
- SEO: 95

优化后：
- Performance: 92 ⬆️ +17
- Accessibility: 95 ⬆️ +7
- Best Practices: 96 ⬆️ +4
- SEO: 98 ⬆️ +3
```

---

## 📊 预期成果

### 性能提升（整体）

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| Lighthouse Score | ~75 | **92+** | +23% |
| FCP | ~2.5s | **~1.3s** | -48% |
| LCP | ~3.5s | **~2.0s** | -43% |
| TTI | ~4.5s | **~3.0s** | -33% |
| Bundle Size | ~500KB | **~300KB** | -40% |
| API Response | ~500ms | **~150ms** | -70% |

### 用户体验提升

- ✅ 首屏加载快 **2倍**
- ✅ 图片加载快 **3倍**
- ✅ 交互响应快 **2倍**
- ✅ 整体更流畅

---

## ✅ 检查清单

### Day 1-2: 图片优化
- [ ] 安装 sharp
- [ ] 创建转换脚本
- [ ] 批量转换图片为 WebP
- [ ] 创建 LazyImage 组件
- [ ] 更新 iframe 图片加载
- [ ] 测试 WebP 支持和降级

### Day 3: 数据库优化
- [ ] 创建索引迁移 SQL
- [ ] 在 Supabase 运行迁移
- [ ] 优化 API 查询
- [ ] 添加分页
- [ ] 添加缓存头
- [ ] 测试响应时间

### Day 4: 代码分割
- [ ] 分析 Bundle 大小
- [ ] 动态导入大型组件
- [ ] 优化依赖导入
- [ ] 添加路由预加载
- [ ] 创建 Skeleton 组件

### Day 5: Lighthouse 审计
- [ ] 运行 Lighthouse
- [ ] 修复图片问题
- [ ] 修复无障碍问题
- [ ] 优化字体加载
- [ ] 再次审计验证

---

## 🎯 成功标准

完成所有优化后，应该达到：

- ✅ **Lighthouse Performance > 90**
- ✅ **FCP < 1.5s**
- ✅ **LCP < 2.5s**
- ✅ **TTI < 3.5s**
- ✅ **CLS < 0.1**
- ✅ **Bundle 减少 30%+**
- ✅ **图片减少 60%+**
- ✅ **API 快 50%+**

---

## 💡 额外优化建议（可选）

### 1. 添加 Service Worker（离线支持）
```typescript
// 使用 next-pwa
npm install next-pwa
```

### 2. 使用 Edge Functions
```typescript
// 将 API 迁移到 Vercel Edge Functions
export const config = {
  runtime: 'edge',
};
```

### 3. 启用 Brotli 压缩
```typescript
// Vercel 默认支持，无需配置
```

---

## 📞 需要帮助？

- Lighthouse 文档: https://web.dev/performance/
- Next.js 优化: https://nextjs.org/docs/pages/building-your-application/optimizing
- Sharp 文档: https://sharp.pixelplumbing.com/

---

**创建时间：** 2025-10-13  
**预计完成：** 5天  
**开始吧！** 🚀

