# Sentry 错误追踪设置指南

本文档介绍如何为 Ocarinana 设置 Sentry 错误追踪。

---

## 🎯 为什么需要 Sentry？

Sentry 帮助你：
- 📊 实时监控生产环境错误
- 🔍 快速定位问题根源
- 📈 分析错误趋势和影响范围
- 🚨 及时收到错误告警
- 👥 了解多少用户受到影响

---

## 📦 安装步骤

### 1. 创建 Sentry 账号

1. 访问 [Sentry.io](https://sentry.io/)
2. 注册免费账号（每月 5000 个事件免费）
3. 创建新项目，选择 "Next.js"

### 2. 安装 Sentry SDK

```bash
npm install @sentry/nextjs
```

### 3. 运行配置向导

```bash
npx @sentry/wizard@latest -i nextjs
```

这个命令会：
- 创建 `sentry.client.config.ts`
- 创建 `sentry.server.config.ts`
- 创建 `sentry.edge.config.ts`
- 更新 `next.config.ts`
- 添加 `.sentryclirc`

### 4. 配置环境变量

在 `.env.local` 中添加：

```env
# Sentry DSN（从 Sentry 项目设置中获取）
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id

# Auth Token（用于上传 source maps）
SENTRY_AUTH_TOKEN=your-auth-token

# 组织和项目（可选）
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**获取 DSN:**
- Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys (DSN)

**获取 Auth Token:**
- Sentry Dashboard → Settings → Account → API → Auth Tokens → Create New Token
- 权限: `project:read`, `project:releases`, `org:read`

### 5. 在 Vercel 中配置

1. 进入 Vercel 项目设置
2. Environment Variables
3. 添加上述环境变量（Production、Preview、Development）

---

## 🔧 配置选项

### 基础配置

`lib/monitoring/sentry.ts` 已包含基础配置：

```typescript
{
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% 的事务追踪
  debug: false,
}
```

### 采样率说明

```typescript
// 生产环境：10%（节省配额）
tracesSampleRate: 0.1

// 开发环境：100%（完整信息）
tracesSampleRate: 1.0
```

### 忽略常见错误

```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',  // 浏览器调整大小
  'NetworkError',                        // 网络问题
  'AbortError',                          // 用户取消
]
```

---

## 📊 使用示例

### 手动捕获异常

```typescript
import { captureException } from '@/lib/monitoring/sentry';

try {
  // 你的代码
} catch (error) {
  captureException(error as Error, {
    userId: user.id,
    scoreId: score.id,
  });
}
```

### 添加面包屑

```typescript
import { addBreadcrumb } from '@/lib/monitoring/sentry';

addBreadcrumb('User saved score', {
  scoreId: score.id,
  title: score.title,
});
```

### 设置用户上下文

```typescript
import { setUser } from '@/lib/monitoring/sentry';

// 登录后
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// 登出后
setUser(null);
```

---

## 🎯 在组件中使用

### API 路由

```typescript
// app/api/scores/route.ts
import { captureException } from '@/lib/monitoring/sentry';

export async function POST(req: Request) {
  try {
    // ... 你的逻辑
  } catch (error) {
    captureException(error as Error, {
      endpoint: '/api/scores',
      method: 'POST',
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 客户端组件

```typescript
// components/scores-bridge.tsx
import { captureException, addBreadcrumb } from '@/lib/monitoring/sentry';

async function saveScore() {
  addBreadcrumb('Starting score save');
  
  try {
    const res = await fetch('/api/scores', { ... });
    addBreadcrumb('Score saved successfully');
  } catch (error) {
    captureException(error as Error, {
      component: 'ScoresBridge',
      action: 'saveScore',
    });
  }
}
```

---

## 📈 Sentry Dashboard 使用

### 查看错误

1. 登录 Sentry Dashboard
2. 选择你的项目
3. Issues 标签显示所有错误
4. 点击错误查看详情：
   - 错误堆栈
   - 用户信息
   - 浏览器/设备信息
   - 面包屑（用户操作路径）

### 设置告警

1. Alerts → Create Alert
2. 选择条件：
   - "When an issue is first seen" - 新错误立即通知
   - "When an issue changes state" - 错误状态变化
   - "When an issue exceeds X events" - 错误超过阈值
3. 选择通知方式：
   - Email
   - Slack
   - Discord
   - Webhook

### 性能监控

1. Performance 标签
2. 查看：
   - 页面加载时间
   - API 响应时间
   - 慢速事务
   - 最慢的路由

---

## 🔒 隐私和安全

### 过滤敏感信息

Sentry 配置中已包含：

```typescript
beforeSend(event, hint) {
  // 移除敏感 headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }
  return event;
}
```

### 数据保留

- 免费版：30 天
- 付费版：90 天或更长

### GDPR 合规

- 启用 "Data Scrubbing" (默认开启)
- 启用 "IP Address Masking"
- 允许用户请求删除数据

---

## 💰 成本估算

### 免费计划
- 5,000 错误/月
- 10,000 性能事务/月
- 30 天数据保留
- ✅ 适合初创项目

### Developer 计划 ($26/月)
- 50,000 错误/月
- 100,000 性能事务/月
- 90 天数据保留
- ✅ 适合小型团队

### Team 计划 ($80/月)
- 100,000 错误/月
- 500,000 性能事务/月
- 团队协作功能
- ✅ 适合成熟产品

---

## 🧪 测试 Sentry

### 1. 本地测试

创建测试页面 `app/test-sentry/page.tsx`:

```typescript
'use client';

export default function TestSentry() {
  return (
    <div>
      <button onClick={() => { throw new Error('Test Sentry Error'); }}>
        抛出测试错误
      </button>
    </div>
  );
}
```

### 2. 生产环境测试

部署后，访问测试页面并点击按钮。
几秒钟后，错误应该出现在 Sentry Dashboard 中。

---

## 🐛 常见问题

### Q: Source Maps 未上传？

**A:** 检查：
1. `SENTRY_AUTH_TOKEN` 是否配置
2. `.sentryclirc` 文件是否存在
3. 构建输出中是否有 Sentry 上传日志

### Q: 错误未上报？

**A:** 检查：
1. `NEXT_PUBLIC_SENTRY_DSN` 是否正确
2. 浏览器控制台是否有 Sentry 相关错误
3. 是否在生产环境（开发环境可能被过滤）

### Q: 告警太多？

**A:** 优化配置：
1. 增加 `ignoreErrors` 列表
2. 降低采样率 `tracesSampleRate`
3. 设置告警阈值（如：10次/小时才告警）

---

## 📚 相关资源

- [Sentry Next.js 文档](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/organizations/)
- [Sentry 状态页](https://status.sentry.io/)

---

**设置完成后，记得在生产环境测试！** 🚀

