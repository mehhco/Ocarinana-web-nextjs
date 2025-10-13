# Week 4-5 商业化冲刺计划 💰

**目标：** 从公测就绪（72/100）提升至正式商业化（85/100）  
**时间：** 2025-10-13 ~ 2025-10-26（2周）  
**关键词：** 支付系统、会员管理、测试覆盖、性能优化

---

## 🎯 总体目标

### 评分目标
```
当前: 72/100 (已具备公测条件)
  ↓
目标: 85/100 (正式商业化标准) ⬆️ +13分
```

### 核心突破
1. **商业模式** 3/10 → **8/10** (+5分) 💰
2. **性能优化** 6/10 → **8/10** (+2分) ⚡
3. **测试/文档** 6/10 → **8/10** (+2分) 🧪
4. **用户体验** 9/10 → **9/10** (维持) ✨

---

## 📋 任务清单

### 🔴 Week 4 核心任务（商业化基础）

#### 任务1: 支付系统集成 ⏰ 预计：12小时
**重要性：** ⭐⭐⭐⭐⭐ 商业化核心

**选项A: Stripe（推荐 - 国际市场）**
- [x] 注册 Stripe 账号
- [ ] 安装 `@stripe/stripe-js` 和 `stripe`
- [ ] 创建产品和价格
- [ ] 实现订阅流程
  - [ ] `/api/stripe/create-checkout-session`
  - [ ] `/api/stripe/webhook`
  - [ ] `/api/stripe/portal`
- [ ] 创建定价页面 `/pricing`
- [ ] 集成会员状态检查
- [ ] 测试支付流程

**选项B: 微信支付 + 支付宝（中国市场）**
- [ ] 申请商户号（需要营业执照）
- [ ] 集成支付SDK
- [ ] 实现支付回调
- [ ] 订单管理系统

**推荐方案：** 先做 Stripe（1-2天可完成），后续再加微信/支付宝

**数据库设计：**
```sql
-- subscriptions 表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL, -- 'free' | 'pro' | 'team'
  status TEXT NOT NULL,  -- 'active' | 'canceled' | 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

**定价方案建议：**
```typescript
免费版：
- 最多保存 3 个乐谱
- 基础导出功能（带水印）
- 社区支持

专业版（¥29/月 或 $4.99/月）：
- 无限乐谱保存
- 高清导出（无水印）
- PDF 导出（未来）
- 优先客服
- 去除广告

