# Export Section Marker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复导出图片中谱面段落标记字母偏出方框的问题。

**Architecture:** 仅调整 `ScoreCanvas` 的段落标记渲染。导出时使用非交互 `div`，正常页面继续使用 `button`，两者共享同一份内部视觉内容，避免通用导出工具感知具体谱面结构。

**Tech Stack:** React、TypeScript、Tailwind CSS、html2canvas

---

### Task 1: 为导出状态提供稳定的段落标记结构

**Files:**
- Modify: `components/editor/core/ScoreCanvas.tsx:827-851`

- [ ] **Step 1: 运行失败检查**

```powershell
$content = Get-Content -Raw 'components/editor/core/ScoreCanvas.tsx'
if (-not $content.Contains('isExporting ? (') -or -not $content.Contains('<div key={section.id} className={sectionMarkerClassName}>')) { exit 1 }
```

预期：退出码为 1，因为当前导出状态没有独立的非按钮分支。

- [ ] **Step 2: 抽取共享内容并按导出状态切换外层元素**

在 `renderSectionMarker` 中创建共享的 `sectionMarkerContent` 和 `sectionMarkerClassName`。当 `isExporting` 为真时返回 `div`；否则返回保留点击、禁用和无障碍标签的 `button`。

- [ ] **Step 3: 运行通过检查**

```powershell
$content = Get-Content -Raw 'components/editor/core/ScoreCanvas.tsx'
if (-not $content.Contains('isExporting ? (') -or -not $content.Contains('<div key={section.id} className={sectionMarkerClassName}>')) { exit 1 }
if (-not $content.Contains('<button') -or -not $content.Contains('onClick={() => onSelectNote(noteIndex)}')) { exit 1 }
```

预期：退出码为 0，导出分支使用 `div`，普通分支仍保留按钮交互。

- [ ] **Step 4: 运行静态检查**

```powershell
npm run lint
```

预期：退出码为 0。

- [ ] **Step 5: 运行生产构建**

```powershell
npm run build
```

预期：退出码为 0。

按照项目约束，不启动开发服务器，不执行 Git 操作。

### Task 2: 修正导出字母基线

**Files:**
- Modify: `components/editor/core/ScoreCanvas.tsx:837-846`

- [ ] **Step 1: 运行失败检查**

```powershell
$content = Get-Content -Raw 'components/editor/core/ScoreCanvas.tsx'
if (-not $content.Contains("style={isExporting ? { top: '-0.5em' } : undefined}")) { exit 1 }
```

预期：退出码为 1，因为字母当前没有导出专用垂直位移。

- [ ] **Step 2: 为字母增加导出专用内层元素**

将段落标签文字改为：

```tsx
<span className="relative" style={isExporting ? { top: '-0.5em' } : undefined}>
  {section.label}
</span>
```

外层方框及非导出样式保持不变。

- [ ] **Step 3: 运行通过检查**

```powershell
$content = Get-Content -Raw 'components/editor/core/ScoreCanvas.tsx'
if (-not $content.Contains("style={isExporting ? { top: '-0.5em' } : undefined}")) { exit 1 }
if (-not $content.Contains('<span className="relative"')) { exit 1 }
```

预期：退出码为 0。

- [ ] **Step 4: 运行静态检查与生产构建**

```powershell
npm run lint
npm run build
```

预期：两条命令退出码均为 0。

最终导出图片的视觉位置由项目维护者启动本地服务器后确认。

### Task 3: 修正顶部演奏顺序标记基线

**Files:**
- Modify: `components/editor/core/ScoreCanvas.tsx:1469-1473`

- [ ] **Step 1: 运行失败检查**

```powershell
$content = Get-Content -Raw 'components/editor/core/ScoreCanvas.tsx'
$count = ([regex]::Matches($content, [regex]::Escape("style={isExporting ? { top: '-0.5em' } : undefined}"))).Count
if ($count -ne 2) { exit 1 }
```

预期：退出码为 1；当前只有谱面内部标记包含导出位移。

- [ ] **Step 2: 为顶部标记增加相同的字母内层**

将顶部标记文字改为：

```tsx
<span className="relative" style={isExporting ? { top: '-0.5em' } : undefined}>
  {label}
</span>
```

顶部方框、箭头和普通页面样式保持不变。

- [ ] **Step 3: 运行通过检查**

```powershell
$content = Get-Content -Raw 'components/editor/core/ScoreCanvas.tsx'
$count = ([regex]::Matches($content, [regex]::Escape("style={isExporting ? { top: '-0.5em' } : undefined}"))).Count
if ($count -ne 2) { exit 1 }
```

预期：退出码为 0；谱面内部和顶部标记各有一处导出位移。

- [ ] **Step 4: 运行静态检查与生产构建**

```powershell
npm run lint
npm run build
```

预期：两条命令退出码均为 0。
