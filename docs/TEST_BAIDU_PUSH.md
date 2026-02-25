# 测试百度推送API指南

## 🖥️ 方法1: 使用PowerShell测试（推荐）

### Windows PowerShell

打开 PowerShell（在项目目录或任意位置），运行：

```powershell
# 推送单个URL
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push `
  -H "Content-Type: application/json" `
  -d '{\"url\": \"https://www.ocarinana.com\"}'
```

**注意：**
- 使用 `curl.exe` 而不是 `curl`（Windows 10+ 自带）
- 使用反引号 `` ` `` 进行换行（PowerShell语法）
- JSON中的引号需要转义：`\"`

### 或者使用单行命令（更简单）

```powershell
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H "Content-Type: application/json" -d "{\"url\": \"https://www.ocarinana.com\"}"
```

### 批量推送

```powershell
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H "Content-Type: application/json" -d "{\"urls\": [\"https://www.ocarinana.com\", \"https://www.ocarinana.com/shop\"]}"
```

---

## 🌐 方法2: 使用浏览器测试（最简单）

### 使用在线工具

1. 访问：https://reqbin.com/ 或 https://httpie.io/app
2. 选择 **POST** 方法
3. URL填写：`https://www.ocarinana.com/api/seo/baidu-push`
4. Headers添加：
   ```
   Content-Type: application/json
   ```
5. Body填写（选择JSON）：
   ```json
   {
     "url": "https://www.ocarinana.com"
   }
   ```
6. 点击 Send

### 使用浏览器开发者工具

1. 打开浏览器，按 `F12` 打开开发者工具
2. 切换到 **Console** 标签
3. 运行以下代码：

```javascript
fetch('https://www.ocarinana.com/api/seo/baidu-push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.ocarinana.com'
  })
})
.then(response => response.json())
.then(data => console.log('推送结果:', data))
.catch(error => console.error('错误:', error));
```

---

## 📝 方法3: 创建测试脚本（推荐用于多次测试）

创建一个测试文件，方便重复使用。

