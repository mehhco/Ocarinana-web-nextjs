# 乐谱编辑器 v2 重构项目

## 项目状态

**当前阶段：** 阶段一（基础设施）✅ 已完成

**分支：** `feature/editor-v2-refactor`

## 已完成工作

### 1. 依赖安装
- ✅ zustand - 状态管理
- ✅ immer - 不可变数据结构
- ✅ react-hotkeys-hook - 键盘快捷键
- ✅ nanoid - ID 生成

### 2. 类型系统
- ✅ `lib/editor/types.ts` - 完整的 TypeScript 类型定义
  - 音符类型（Note, Rest, Extension）
  - 乐谱文档类型（ScoreDocument）
  - 连音线类型（Tie）
  - 历史记录类型（History）
  - 指法图类型（FingeringMap）

### 3. 常量定义
- ✅ `components/editor/lib/constants.ts` - 编辑器常量
  - 调号、拍号、皮肤选项
  - 音符时值、休止符选项
  - 历史记录配置、虚拟滚动配置

### 4. 指法图映射
- ✅ `components/editor/lib/fingeringMap.ts` - 陶笛指法图数据
  - C调、F调、G调指法图映射
  - 支持高低音点
  - 图片路径自动优化

### 5. 状态管理
- ✅ `components/editor/hooks/useScoreStore.ts` - Zustand Store
  - 文档状态管理
  - 选中状态管理
  - 历史记录（撤销/重做）
  - 连音线工具状态
  - 所有 Action 实现

### 6. 路由和页面
- ✅ `app/protected/editor/v2/page.tsx` - 编辑器主页面
- ✅ `app/protected/editor/v2/layout.tsx` - 编辑器布局
- ✅ `app/protected/editor/v2/new/page.tsx` - 新建乐谱页面
- ✅ 乐谱列表页面添加「试用新版编辑器」入口

### 7. 基础组件（占位）
- ✅ `ScoreEditor.tsx` - 主编辑器组件
- ✅ `Toolbar.tsx` - 工具栏（占位）
- ✅ `ElementPanel.tsx` - 元素面板（占位）
- ✅ `ScoreCanvas.tsx` - 乐谱画布（占位）
- ✅ `useKeyboardShortcuts.ts` - 键盘快捷键（占位）

## 访问地址

- **新版编辑器：** `http://localhost:3000/protected/editor/v2`
- **新建乐谱（v2）：** `http://localhost:3000/protected/editor/v2/new`
- **乐谱列表：** `http://localhost:3000/{userId}/notes` （点击「试用新版编辑器」）

## 下一步工作

### 阶段二：静态 UI 组件（预计 2-3 天）

#### Toolbar 组件
- [ ] 标题输入框
- [ ] 调号选择器
- [ ] 拍号选择器
- [ ] 皮肤切换器
- [ ] 保存按钮
- [ ] 导出按钮（图片/JSON）
- [ ] 撤销/重做按钮
- [ ] 连音线工具开关

#### ElementPanel 组件
- [ ] 基础音符按钮（1-7）
- [ ] 高低音点按钮
- [ ] 延长线按钮
- [ ] 时值选择器
- [ ] 休止符按钮
- [ ] 小节操作按钮
- [ ] 歌词控制按钮
- [ ] 指法图控制按钮

### 阶段三：渲染层（预计 4-5 天）

#### ScoreCanvas 组件
- [ ] 小节渲染
- [ ] 音符渲染
- [ ] 延长线渲染
- [ ] 连音线 SVG 渲染
- [ ] 指法图叠加层
- [ ] 歌词输入框
- [ ] 选中状态高亮
- [ ] 虚拟滚动优化

### 阶段四：交互功能（预计 3-4 天）

- [ ] 音符点击选择
- [ ] 键盘快捷键（1-7输入，Ctrl+Z撤销等）
- [ ] 连音线绘制交互
- [ ] 歌词输入实时保存
- [ ] 自动保存到云端
- [ ] 图片导出功能

## 开发说明

### 技术栈
- **框架：** Next.js 15 + React 19
- **状态管理：** Zustand + Immer
- **样式：** Tailwind CSS + shadcn/ui
- **类型：** TypeScript 5

### 代码规范
- 所有组件使用 `'use client'` 指令
- 使用 TypeScript 严格模式
- 组件使用函数式组件
- 状态管理使用 Zustand Store

### 与旧版本共存
- 旧编辑器：`/protected/scores` （保持原样）
- 新编辑器：`/protected/editor/v2` （开发中）
- 两者使用相同的数据格式和 API

## 注意事项

1. **不要删除旧编辑器相关代码**，直到 v2 完全稳定
2. **保持数据格式兼容**，确保新旧编辑器可以互相打开
3. **阶段性提交**，每个阶段完成后创建 commit
4. **充分测试**，特别是撤销/重做、连音线、导出功能

## 问题跟踪

### 已知问题
- 暂无

### 待优化项
- 虚拟滚动性能优化
- 大乐谱加载优化
- 移动端适配（低优先级）
