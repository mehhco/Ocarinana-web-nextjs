# 💻 Ocarinana 开发指南

本文档提供详细的开发流程、代码规范和最佳实践。

---

## 📚 目录

- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 前置要求

```bash
# 检查 Node.js 版本（需要 20.x 或更高）
node --version  # v20.0.0+

# 检查 npm 版本
npm --version   # 10.0.0+
```

### 初始化开发环境

```bash
# 1. 克隆项目
git clone <your-repo>
cd with-supabase-app

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp env.example .env.local
# 编辑 .env.local，填入你的 Supabase 配置

# 4. 运行数据库迁移
# 在 Supabase Dashboard 的 SQL Editor 中执行:
# supabase/migrations/0001_create_scores.sql

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用。

---

## 🏗️ 项目架构

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | Next.js 15 + React 19 | 服务端渲染、路由 |
| 语言 | TypeScript 5 | 类型安全 |
| 样式 | Tailwind CSS 3 | 工具类优先的 CSS |
| UI 组件 | shadcn/ui | 无障碍、可定制组件 |
| 后端 | Supabase | 认证、数据库、存储 |
| 编辑器 | 原生 JS (iframe) | 乐谱编辑核心逻辑 |

### 目录结构详解

```
with-supabase-app/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由（后端）
│   │   └── scores/
│   │       ├── route.ts          # GET /api/scores (列表)
│   │       │                     # POST /api/scores (创建)
│   │       └── [id]/
│   │           └── route.ts      # GET/POST /api/scores/:id (详情/更新)
│   │
│   ├── auth/                     # 认证相关页面
│   │   ├── login/page.tsx        # 登录页
│   │   ├── sign-up/page.tsx      # 注册页
│   │   ├── forgot-password/      # 忘记密码
│   │   ├── update-password/      # 更新密码
│   │   └── confirm/route.ts      # 邮箱确认回调
│   │
│   ├── protected/                # 需要登录的页面
│   │   ├── layout.tsx            # 受保护路由的布局
│   │   ├── page.tsx              # 仪表盘
│   │   └── scores/
│   │       ├── page.tsx          # 乐谱编辑器（iframe嵌入）
│   │       └── new/page.tsx      # 创建新乐谱
│   │
│   ├── [userId]/notes/           # 用户笔记（示例功能）
│   ├── home/page.tsx             # 备用首页
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 首页（落地页）
│   └── globals.css               # 全局样式
│
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── auth-button.tsx           # 认证按钮
│   ├── app-nav.tsx               # 应用导航栏
│   ├── scores-bridge.tsx         # iframe 通信桥接
│   ├── score-list-client.tsx    # 乐谱列表
│   └── ...
│
├── lib/                          # 工具函数和配置
│   ├── supabase/
│   │   ├── client.ts             # 客户端 Supabase 实例
│   │   ├── server.ts             # 服务端 Supabase 实例
│   │   └── middleware.ts         # 中间件配置
│   └── utils.ts                  # 通用工具函数
│
├── public/                       # 静态资源
│   └── webfile/                  # 乐谱编辑器（独立应用）
│       ├── index.html            # 编辑器 HTML
│       ├── script.js             # 编辑器逻辑（2283行）
│       ├── styles.css            # 编辑器样式
│       └── static/               # 陶笛指法图
│           ├── C-graph/          # C 调指法
│           ├── F-graph/          # F 调指法
│           └── G-graph/          # G 调指法
│
├── supabase/                     # Supabase 配置
│   └── migrations/               # 数据库迁移
│       └── 0001_create_scores.sql
│
├── docs/                         # 项目文档
│   ├── DEPLOYMENT.md             # 部署指南
│   ├── DEVELOPMENT.md            # 本文档
│   └── API.md                    # API 文档
│
├── next.config.ts                # Next.js 配置
├── tailwind.config.ts            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
├── components.json               # shadcn/ui 配置
└── package.json                  # 项目依赖
```

### 数据流

```
用户交互
  ↓
React 组件 (app/protected/scores/page.tsx)
  ↓
iframe 加载编辑器 (public/webfile/index.html)
  ↓
用户编辑乐谱 (script.js)
  ↓
postMessage 通信 (script.js → scores-bridge.tsx)
  ↓
API 调用 (scores-bridge.tsx → app/api/scores/route.ts)
  ↓
Supabase 存储 (server.ts → Supabase Database)
```

---

## 🔄 开发工作流

### 1. 创建新功能

```bash
# 1. 创建特性分支
git checkout -b feature/my-new-feature

# 2. 开发功能
# 编辑代码...

# 3. 运行 linter
npm run lint

# 4. 测试功能
npm run dev
# 手动测试功能

# 5. 提交代码
git add .
git commit -m "feat: add my new feature"

# 6. 推送到远程
git push origin feature/my-new-feature

# 7. 创建 Pull Request
# 在 GitHub 上创建 PR
```

### 2. Commit Message 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# 格式
<type>(<scope>): <subject>

# 类型 (type)
feat:      新功能
fix:       Bug 修复
docs:      文档更新
style:     代码格式（不影响功能）
refactor:  重构
test:      测试
chore:     构建/工具链

# 示例
feat(editor): add MIDI playback support
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
refactor(api): simplify score creation logic
```

### 3. 代码审查清单

在提交 PR 前，确保：
- [ ] 代码通过 `npm run lint`
- [ ] 没有 TypeScript 错误
- [ ] 功能在本地测试通过
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] Commit message 符合规范

---

## 📝 代码规范

### TypeScript 规范

```typescript
// ✅ 好的做法
interface User {
  id: string;
  email: string;
  name: string | null;
}

async function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ 避免
function getUser(id) {  // 缺少类型
  // ...
}
```

### React 组件规范

