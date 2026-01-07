# 百度推送API配置指南

## 📋 步骤1: 获取推送Token

### 1.1 进入API提交页面

1. 登录 [百度站长平台](https://ziyuan.baidu.com/)
2. 进入您的网站管理页面
3. 点击左侧菜单："数据引入" → "链接提交"
4. 选择 "**API提交**" 标签

### 1.2 获取Token

在API提交页面，您会看到：

**接口调用地址示例：**
```
http://data.zz.baidu.com/urls?site=https://www.ocarinana.com&token=xxxxxxxxxxxxx
```

**需要复制的内容：**
- `site` 参数的值：`https://www.ocarinana.com`
- `token` 参数的值：`xxxxxxxxxxxxx`（这是您需要的token）

---

## 📋 步骤2: 配置环境变量

### 2.1 在Vercel中配置（生产环境）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```bash
# 变量名
BAIDU_PUSH_SITE

# 变量值
https://www.ocarinana.com
```

```bash
# 变量名
BAIDU_PUSH_TOKEN

# 变量值
您的token（从步骤1.2获取）
```

5. 选择环境：**Production**（生产环境）
6. 点击 **Save**

### 2.2 在本地配置（可选，用于测试）

在 `.env.local` 文件中添加：

```bash
BAIDU_PUSH_SITE=https://www.ocarinana.com
BAIDU_PUSH_TOKEN=您的token
```

---

## 📋 步骤3: 重新部署

配置环境变量后，需要重新部署应用：

1. 如果使用Vercel，环境变量更新后会自动触发重新部署
2. 或者手动触发部署：
   - 在Vercel Dashboard点击 **Deployments**
   - 找到最新的部署，点击 **Redeploy**

---

## 📋 步骤4: 测试API推送功能

### 4.1 使用curl测试（推荐）

在终端中运行：

```bash
# 推送单个URL
curl -X POST https://www.ocarinana.com/api/seo/baidu-push \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.ocarinana.com"}'

# 批量推送多个URL
curl -X POST https://www.ocarinana.com/api/seo/baidu-push \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.ocarinana.com", "https://www.ocarinana.com/shop", "https://www.ocarinana.com/home"]}'
```

### 4.2 预期响应

**成功响应：**
```json
{
  "success": true,
  "message": "成功推送 1 个URL，剩余配额：499"
}
```

**失败响应：**
```json
{
  "success": false,
  "message": "错误信息"
}
```

---

## 📋 步骤5: 推送重要页面

配置成功后，建议立即推送以下重要页面：

```bash
# 推送首页
curl -X POST https://www.ocarinana.com/api/seo/baidu-push \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.ocarinana.com"}'

# 推送商店页面
curl -X POST https://www.ocarinana.com/api/seo/baidu-push \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.ocarinana.com/shop"}'

# 推送登录页面
curl -X POST https://www.ocarinana.com/api/seo/baidu-push \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.ocarinana.com/auth/login"}'

# 批量推送所有重要页面
curl -X POST https://www.ocarinana.com/api/seo/baidu-push \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.ocarinana.com",
      "https://www.ocarinana.com/home",
      "https://www.ocarinana.com/shop",
      "https://www.ocarinana.com/auth/login",
      "https://www.ocarinana.com/auth/sign-up",
      "https://www.ocarinana.com/legal/privacy",
      "https://www.ocarinana.com/legal/terms"
    ]
  }'
```

---

## 📋 步骤6: 验证推送结果

### 6.1 在百度站长平台查看

1. 进入 "数据引入" → "链接提交"
2. 选择 "**数据反馈**" 标签
3. 查看推送的URL数量和状态

### 6.2 查看推送配额

在API提交页面可以看到：
- **今日提交上限**：每天可以推送的URL数量
- **今日提交余额**：今天还可以推送的数量

---

## 🔄 自动化推送（可选）

### 方案1: 在代码中自动推送

当发布新内容时，可以在代码中调用推送API：

```typescript
// 示例：在发布新页面后推送
import { pushUrlToBaidu, getBaiduPushConfig } from '@/lib/seo/baidu-push';

async function publishNewPage(url: string) {
  // ... 发布页面的逻辑 ...
  
  // 推送新页面到百度
  const config = getBaiduPushConfig();
  if (config) {
    const result = await pushUrlToBaidu(url, config);
    console.log('推送结果:', result);
  }
}
```

### 方案2: 定期推送Sitemap中的所有URL

可以创建一个脚本，定期推送sitemap中的所有URL：

```typescript
import { pushSitemapToBaidu, getBaiduPushConfig } from '@/lib/seo/baidu-push';

async function pushAllPages() {
  const config = getBaiduPushConfig();
  if (!config) {
    console.log('百度推送配置未设置');
    return;
  }

  const sitemapUrl = 'https://www.ocarinana.com/sitemap.xml';
  const result = await pushSitemapToBaidu(sitemapUrl, config);
  console.log('推送结果:', result);
}
```

---

## ⚠️ 注意事项

1. **配额限制**
   - 每个站点每天有推送配额限制
   - 配额不可累计，当日有效
   - 建议优先推送重要页面

2. **URL格式**
   - 必须使用完整的HTTPS URL
   - 不要提交带参数的重复URL
   - 如果URL有跳转，提交跳转后的最终URL

3. **推送频率**
   - 不要过于频繁推送相同URL
   - 建议只在内容更新时推送
   - 批量推送时注意不要超过配额

4. **错误处理**
   - 如果推送失败，检查token是否正确
   - 检查URL格式是否正确
   - 查看服务器日志获取详细错误信息

---

## 🆘 常见问题

### Q: 推送API返回"配置未设置"
A: 检查环境变量 `BAIDU_PUSH_SITE` 和 `BAIDU_PUSH_TOKEN` 是否正确配置，并确保已重新部署。

### Q: 推送API返回"推送失败"
A: 
- 检查token是否正确
- 确认URL格式正确（必须是完整的https URL）
- 检查是否超出每日配额

### Q: 如何查看推送配额？
A: 在百度站长平台的"API提交"页面可以看到今日提交上限和余额。

### Q: 可以推送多少个URL？
A: 具体配额取决于站点情况，通常在API提交页面会显示。新站点可能需要填写备案号来提升配额。

---

## ✅ 完成检查清单

- [ ] 已在百度站长平台获取API推送Token
- [ ] 已在Vercel配置环境变量 `BAIDU_PUSH_SITE`
- [ ] 已在Vercel配置环境变量 `BAIDU_PUSH_TOKEN`
- [ ] 已重新部署应用
- [ ] 已测试API推送功能（返回成功）
- [ ] 已推送重要页面到百度
- [ ] 已在百度站长平台验证推送结果

