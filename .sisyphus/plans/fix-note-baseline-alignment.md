# 音符基线对齐修复计划

## 问题描述

当前音符渲染中，高音数字和低音数字没有保持在同一水平线上。带有高音点或低音点的音符会导致数字基线偏移。

**当前效果**：
- 高音音符（如 1̇）整体向上偏移
- 低音音符（如 1̣）整体向下偏移  
- 普通音符居中
- 结果：三个音符数字不在同一水平线上

**期望效果**（如图2《女儿情》）：
- 所有音符数字（1-7）基线保持在同一水平线
- 高音点（·）显示在数字上方，但不推动数字下移
- 低音点（·）显示在数字下方，但不推动数字上移

## 根本原因

当前代码使用 `flex-col` 布局，高音点和低音点作为独立元素占据空间：

```tsx
// 当前实现（问题代码）
{element.hasHighDot && <span className="text-base leading-none h-4">·</span>}
<div className="flex items-center justify-center h-8">
  <span className="text-2xl font-bold">{element.value}</span>
</div>
{element.hasLowDot && <span className="text-base leading-none h-4">·</span>}
```

问题：
1. `flex-col` 垂直堆叠，每个元素都占据独立空间
2. `h-4` 的高音点/低音点会推开其他元素
3. 导致数字位置随音点存在与否而变化

## 解决方案

### 方案：绝对定位音点

将音点改为绝对定位，使其悬浮在音符数字的上下方，不占用文档流空间。

```tsx
// 修复后的实现
<div className="relative flex items-center justify-center h-10">
  {/* 高音点 - 绝对定位在数字上方 */}
  {element.hasHighDot && (
    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-base leading-none">·</span>
  )}
  {/* 音符数字 - 基线固定 */}
  <span className="text-2xl font-bold">{element.value}</span>
  {/* 低音点 - 绝对定位在数字下方 */}
  {element.hasLowDot && (
    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-base leading-none">·</span>
  )}
</div>
```

### 技术要点

1. **容器使用 `relative`**：为绝对定位子元素创建定位上下文
2. **音点使用 `absolute`**：脱离文档流，不占用空间
3. **居中定位**：`left-1/2 -translate-x-1/2` 实现水平居中
4. **固定高度容器**：`h-10` 确保所有音符元素高度一致
5. **音点位置**：`-top-1` 和 `-bottom-1` 微调位置

## 实施步骤

### Step 1: 定位修改文件
- 文件：`components/editor/core/ScoreCanvas.tsx`
- 函数：`NoteElementComponent`
- 行号：第 58-85 行（音符渲染部分）

### Step 2: 代码修改

**修改前：**
```tsx
// 第 73-77 行
{element.hasHighDot && <span className="text-base leading-none h-4">·</span>}
<div className="flex items-center justify-center h-8">
  <span className="text-2xl font-bold">{element.value}</span>
</div>
{element.hasLowDot && <span className="text-base leading-none h-4">·</span>}
```

**修改后：**
```tsx
// 第 73-85 行
{/* 音符值容器 - 固定高度确保基线一致 */}
<div className="relative flex items-center justify-center h-10">
  {/* 高音点 - 绝对定位在上方 */}
  {element.hasHighDot && (
    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-base leading-none">·</span>
  )}
  {/* 音符值 */}
  <span className="text-2xl font-bold">{element.value}</span>
  {/* 低音点 - 绝对定位在下方 */}
  {element.hasLowDot && (
    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-base leading-none">·</span>
  )}
</div>
```

### Step 3: 验证

1. **启动开发服务器**：`npm run dev`
2. **访问编辑器**：打开 `/protected/editor/v2`
3. **添加测试音符**：
   - 添加普通音符：1, 2, 3
   - 添加高音音符：1̇, 2̇, 3̇
   - 添加低音音符：1̣, 2̣, 3̣
4. **验证效果**：所有数字应该在同一水平线上，只有音点位置不同

### Step 4: 调整细节（如需）

根据视觉效果微调：
- 音点垂直位置：调整 `-top-1` / `-bottom-1` 的值
- 容器高度：调整 `h-10` 的值
- 音点大小：调整 `text-base` 的值

## 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 音点遮挡 | 低 | 中 | 通过 `-top-1`/`-bottom-1` 调整位置 |
| 布局错乱 | 低 | 中 | 保持父容器 `flex-col` 不变，只改音符部分 |
| 导出图片异常 | 低 | 高 | 验证 html2canvas 能正确渲染绝对定位元素 |

## 测试用例

1. **普通音符**：1, 2, 3, 4, 5, 6, 7 — 应正常显示
2. **高音音符**：1̇, 2̇, 3̇, 4̇, 5̇, 6̇, 7̇ — 音点在数字上方
3. **低音音符**：1̣, 2̣, 3̣, 4̣, 5̣, 6̣, 7̣ — 音点在数字下方
4. **混合显示**：普通+高音+低音混合，所有数字基线应对齐
5. **指法图模式**：开启指法图显示后，音符仍应对齐
6. **歌词模式**：开启歌词显示后，音符仍应对齐

## 回滚方案

如需回滚：
1. 恢复 `components/editor/core/ScoreCanvas.tsx` 第 73-77 行为原始代码
2. 或使用 git：`git checkout components/editor/core/ScoreCanvas.tsx`

## 后续优化（可选）

1. 考虑使用 SVG 或 Canvas 渲染更精确的乐谱
2. 添加单元测试验证音符渲染位置
3. 优化音点样式（颜色、大小、形状）

---

**计划创建时间**: 2026-03-01  
**预计实施时间**: 10 分钟  
**优先级**: 高
