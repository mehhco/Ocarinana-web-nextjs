# ✅ 性能优化测试执行清单

**完成时间**: 2025-10-13  
**测试时间**: 10-15 分钟  
**目标**: 验证 Day 1-3 所有优化效果

---

## 🚀 快速测试（5分钟）

### 步骤 1: 启动项目

```bash
cd with-supabase-app

# 清除缓存（确保使用最新代码）
rm -rf .next

# 启动开发服务器
npm run dev
```

---

### 步骤 2: 测试编辑器页面

#### 打开浏览器并访问

```
http://localhost:3000/protected/scores
```

#### ✅ 预期效果

1. **立即看到**:
   - ✅ 页面框架（顶部"返回主页"按钮）
   - ✅ Loading 骨架屏（工具栏 + 编辑器框架）
   - ✅ 旋转加载动画 + "加载编辑器中..."

2. **1-2 秒后**:
   - ✅ 完整编辑器出现
   - ✅ iframe 正常显示
   - ✅ 编辑器可以正常使用

---

### 步骤 3: 检查网络请求（Chrome DevTools）

1. 按 `F12` 打开 DevTools
2. 切换到 **Network** 标签
3. 勾选 **Disable cache**
4. 刷新页面 (Ctrl+R)

#### ✅ 应该看到

| 文件 | 说明 | 状态 |
|------|------|------|
| `scores-bridge.chunk.js` | 延迟加载（不在初始请求中） | ✅ |
| `*.webp` | WebP 格式指法图 | ✅ |
| `index.html` | iframe 编辑器页面 | ✅ |

#### ❌ 不应该看到

- ❌ 初始 bundle 包含 scores-bridge
- ❌ PNG 格式图片（应该是 WebP）

---

## 📊 完整测试（15分钟）

### 测试 1: Bundle 大小检查（3分钟）

```bash
npm run build
```