```tsx
// ✅ 推荐：函数组件 + TypeScript
interface Props {
  title: string;
  onSave: (data: Score) => void;
  optional?: boolean;
}

export default function ScoreEditor({ title, onSave, optional = false }: Props) {
  // ...
}

// ❌ 避免：props 没有类型
export default function ScoreEditor({ title, onSave }) {
  // ...
}
```

### 文件命名规范

```
✅ 组件文件：kebab-case
   score-list.tsx
   user-profile.tsx

✅ 工具函数：camelCase
   formatDate.ts
   validateEmail.ts

✅ 类型定义：PascalCase
   ScoreDocument.ts
   UserProfile.ts
```

### 样式规范（Tailwind CSS）

```tsx
// ✅ 使用工具类
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-semibold">Title</h2>
</div>

// ❌ 避免内联样式
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '20px' }}>Title</h2>
</div>

// ✅ 复杂样式使用 cn() 工具
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

---

## 🧪 测试指南

### 手动测试清单

#### 认证功能
- [ ] 注册新用户
- [ ] 邮箱确认
- [ ] 登录
- [ ] 登出
- [ ] 忘记密码
- [ ] 重置密码
- [ ] 未登录时访问受保护页面（应跳转登录）

#### 乐谱编辑器
- [ ] 创建新乐谱
- [ ] 添加音符（1-7）
- [ ] 添加休止符
- [ ] 修改时值
- [ ] 添加高音点/低音点
- [ ] 添加升降号
- [ ] 撤销/恢复
- [ ] 保存乐谱
- [ ] 加载已保存的乐谱
- [ ] 导出图片
- [ ] 切换调号（查看指法图变化）
- [ ] 添加歌词

#### 响应式测试
- [ ] 桌面端（1920x1080）
- [ ] 平板（768x1024）
- [ ] 手机（375x667）

### 单元测试（计划中）

```typescript
// 示例：测试工具函数
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-01');
    expect(formatDate(date)).toBe('2025-01-01');
  });
});
```

---

## 🔧 常用命令

### 开发命令

```bash
# 启动开发服务器（使用 Turbopack）
npm run dev

# 启动开发服务器（传统模式）
npm run dev -- --no-turbopack

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 自动修复 lint 问题
npm run lint --fix
```

### Supabase 命令

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 初始化项目（如果需要）
supabase init

# 启动本地 Supabase
supabase start

# 停止本地 Supabase
supabase stop

# 创建新迁移
supabase migration new migration_name

# 应用迁移
supabase db push
```

### Git 命令

```bash
# 查看状态
git status

# 创建分支
git checkout -b feature/my-feature

# 提交代码
git add .
git commit -m "feat: my feature"

# 拉取最新代码
git pull origin main

# 合并分支
git merge main

# 查看日志
git log --oneline
```

---

## 🐛 调试技巧

### 1. 前端调试

```typescript
// 使用 console.log（开发环境）
console.log('Debug info:', data);

// 使用 debugger
function handleSave() {
  debugger;  // 浏览器会在这里暂停
  // ...
}

// React DevTools
// 安装 Chrome 扩展：React Developer Tools
// 检查组件状态和 props
```

### 2. 后端调试

```typescript
// app/api/scores/route.ts
export async function POST(req: Request) {
  console.log('Request body:', await req.json());
  
  // 检查 Supabase 查询
  const { data, error } = await supabase.from('scores').select();
  console.log('Supabase response:', { data, error });
  
  // ...
}
```

### 3. iframe 通信调试

```javascript
// public/webfile/script.js
window.addEventListener('message', (event) => {
  console.log('Received message:', event.data);
  console.log('From origin:', event.origin);
});

// components/scores-bridge.tsx
window.addEventListener("message", (event: MessageEvent) => {
  console.log('Bridge received:', event.data);
});
```

### 4. Supabase 调试

```typescript
// 启用详细日志
const supabase = createClient(url, key, {
  auth: {
    debug: true,  // 认证调试
  },
});

// 检查 RLS 策略
// 在 Supabase Dashboard 的 Table Editor 中
// 点击表格 → Policies → 查看策略是否生效
```

---

## 📦 添加新依赖

### 安装依赖

```bash
# 生产依赖
npm install package-name

# 开发依赖
npm install -D package-name

# 指定版本
npm install package-name@1.2.3
```

### shadcn/ui 组件

```bash
# 添加新组件
npx shadcn@latest add component-name

# 示例
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add table
```

---

## 🚨 常见问题

### 问题1: 端口已被占用

```bash
# 错误: Port 3000 is already in use

# 解决方案1: 杀死进程
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# 解决方案2: 使用其他端口
npm run dev -- -p 3001
```

### 问题2: Supabase 连接失败

```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 确保 .env.local 存在并配置正确
cat .env.local
```

### 问题3: TypeScript 错误

```bash
# 重新生成类型
npm run build

# 清除 TypeScript 缓存
rm -rf .next
rm -rf node_modules/.cache
```

### 问题4: 样式不生效

```bash
# 清除 Tailwind 缓存
rm -rf .next
npm run dev
```

---

## 📚 学习资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com/)

### 推荐教程
- [Next.js 13+ App Router 教程](https://nextjs.org/learn)
- [Supabase + Next.js 认证教程](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [TypeScript 从零到精通](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🎯 下一步

完成基础开发后，考虑：
1. 添加单元测试（Jest + React Testing Library）
2. 添加 E2E 测试（Playwright/Cypress）
3. 集成 CI/CD（GitHub Actions）
4. 添加 Storybook（组件文档）
5. 性能优化（Lighthouse 审计）

---

**需要帮助？** 查看项目 [Issues](https://github.com/your-username/ocarinana/issues) 或联系团队成员。

