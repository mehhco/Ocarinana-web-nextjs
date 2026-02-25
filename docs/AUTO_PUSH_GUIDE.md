# 自动化推送指南

## 📋 功能说明

已实现百度推送的自动化功能，支持以下方式：

1. **手动触发推送** - 通过API端点手动推送
2. **定时自动推送** - 每天自动推送sitemap中的所有URL（需要部署后生效）
3. **单个URL推送** - 推送指定的单个URL

## ⚠️ 重要提示

**代码已创建，但需要部署后才能使用！**

请按照以下步骤操作：
1. 提交并推送代码到Git仓库
2. 等待Vercel自动部署完成
3. 部署完成后即可使用自动化推送功能

## 🚀 使用方法

### 1. 手动推送所有页面（推荐用于首次推送）

**方法A：使用GET请求**
```bash
curl https://www.ocarinana.com/api/seo/auto-push
```

**方法B：使用PowerShell**
```powershell
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/auto-push" -Method GET
```

**方法C：使用浏览器**
直接访问：`https://www.ocarinana.com/api/seo/auto-push`

### 2. 推送指定的URL列表

```powershell
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/auto-push" -Method POST -ContentType "application/json" -Body '{"urls": ["https://www.ocarinana.com/shop", "https://www.ocarinana.com/home"]}'
```

### 3. 推送单个URL

```powershell
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/auto-push-single" -Method POST -ContentType "application/json" -Body '{"url": "https://www.ocarinana.com/shop"}'
```

## ⏰ 定时自动推送

已配置Vercel Cron Jobs，每天凌晨2点（UTC时间，即北京时间上午10点）自动推送sitemap中的所有URL。

### Cron表达式说明
- `0 2 * * *` = 每天UTC 02:00（北京时间 10:00）

### 修改定时任务

编辑 `vercel.json` 文件，修改 `schedule` 字段：

```json
{
  "crons": [
    {
      "path": "/api/seo/auto-push",
      "schedule": "0 2 * * *"  // 修改这里
    }
  ]
}
```

**常用Cron表达式：**
- `0 2 * * *` - 每天凌晨2点（UTC）
- `0 */6 * * *` - 每6小时
- `0 0 * * 0` - 每周日凌晨（UTC）
- `0 0 1 * *` - 每月1号凌晨（UTC）

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "成功推送 8 个URL，剩余配额：1",
  "pushed": 8,
  "failed": 0,
  "details": {
    "success": 8,
    "remain": 1
  }
}
```

### 失败响应
```json
{
  "success": false,
  "message": "错误信息",
  "pushed": 0,
  "failed": 8
}
```

## 🔧 在代码中集成

### 在页面更新时自动推送

如果需要在页面内容更新时自动推送，可以在相应的API路由中添加：

```typescript
import { autoPushUrl } from '@/lib/seo/auto-push';

// 在页面更新后
const pushResult = await autoPushUrl('https://www.ocarinana.com/shop');
if (pushResult.success) {
  console.log('页面已推送到百度');
}
```

### 在部署后自动推送

可以在Vercel的部署后钩子中调用：

1. 在Vercel Dashboard中设置环境变量
2. 在部署后脚本中调用API

或者使用GitHub Actions：

```yaml
- name: Push to Baidu after deploy
  run: |
    curl -X GET https://www.ocarinana.com/api/seo/auto-push
```

## ⚠️ 注意事项

1. **配额限制**：百度每日推送配额有限，建议：
   - 首次部署后手动推送一次
   - 定时任务设置为每天一次即可
   - 避免频繁推送相同URL

2. **错误处理**：如果推送失败，检查：
   - 环境变量是否正确配置
   - 配额是否用完
   - Token是否有效

3. **性能考虑**：
   - 批量推送比单个推送更高效
   - 建议在非高峰时段执行定时任务

## 📝 测试

测试自动化推送功能：

```powershell
# 测试推送所有页面
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/auto-push" -Method GET

# 测试推送指定URL
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/auto-push" -Method POST -ContentType "application/json" -Body '{"urls": ["https://www.ocarinana.com"]}'

# 测试单个URL推送
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/auto-push-single" -Method POST -ContentType "application/json" -Body '{"url": "https://www.ocarinana.com"}'
```

