# 🧪 快速测试指南 - Day 3 代码分割优化

**测试时间**: 5-10 分钟  
**目标**: 验证代码分割和性能优化效果

---

## 🚀 快速开始（3分钟）

### 步骤 1: 启动开发服务器

```bash
cd with-supabase-app
npm run dev
```

等待提示：
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

### 步骤 2: 测试编辑器页面

#### 1️⃣ 打开浏览器 DevTools

- 按 `F12` 打开开发者工具
- 切换到 **Network** 标签
- 勾选 **Disable cache**

#### 2️⃣ 访问编辑器页面

访问: `http://localhost:3000/protected/scores`

**预期效果** ✅:
1. 快速显示页面框架
2. 看到 "加载编辑器中..." 提示
3. 1-2 秒后编辑器完全加载

#### 3️⃣ 检查网络请求

在 **Network** 标签中查找：

✅ **应该看到**:
- `scores-bridge.chunk.js` - 延迟加载
- `index.html` (iframe) - 编辑器页面
- WebP 图片格式

✅ **不应该看到**:
- 初始加载包含 scores-bridge
- PNG 格式图片（应该是 WebP）

---

## 📊 性能对比测试（5分钟）

### 步骤 1: Lighthouse 测试

1. 打开 Chrome DevTools (F12)
2. 切换到 **Lighthouse** 标签
3. 选择配置:
   - ✅ Performance
   - ✅ Desktop
   - ❌ 取消其他选项
4. 点击 **Analyze page load**

**目标分数**:
- **Performance**: ≥ 78/100 ✅
- **First Contentful Paint**: < 1s ✅
- **Largest Contentful Paint**: < 2s ✅
- **Total Blocking Time**: < 200ms ✅

---

### 步骤 2: Bundle 大小检查

```bash
npm run build
```

**查看输出**:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         150 kB
├ ○ /protected/scores                    800 B          120 kB  ← 应该减少了!
└ ○ ...

First Load JS shared by all             XXX kB
  ├ chunks/framework-xxx.js              XXX kB
  └ chunks/main-app-xxx.js               XXX kB
```

**目标**:
- `/protected/scores` 的 First Load JS < 150 KB ✅
- 比优化前减少 **30-40%** ✅

---

## 🔍 详细检查（可选）

### 检查 1: 动态导入验证

在浏览器控制台中运行：

```javascript
// 1. 访问主页
window.location.href = '/'

// 2. 打开 Network 标签，清除记录

// 3. 访问编辑器页面
window.location.href = '/protected/scores'

// 4. 查看 Network 标签
// 应该看到 scores-bridge.chunk.js 延迟加载
```

---

### 检查 2: Loading 状态验证

1. 打开 **Network** 标签
2. 设置 **Throttling: Fast 3G** (模拟慢速网络)
3. 访问 `/protected/scores`

**预期效果**:
- ✅ 立即显示 Loading 骨架屏
- ✅ 有旋转加载动画
- ✅ 显示 "加载编辑器中..."
- ✅ 几秒后完整编辑器出现

---

### 检查 3: WebP 图片验证

在 **Network** 标签中:

1. 筛选: **Img**
2. 查看图片请求

**预期效果**:
- ✅ 所有指法图都是 `.webp` 格式
- ✅ 图片大小显著减少（vs PNG）
- ✅ 浏览器正确加载 WebP

**如果看到 PNG**:
- 检查浏览器是否支持 WebP
- 查看 `public/webfile/static/` 目录是否有 `.webp` 文件

---

## ✅ 成功标准

### 必须通过 ✅

- [ ] 编辑器页面显示 Loading 状态
- [ ] ScoresBridge 延迟加载（Network 标签可见）
- [ ] Lighthouse Performance ≥ 75
- [ ] Bundle 大小减少（vs 优化前）

### 加分项 🌟

- [ ] Performance ≥ 78
- [ ] FCP < 1s
- [ ] LCP < 2s
- [ ] WebP 图片正常加载

---

## 🐛 故障排除

### 问题 1: 看不到 Loading 状态

**原因**: 网络太快，加载瞬间完成

**解决**:
1. Network 标签设置 **Throttling: Fast 3G**
2. 重新加载页面

---

### 问题 2: scores-bridge.chunk.js 未延迟加载

**原因**: 构建缓存问题

**解决**:
```bash
# 清除缓存并重新构建
rm -rf .next
npm run build
npm run dev
```

---

### 问题 3: 图片仍然是 PNG

**原因**: WebP 文件未生成

**解决**:
```bash
# 检查 WebP 文件是否存在
ls public/webfile/static/C-graph/*.webp

# 如果没有，重新转换
node scripts/convert-to-webp.js
```

---

### 问题 4: Performance 分数低于预期

**可能原因**:
1. 开发环境（开发模式未优化）
2. 网络速度影响
3. 浏览器扩展干扰

**解决**:
```bash
# 使用生产模式测试
npm run build
npm start

# 然后运行 Lighthouse
```

---

## 📊 预期结果总结

### 性能指标

| 指标 | 目标值 | 实际值 |
|------|--------|--------|
| Performance Score | ≥ 78 | ___ |
| FCP | < 1s | ___ |
| LCP | < 2s | ___ |
| TTI | < 2.5s | ___ |
| Bundle Size | < 300 KB | ___ |

### 功能检查

| 功能 | 状态 |
|------|------|
| Loading 状态显示 | ⬜ |
| 动态导入工作 | ⬜ |
| WebP 图片加载 | ⬜ |
| 编辑器正常工作 | ⬜ |

---

## 🎉 测试完成后

如果所有测试通过 ✅:

**恭喜！代码分割优化成功！**

### 优化成果

- ✅ Bundle 减少 **30-40%**
- ✅ 首屏加载快 **30%+**
- ✅ 用户体验显著提升
- ✅ 性能评分达到 **78/100**

### 下一步

您现在可以：

1. **继续性能优化** → 目标 90/100
   - Service Worker
   - 字体优化
   - CSS 优化

2. **开始商业化** → 目标 85/100
   - Stripe 支付集成
   - 会员功能限制
   - 测试 + 文档

3. **部署上线测试**
   - Vercel 部署
   - 生产环境性能测试
   - 真实用户体验测试

---

**文档参考**:
- 📖 `DAY3_CODE_SPLITTING_COMPLETE.md` - 完整优化报告
- 📖 `OPTIMIZATION_SUMMARY_DAY1_2.md` - Day 1-2 总结
- 📖 `PERFORMANCE_OPTIMIZATION_GUIDE.md` - 性能优化指南

