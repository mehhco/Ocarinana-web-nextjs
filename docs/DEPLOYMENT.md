# 🚀 Ocarinana 部署指南

本文档介绍如何将 Ocarinana 部署到生产环境。

---

## 📋 部署前检查清单

### 必需项
- [ ] 已创建 Supabase 项目
- [ ] 已运行数据库迁移
- [ ] 已配置环境变量
- [ ] 已测试本地构建 (`npm run build`)
- [ ] 已修复所有 linter 错误

### 推荐项
- [ ] 已设置自定义域名
- [ ] 已配置 Sentry 错误追踪
- [ ] 已配置分析工具（GA/百度统计）
- [ ] 已准备隐私政策和用户协议
- [ ] 已配置 CDN 和缓存策略

---

## 🌐 部署到 Vercel（推荐）

Vercel 是 Next.js 的官方部署平台，提供最佳的性能和开发体验。

### 步骤1: 准备仓库

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/your-username/ocarinana.git
git push -u origin main
```

### 步骤2: 连接 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `with-supabase-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 步骤3: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### 可选的环境变量

```bash
# Sentry（错误追踪）
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe（如需支付）
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> 💡 **提示**: 在 Vercel 中，环境变量可以分别配置到 Production、Preview 和 Development 环境。

### 步骤4: 部署

点击 "Deploy" 按钮，Vercel 将自动：
1. 克隆代码
2. 安装依赖
3. 运行构建
4. 部署到全球 CDN

首次部署通常需要 2-3 分钟。

### 步骤5: 配置自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名（如 `ocarinana.com`）
3. 按照指引配置 DNS 记录：
   - **类型**: A 记录或 CNAME
   - **值**: Vercel 提供的目标地址
4. 等待 DNS 传播（通常 5-30 分钟）

---

## 🗄️ Supabase 配置

### 步骤1: 创建项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: ocarinana-production
   - **Database Password**: 使用强密码（保存到密码管理器）
   - **Region**: 选择离用户最近的区域
   - **Pricing Plan**: 
     - Free (开发/测试)
     - Pro ($25/月，生产环境推荐)

### 步骤2: 运行数据库迁移

#### 方法 A: 使用 SQL Editor（推荐）

1. 在 Supabase Dashboard 中打开 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase/migrations/0001_create_scores.sql` 的完整内容
4. 粘贴并点击 "Run"
5. 确认看到成功消息

#### 方法 B: 使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 关联项目
supabase link --project-ref your-project-ref

# 推送迁移
supabase db push
```

### 步骤3: 配置认证

1. 在 Supabase Dashboard 中打开 "Authentication" > "Settings"
2. 配置 "Site URL":
   ```
   https://your-domain.com
   ```
3. 配置 "Redirect URLs":
   ```
   https://your-domain.com/auth/confirm
   https://your-domain.com/auth/callback
   ```
4. 启用邮箱确认（推荐）:
   - 打开 "Email Auth" 设置
   - 勾选 "Confirm email"

### 步骤4: 配置邮件模板（可选）

1. 打开 "Authentication" > "Email Templates"
2. 自定义邮件模板：
   - Confirm signup
   - Magic Link
   - Reset password

示例模板：
```html
<h2>欢迎来到 Ocarinana！</h2>
<p>点击下面的链接确认你的邮箱：</p>
<a href="{{ .ConfirmationURL }}">确认邮箱</a>
```

### 步骤5: 获取 API 密钥

1. 打开 "Settings" > "API"
2. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJI...`
3. 将这些值添加到 Vercel 环境变量中

---

## 🔧 其他部署平台

### Netlify

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化项目
netlify init