团队版（¥199/月 或 $29/月）：
- 专业版所有功能
- 5 个席位
- 团队协作（未来）
- 共享曲库（未来）
- API 访问
```

**文件清单：**
- `lib/stripe.ts` - Stripe 配置
- `app/api/stripe/create-checkout-session/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/pricing/page.tsx` - 定价页面
- `components/pricing-card.tsx`
- `components/upgrade-button.tsx`
- `hooks/useSubscription.ts`
- `supabase/migrations/0002_create_subscriptions.sql`

---

#### 任务2: 会员功能限制 ⏰ 预计：6小时
**重要性：** ⭐⭐⭐⭐⭐ 商业模式执行

**实现内容：**
- [ ] 创建 `lib/subscription-limits.ts` - 限制配置
- [ ] 免费用户最多 3 个乐谱
- [ ] 付费用户无限制
- [ ] 导出水印（免费版）
- [ ] 升级提示 UI
- [ ] 会员状态中间件

**限制检查逻辑：**
```typescript
// lib/subscription-limits.ts
export const LIMITS = {
  free: {
    maxScores: 3,
    exportWatermark: true,
    pdfExport: false,
  },
  pro: {
    maxScores: Infinity,
    exportWatermark: false,
    pdfExport: true,
  },
  team: {
    maxScores: Infinity,
    exportWatermark: false,
    pdfExport: true,
    seats: 5,
    apiAccess: true,
  },
};
```

**文件清单：**
- `lib/subscription-limits.ts`
- `lib/subscription-checker.ts`
- `components/upgrade-prompt.tsx`
- `app/api/scores/route.ts` (更新: 添加限制检查)

---

#### 任务3: 图片优化（WebP + 懒加载）⏰ 预计：6小时
**重要性：** ⭐⭐⭐⭐ 性能关键

**子任务A: 转换静态资源为 WebP**
- [ ] 安装图片转换工具 `sharp`
- [ ] 批量转换指法图（C/F/G 调，约 50+ 张）
- [ ] 保留原图作为 fallback
- [ ] 更新图片引用路径

**转换脚本：**
```javascript
// scripts/convert-to-webp.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirs = [
  'public/webfile/static/C-graph',
  'public/webfile/static/F-graph',
  'public/webfile/static/G-graph',
];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.filter(f => f.endsWith('.png')).forEach(file => {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace('.png', '.webp'));
    
    sharp(input)
      .webp({ quality: 85 })
      .toFile(output)
      .then(() => console.log(`✅ ${file} → ${file.replace('.png', '.webp')}`));
  });
});
```

**子任务B: 懒加载实现**
- [ ] 创建 `<LazyImage>` 组件
- [ ] 使用 Intersection Observer
- [ ] 添加占位符（blur-up 效果）
- [ ] 应用到编辑器页面

**LazyImage 组件：**
```tsx
// components/lazy-image.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export function LazyImage({ src, alt, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsLoaded(true);
        observer.disconnect();
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isLoaded ? (
        <Image src={src} alt={alt} {...props} />
      ) : (
        <div className="animate-pulse bg-gray-200 rounded" style={{ width: props.width, height: props.height }} />
      )}
    </div>
  );
}
```

**验收标准：**
- ✅ 所有指法图有 WebP 版本
- ✅ 图片大小减少 30%+
- ✅ 懒加载正常工作
- ✅ Lighthouse Performance > 85

**文件清单：**
- `scripts/convert-to-webp.js`
- `components/lazy-image.tsx`
- `public/webfile/static/**/*.webp` (新增)

---

### 🟠 Week 5 核心任务（质量保证）

#### 任务4: 测试覆盖 ⏰ 预计：10小时
**重要性：** ⭐⭐⭐⭐ 质量保证

**子任务A: 单元测试（6小时）**
- [ ] 安装 Jest + React Testing Library
- [ ] 配置 `jest.config.js`
- [ ] 测试工具函数
  - [ ] `lib/utils.ts`
  - [ ] `lib/validations/*.ts`
  - [ ] `lib/subscription-limits.ts`
- [ ] 测试 React 组件
  - [ ] `components/ui/button.tsx`
  - [ ] `components/pricing-card.tsx`
  - [ ] `components/cookie-consent.tsx`

**安装依赖：**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**示例测试：**
```typescript
// __tests__/lib/subscription-limits.test.ts
import { canCreateScore, canExportWithoutWatermark } from '@/lib/subscription-limits';

describe('Subscription Limits', () => {
  test('Free user cannot create more than 3 scores', () => {
    expect(canCreateScore('free', 3)).toBe(false);
    expect(canCreateScore('free', 2)).toBe(true);
  });

  test('Pro user has unlimited scores', () => {
    expect(canCreateScore('pro', 1000)).toBe(true);
  });

  test('Free user exports have watermark', () => {
    expect(canExportWithoutWatermark('free')).toBe(false);
    expect(canExportWithoutWatermark('pro')).toBe(true);
  });
});
```

**子任务B: API 集成测试（4小时）**
- [ ] 测试认证 API
- [ ] 测试乐谱 CRUD API
- [ ] 测试支付 Webhook
- [ ] 测试限流功能

**示例测试：**
```typescript
// __tests__/api/scores.test.ts
describe('POST /api/scores', () => {
  it('should create score for authenticated user', async () => {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Score', document: {} }),
    });
    expect(res.status).toBe(201);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await fetch('/api/scores', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('should enforce rate limiting', async () => {
    // 发送 30 个请求
    const promises = Array(30).fill(0).map(() =>
      fetch('/api/scores', { method: 'POST' })
    );
    const responses = await Promise.all(promises);
    const tooManyRequests = responses.filter(r => r.status === 429);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

**文件清单：**
- `jest.config.js`
- `jest.setup.js`
- `__tests__/lib/*.test.ts`
- `__tests__/components/*.test.tsx`
- `__tests__/api/*.test.ts`

**目标覆盖率：**
- 工具函数：80%+
- 组件：60%+
- API：70%+

---

#### 任务5: 性能优化 - 第二阶段 ⏰ 预计：6小时
**重要性：** ⭐⭐⭐ 用户体验

**子任务A: 数据库优化（2小时）**
- [ ] 添加必要的索引
- [ ] 优化查询语句
- [ ] 启用连接池

```sql
-- supabase/migrations/0003_add_indexes.sql

-- 乐谱表索引
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_updated_at ON scores(updated_at DESC);

-- 订阅表索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 全文搜索索引（可选）
CREATE INDEX idx_scores_title_gin ON scores USING GIN (to_tsvector('simple', title));
```

**子任务B: 前端优化（4小时）**
- [ ] 代码分割（动态导入）
- [ ] 路由预加载
- [ ] 缓存策略优化
- [ ] 减少客户端 JavaScript

```tsx
// 动态导入示例
import dynamic from 'next/dynamic';

const PricingPage = dynamic(() => import('@/components/pricing-page'), {
  loading: () => <PricingPageSkeleton />,
  ssr: false,
});

const SettingsPage = dynamic(() => import('@/app/protected/settings/page'), {
  loading: () => <div>Loading settings...</div>,
});
```

**验收标准：**
- ✅ Lighthouse Performance > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.5s
- ✅ 数据库查询优化 50%+

---

#### 任务6: 用户文档和教程 ⏰ 预计：6小时
**重要性：** ⭐⭐⭐ 用户留存

**子任务A: 使用教程（4小时）**
- [ ] 创建 `/help` 页面
- [ ] 快速开始指南
- [ ] 功能详解
  - 如何创建乐谱
  - 如何使用指法图
  - 如何导出图片
  - 如何升级会员
- [ ] 常见问题 FAQ
- [ ] 视频教程（可选）

**子任务B: API 文档（2小时）**
- [ ] OpenAPI / Swagger 规范
- [ ] API 端点列表
- [ ] 认证说明
- [ ] 示例代码

**文件清单：**
- `app/help/page.tsx`
- `app/help/quick-start/page.tsx`
- `app/help/faq/page.tsx`
- `app/api-docs/page.tsx`
- `docs/API.md`

---

### 🟢 可选增强任务（时间允许）

#### 任务7: 邮件营销集成 ⏰ 预计：4小时
**工具：** Resend（推荐）或 SendGrid

**功能：**
- [ ] 欢迎邮件（注册后）
- [ ] 订阅确认邮件
- [ ] 订阅到期提醒
- [ ] 营销活动邮件

**安装：**
```bash
npm install resend
```

**示例代码：**
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'Ocarinana <hello@ocarinana.com>',
    to: email,
    subject: '欢迎来到 Ocarinana！',
    html: `
      <h1>你好，${name}！</h1>
      <p>感谢注册 Ocarinana 陶笛谱生成器。</p>
      <p><a href="https://ocarinana.com/help">查看快速开始指南</a></p>
    `,
  });
}
```

---

#### 任务8: 社交分享功能 ⏰ 预计：3小时

**功能：**
- [ ] 分享乐谱到社交媒体
- [ ] 生成分享卡片（Open Graph 图片）
- [ ] 复制链接功能

```tsx
// components/share-button.tsx
export function ShareButton({ scoreId, title }) {
  const shareUrl = `https://ocarinana.com/share/${scoreId}`;
  
  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: '看看我用 Ocarinana 创作的陶笛谱',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('链接已复制');
    }
  };

  return <Button onClick={share}>分享</Button>;
}
```

---

## 📊 进度追踪表

| 任务 | 优先级 | 预计 | 实际 | 状态 | 完成日期 |
|------|--------|------|------|------|----------|
| **Week 4** |  |  |  |  |  |
| 1. Stripe 支付集成 | P0 | 12h | - | ⏳ | - |
| 2. 会员功能限制 | P0 | 6h | - | ⏳ | - |
| 3. 图片优化 | P1 | 6h | - | ⏳ | - |
| **Week 5** |  |  |  |  |  |
| 4. 测试覆盖 | P1 | 10h | - | ⏳ | - |
| 5. 性能优化二阶段 | P1 | 6h | - | ⏳ | - |
| 6. 用户文档 | P1 | 6h | - | ⏳ | - |
| **可选** |  |  |  |  |  |
| 7. 邮件营销 | P2 | 4h | - | ⏳ | - |
| 8. 社交分享 | P2 | 3h | - | ⏳ | - |
| **总计** | - | **53h** | - | - | - |

---

## 🎯 成功指标

### Week 4 结束时
- ✅ 支付系统可用（Stripe测试模式）
- ✅ 会员限制生效
- ✅ Lighthouse Performance > 85
- ✅ 图片加载速度提升 40%+

### Week 5 结束时
- ✅ 测试覆盖率 > 60%
- ✅ Lighthouse Performance > 90
- ✅ 用户文档完整
- ✅ 综合评分 > 85/100

---

## 💰 成本估算

### 开发成本
- Week 4: 24小时 x ¥500 = **¥12,000**
- Week 5: 22小时 x ¥500 = **¥11,000**
- **两周总计：** ¥23,000

### 新增月运营成本
- Stripe 费用：2.9% + ¥2 每笔交易
- Resend 免费版：3,000 邮件/月（可选）
- **实际成本：** 根据交易量

### 总投入（至今）
- 开发成本：¥20,000 (前3周) + ¥23,000 (本阶段) = **¥43,000**
- 月运营：¥580 (基础设施)

---

## 📈 预期 ROI

### 收入预测（保守）

**假设：**
- 公测后 1 个月：100 注册用户
- 转化率：5%（5 个付费用户）
- 客单价：¥29/月

**第一个月收入：**
- MRR (月经常性收入)：5 x ¥29 = **¥145**

**3 个月后（指数增长）：**
- 注册用户：500
- 付费用户：25 (5% 转化率)
- MRR：25 x ¥29 = **¥725**

**6 个月后：**
- 注册用户：2,000
- 付费用户：100
- MRR：100 x ¥29 = **¥2,900**

**回本周期：** 约 15-18 个月

---

## 🚀 发布时间线

### Week 4（10月13日 - 10月19日）
- **Day 1-2：** Stripe 集成
- **Day 3-4：** 会员限制
- **Day 5-7：** 图片优化 + 测试

### Week 5（10月20日 - 10月26日）
- **Day 1-3：** 测试覆盖
- **Day 4-5：** 性能优化
- **Day 6-7：** 文档 + 最后测试

### 公测准备（10月27日 - 11月3日）
- 内测（10-20个用户）
- 收集反馈
- Bug 修复
- 正式发布准备

### 🎊 正式公测（11月4日）
- 发布公告
- 社交媒体推广
- 用户增长追踪

---

## ✅ 检查清单

### 开发前
- [ ] 注册 Stripe 账号（或决定使用其他支付方式）
- [ ] 确定定价策略
- [ ] 准备测试信用卡
- [ ] 安装必要的依赖

### 开发中
- [ ] 每日 commit 代码
- [ ] 更新进度文档
- [ ] 本地测试功能
- [ ] 代码审查

### 上线前
- [ ] 所有测试通过
- [ ] Lighthouse 审计 > 90
- [ ] 法律文档更新（退款政策）
- [ ] 客服联系方式
- [ ] 监控工具就绪

---

## 📚 参考资源

### 支付集成
- [Stripe 文档](https://stripe.com/docs)
- [Stripe + Next.js 示例](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)
- [Subscription 最佳实践](https://stripe.com/docs/billing/subscriptions/overview)

### 测试
- [Jest 文档](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js 测试](https://nextjs.org/docs/testing)

### 性能优化
- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing/performance)
- [Sharp 图片优化](https://sharp.pixelplumbing.com/)

---

## 💬 需要帮助？

### 技术支持
- Next.js Discord
- Stripe Support
- Supabase Discord

### 商业咨询
- Indie Hackers
- Product Hunt
- Y Combinator Startup School

---

## 🎉 结语

完成这两周的开发后，Ocarinana 将：
- ✅ 拥有完整的商业模式
- ✅ 达到商业化标准（85/100）
- ✅ 准备好接受真实用户
- ✅ 可以开始盈利

**这是从 MVP 到商业产品的关键一跃！** 🚀

**投入：** 约 53 小时 + ¥23,000  
**回报：** 一个可以盈利的 SaaS 产品

**加油！商业成功就在眼前！** 💪💰

---

**创建时间：** 2025-10-12  
**审查周期：** 每3天更新进度  
**责任人：** 开发团队

