# 快速测试百度推送API

## 🌐 方法1: 浏览器控制台（最简单，推荐）

### 步骤：

1. **打开浏览器**，访问您的网站：https://www.ocarinana.com

2. **按 `F12`** 打开开发者工具

3. **切换到 Console 标签**

4. **复制并粘贴以下代码**，然后按回车：

```javascript
fetch('https://www.ocarinana.com/api/seo/baidu-push', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({url: 'https://www.ocarinana.com'})
}).then(r => r.json()).then(console.log)
```

5. **查看结果**：
   - 如果成功，会显示：`{success: true, message: "成功推送 1 个URL，剩余配额：xxx"}`
   - 如果失败，会显示错误信息

---

## 💻 方法2: PowerShell（Windows终端）

### 打开PowerShell

1. 按 `Win + X`，选择 "Windows PowerShell" 或 "终端"
2. 或者按 `Win + R`，输入 `powershell`，按回车

### 运行测试命令

**推送单个URL：**
```powershell
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H "Content-Type: application/json" -d "{\"url\": \"https://www.ocarinana.com\"}"
```

**批量推送多个URL：**
```powershell
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H "Content-Type: application/json" -d "{\"urls\": [\"https://www.ocarinana.com\", \"https://www.ocarinana.com/shop\"]}"
```

**注意：**
- 使用 `curl.exe`（不是 `curl`）
- JSON中的引号需要转义：`\"`

---

## 📝 方法3: 使用测试脚本

### 使用Node.js脚本（推荐）

1. **在项目目录打开终端**

2. **运行测试脚本：**
   ```bash
   node scripts/test-baidu-push.js
   ```

### 使用PowerShell脚本

1. **在项目目录打开PowerShell**

2. **运行测试脚本：**
   ```powershell
   .\scripts\test-baidu-push.ps1
   ```

---

## ✅ 预期结果

### 成功响应：
```json
{
  "success": true,
  "message": "成功推送 1 个URL，剩余配额：499"
}
```

### 失败响应（配置未设置）：
```json
{
  "success": false,
  "message": "百度推送配置未设置，请检查环境变量 BAIDU_PUSH_SITE 和 BAIDU_PUSH_TOKEN"
}
```

### 失败响应（其他错误）：
```json
{
  "success": false,
  "message": "错误信息..."
}
```

---

## 🆘 常见问题

### Q: 返回"配置未设置"
**原因：** 环境变量未配置或未重新部署

**解决：**
1. 检查Vercel环境变量是否已配置
2. 确认已重新部署应用
3. 等待几分钟让部署生效

### Q: PowerShell命令报错
**原因：** 可能是引号转义问题

**解决：**
- 使用浏览器控制台方法（最简单）
- 或使用测试脚本：`node scripts/test-baidu-push.js`

### Q: 返回"推送失败"
**原因：** Token错误或URL格式问题

**解决：**
1. 检查token是否正确
2. 确认URL格式正确（必须是完整的https URL）
3. 检查是否超出每日配额

---

## 💡 推荐测试顺序

1. **先用浏览器控制台测试**（最简单，立即看到结果）
2. **如果成功，再用PowerShell批量推送**重要页面
3. **定期使用测试脚本**检查功能是否正常