# 4. 部署
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NEXT_PRIVATE_TARGET = "server"
```

### Railway

1. 访问 [Railway](https://railway.app/)
2. 连接 GitHub 仓库
3. 配置环境变量
4. 自动部署

### Docker 自托管

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

部署命令：
```bash
docker build -t ocarinana .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  ocarinana
```

---

## 🚨 生产环境安全检查

### 1. 环境变量安全
- [ ] 不要在代码中硬编码密钥
- [ ] 使用 `NEXT_PUBLIC_` 前缀暴露给前端的变量
- [ ] 敏感变量（如 Stripe Secret Key）不使用 `NEXT_PUBLIC_` 前缀
- [ ] 定期轮换密钥

### 2. Supabase 安全
- [ ] 启用行级安全（RLS）- 已在迁移中配置
- [ ] 使用强数据库密码
- [ ] 定期备份数据库
- [ ] 限制 API 密钥权限

### 3. 网络安全
- [ ] 启用 HTTPS（Vercel 自动提供）
- [ ] 配置安全响应头（见下方代码）
- [ ] 启用 CORS 限制
- [ ] 配置 Rate Limiting

**next.config.ts** 安全配置：
```typescript
const nextConfig: NextConfig = {
  // ... 现有配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## 📊 监控和日志

### 集成 Sentry（错误追踪）

1. 访问 [Sentry.io](https://sentry.io/)
2. 创建新项目（选择 Next.js）
3. 获取 DSN

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

4. 配置环境变量：
```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Vercel Analytics

Vercel Analytics 在 Pro 计划中自动启用，无需额外配置。

### Google Analytics

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔄 持续部署（CI/CD）

Vercel 默认配置了 CI/CD：
- **Push 到 main** → 自动部署到生产环境
- **Push 到其他分支** → 自动部署到预览环境
- **Pull Request** → 自动生成预览链接

### 自定义构建命令（可选）

创建 `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

---

## 🧪 部署前测试

### 本地生产构建测试

```bash
# 1. 创建生产构建
npm run build

# 2. 启动生产服务器
npm run start

# 3. 在浏览器中测试
# 打开 http://localhost:3000
# 测试所有关键功能：
#   - 注册/登录
#   - 创建乐谱
#   - 保存/加载
#   - 导出图片
```

### 性能审计

```bash
# 使用 Lighthouse（Chrome DevTools）
# 1. 打开 Chrome DevTools (F12)
# 2. 切换到 "Lighthouse" 标签
# 3. 选择 "Performance", "Accessibility", "Best Practices", "SEO"
# 4. 点击 "Analyze page load"

# 目标分数：
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

---

## 🐛 常见部署问题

### 问题1: 构建失败 - "Module not found"

**解决方案**:
```bash
# 清除缓存并重新安装
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### 问题2: Supabase 连接失败

**检查**:
- [ ] 环境变量是否正确
- [ ] Supabase URL 是否以 `https://` 开头
- [ ] Anon Key 是否完整（很长的 JWT token）
- [ ] 网络是否能访问 Supabase

### 问题3: 认证重定向失败

**解决方案**:
在 Supabase Dashboard 中检查 Redirect URLs 配置是否包含：
```
https://your-domain.com/auth/confirm
https://your-domain.com/auth/callback
```

### 问题4: 图片资源 404

**检查**:
- [ ] `public/` 目录下的文件是否都已提交到 Git
- [ ] `next.config.ts` 中的 `images.remotePatterns` 配置是否正确

---

## 📈 性能优化

### 1. 启用 CDN

Vercel 自动提供全球 CDN，无需额外配置。

### 2. 图片优化

使用 Next.js Image 组件：
```tsx
import Image from 'next/image';

<Image 
  src="/webfile/static/Cfinger.png"
  alt="陶笛指法"
  width={200}
  height={200}
  loading="lazy"
/>
```

### 3. 代码分割

Next.js 自动进行代码分割，但你可以进一步优化：
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // 如果不需要 SSR
});
```

### 4. 缓存策略

```typescript
// app/api/scores/route.ts
export const revalidate = 60; // 60秒缓存
```

---

## 🎯 部署后验证

### 功能测试清单

- [ ] 访问首页正常显示
- [ ] 用户注册功能正常
- [ ] 邮箱确认邮件能收到
- [ ] 登录功能正常
- [ ] 创建乐谱功能正常
- [ ] 保存乐谱到云端成功
- [ ] 加载已保存的乐谱成功
- [ ] 图片导出功能正常
- [ ] 暗黑模式切换正常
- [ ] 响应式布局在移动端正常

### 性能测试

```bash
# 使用 WebPageTest
# 访问 https://www.webpagetest.org/
# 输入你的网站 URL
# 选择多个地理位置测试

# 目标指标：
# - First Contentful Paint (FCP): < 1.8s
# - Largest Contentful Paint (LCP): < 2.5s
# - Time to Interactive (TTI): < 3.8s
# - Total Blocking Time (TBT): < 200ms
# - Cumulative Layout Shift (CLS): < 0.1
```

---

## 📞 获取帮助

- Vercel 文档: https://vercel.com/docs
- Supabase 文档: https://supabase.com/docs
- Next.js 文档: https://nextjs.org/docs
- 项目 Issues: https://github.com/your-username/ocarinana/issues

---

**部署成功后，记得更新 README.md 中的 Demo 链接！** 🎉

