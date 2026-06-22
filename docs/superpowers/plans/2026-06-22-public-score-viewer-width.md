# Public Score Viewer Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让乐谱广场详情页的谱面铺满现有查看器卡片宽度。

**Architecture:** 保持详情页和共享 `ScoreCanvas` 不变，仅移除 `PublicScoreViewer` 内部承载画布容器的 760px 固定宽度。这样宽度由现有卡片自然约束，不影响编辑器、缩放或导出数据流。

**Tech Stack:** Next.js App Router、React、TypeScript、Tailwind CSS

---

### Task 1: 扩大公开乐谱查看器谱面宽度

**Files:**
- Modify: `components/public-score-viewer.tsx:195`

- [ ] **Step 1: 验证现有实现仍受固定宽度限制**

运行：

```powershell
if (Select-String -Path 'components/public-score-viewer.tsx' -SimpleMatch 'w-[760px]') { exit 1 }
```

预期：命令退出码为 1，证明目标固定宽度仍存在。

- [ ] **Step 2: 实施最小宽度修改**

将：

```tsx
<div className="mx-auto h-full w-[760px] max-w-none">
```

改为：

```tsx
<div className="h-full w-full">
```

- [ ] **Step 3: 验证固定宽度已移除且流式宽度存在**

运行：

```powershell
$content = Get-Content -Raw 'components/public-score-viewer.tsx'
if ($content.Contains('w-[760px]') -or -not $content.Contains('className="h-full w-full"')) { exit 1 }
```

预期：命令退出码为 0。

- [ ] **Step 4: 运行项目静态检查**

运行：

```powershell
npm run lint
```

预期：命令退出码为 0；不出现 ESLint 错误。

- [ ] **Step 5: 运行生产构建检查**

运行：

```powershell
npm run build
```

预期：命令退出码为 0；Next.js 构建成功。

按照项目约束，不启动开发服务器，不执行 Git 操作。