**查看输出**:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    X kB         ~150 kB
├ ○ /protected/scores                    X kB         ~120 kB  ← 应该减少!
└ ○ ...
```

**目标**:
- ✅ `/protected/scores` First Load JS < 150 KB
- ✅ 比之前减少 30-40%

---

### 测试 2: Lighthouse 性能测试（5分钟）

#### 步骤

1. 打开 Chrome DevTools (F12)
2. 切换到 **Lighthouse** 标签
3. 配置:
   - ✅ Performance
   - ✅ Desktop
   - ❌ 取消其他选项
4. 点击 **Analyze page load**
5. 等待测试完成（1-2 分钟）

#### 目标分数

| 指标 | 目标 | 状态 |
|------|------|------|
| **Performance** | ≥ 78 | ⬜ |
| **FCP** | < 1.0s | ⬜ |
| **LCP** | < 2.0s | ⬜ |
| **TBT** | < 200ms | ⬜ |
| **CLS** | < 0.1 | ⬜ |

---

### 测试 3: WebP 图片验证（2分钟）

#### 步骤

1. 访问编辑器页面
2. 打开 **Network** 标签
3. 筛选: **Img**
4. 查看图片请求

#### 预期效果

| 检查项 | 预期 | 状态 |
|--------|------|------|
| 图片格式 | `.webp` (不是 `.png`) | ⬜ |
| 图片大小 | 每张 10-20 KB | ⬜ |
| 加载速度 | 快速加载 | ⬜ |

---

### 测试 4: 数据库索引验证（3分钟）

#### 在 Supabase SQL Editor 中运行

```sql
-- 1. 查看所有索引
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'scores'
ORDER BY indexname;
```

#### 预期结果（应该看到 7 个索引）

| 索引名 | 说明 | 状态 |
|--------|------|------|
| `scores_pkey` | 主键 | ⬜ |
| `idx_scores_owner` | 用户索引 | ⬜ |
| `idx_scores_updated_at` | 更新时间索引 | ⬜ |
| `idx_scores_owner_created` | 用户+创建时间 ✨ | ⬜ |
| `idx_scores_owner_updated` | 用户+更新时间 ✨ | ⬜ |
| `idx_scores_owner_score` | 用户+乐谱ID ✨ | ⬜ |
| `idx_scores_title_search` | 标题搜索 ✨ | ⬜ |

---

### 测试 5: API 性能验证（2分钟）

#### 在 Supabase SQL Editor 中运行

```sql
-- 测试查询性能（使用您的用户 ID）
EXPLAIN ANALYZE
SELECT score_id, title, updated_at
FROM scores
WHERE owner_user_id = (
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')
  )::uuid
)
ORDER BY updated_at DESC
LIMIT 20;
```

#### 预期结果

```
Execution Time: < 1 ms  ← 应该非常快!
```

**目标**:
- ✅ 执行时间 < 1ms
- ✅ 使用索引扫描（不是全表扫描）

---

## 🎯 成功标准

### 必须通过 ✅ (核心指标)

- [ ] 编辑器显示 Loading 状态
- [ ] ScoresBridge 延迟加载
- [ ] WebP 图片正常加载
- [ ] 7 个数据库索引创建成功
- [ ] API 查询 < 1ms
- [ ] Lighthouse Performance ≥ 75

### 加分项 🌟 (优秀指标)

- [ ] Lighthouse Performance ≥ 78
- [ ] FCP < 1s
- [ ] LCP < 2s
- [ ] Bundle 减少 > 30%
- [ ] 无 linter 错误

---

## 📋 测试结果记录

### 性能指标

| 指标 | 目标 | 实际值 | 状态 |
|------|------|--------|------|
| Performance Score | ≥ 78 | ___ | ⬜ |
| FCP | < 1s | ___ | ⬜ |
| LCP | < 2s | ___ | ⬜ |
| TTI | < 2.5s | ___ | ⬜ |
| Bundle Size | < 300 KB | ___ | ⬜ |

### 功能检查

| 功能 | 状态 |
|------|------|
| Loading 状态显示 | ⬜ |
| 动态导入工作 | ⬜ |
| WebP 图片加载 | ⬜ |
| 数据库索引 (7个) | ⬜ |
| API 响应 < 1ms | ⬜ |
| 编辑器正常工作 | ⬜ |

---

## 🐛 常见问题

### Q1: 看不到 Loading 状态

**原因**: 网络太快

**解决**:
```
Network 标签 → Throttling → Fast 3G
```

---

### Q2: 图片还是 PNG 格式

**检查 1**: WebP 文件是否存在

```bash
ls public/webfile/static/C-graph/*.webp
```

**检查 2**: 浏览器是否支持 WebP

```javascript
// 在浏览器控制台运行
console.log(window.supportsWebP);  // 应该是 true
```

**解决**: 重新转换图片

```bash
node scripts/convert-to-webp.js
```

---

### Q3: Bundle 没有减少

**原因**: 缓存问题

**解决**:
```bash
rm -rf .next
npm run build
```

---

### Q4: 数据库索引缺失

**检查**: 迁移是否执行

```sql
-- 查看已执行的迁移
SELECT * FROM _prisma_migrations;  -- 如果使用 Prisma
```

**解决**: 重新运行迁移

```
在 Supabase Dashboard 中:
SQL Editor → 粘贴 0002_add_performance_indexes.sql → Run
```

---

### Q5: API 查询仍然很慢

**检查 1**: 是否有数据

```sql
SELECT COUNT(*) FROM scores;
```

**检查 2**: 索引是否使用

```sql
EXPLAIN ANALYZE SELECT ... -- 查看查询计划
```

**解决**: 确保索引已创建（参考测试 4）

---

## 🎉 测试完成后

### 所有测试通过 ✅

**恭喜！性能优化成功！**

您已经完成：
- ✅ 图片优化（-75%）
- ✅ 数据库优化（查询快 200 倍）
- ✅ 代码分割（Bundle -37%）
- ✅ 综合评分提升 +6 分（72 → 78）

### 下一步选择

#### 选项 1: 开始商业化 💰 (推荐)

```
Week 4: Stripe 支付集成 (2 天)
Week 4: 会员功能限制 (1 天)
Week 5: 测试覆盖 (3 天)
Week 5: 用户文档 (2 天)
Week 6: 内测 + 优化 (5 天)
→ 目标: 85/100 分 + 开始盈利
```

#### 选项 2: 继续性能优化 ⚡

```
Service Worker 缓存 (1 天) → +2 分
字体优化 (2 小时) → +1 分
CSS 优化 (2 小时) → +1 分
→ 目标: 82/100 分
```

---

### 部分测试失败 ❌

**不要担心！**

1. 查看 **常见问题** 部分
2. 检查具体失败的测试
3. 根据错误信息调试
4. 重新运行测试

**获取帮助**:
- 📖 查看详细文档: `DAY3_CODE_SPLITTING_COMPLETE.md`
- 📖 性能指南: `PERFORMANCE_OPTIMIZATION_COMPLETE.md`
- 📖 测试指南: `QUICK_TEST_GUIDE.md`

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `PERFORMANCE_OPTIMIZATION_COMPLETE.md` | 综合优化报告 |
| `DAY3_CODE_SPLITTING_COMPLETE.md` | Day 3 详细报告 |
| `QUICK_TEST_GUIDE.md` | 快速测试指南 |
| `WEBP_TEST_GUIDE.md` | WebP 测试指南 |
| `EXECUTE_DB_OPTIMIZATION.md` | 数据库优化执行 |

---

**祝测试顺利！🚀✨**

