# 百度推送API修复说明

## 🔧 已修复的问题

### 问题：site参数格式错误

**原因：**
百度API要求 `site` 参数只包含域名，不包含协议（`http://` 或 `https://`）

**修复：**
代码已更新，会自动移除协议前缀：
- 输入：`https://www.ocarinana.com`
- 处理为：`www.ocarinana.com`

## 📋 需要重新部署

修复后需要重新部署才能生效：

1. 提交更改：
   ```bash
   git add lib/seo/baidu-push.ts
   git commit -m "修复百度推送API的site参数格式"
   git push
   ```

2. 等待Vercel自动部署完成

3. 部署完成后再次测试

## ✅ 环境变量配置检查

请确认Vercel环境变量配置：

- `BAIDU_PUSH_SITE` = `https://www.ocarinana.com` （可以带协议，代码会自动处理）
- `BAIDU_PUSH_TOKEN` = 您的token

## 🧪 测试命令

部署完成后，运行：

```powershell
Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/baidu-push" -Method POST -ContentType "application/json" -Body '{"url": "https://www.ocarinana.com"}'
```

预期成功响应：
```json
{
  "success": true,
  "message": "成功推送 1 个URL，剩余配额：xxx"
}
```

