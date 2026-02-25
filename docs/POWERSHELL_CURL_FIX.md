# PowerShell curl 命令修复

## 问题原因

PowerShell 中的引号转义与 bash 不同，导致 JSON 格式错误。

## ✅ 正确的命令格式

### 方法1: 使用单引号（推荐）

```powershell
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H 'Content-Type: application/json' -d '{"url": "https://www.ocarinana.com"}'
```

### 方法2: 使用反引号转义

```powershell
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H "Content-Type: application/json" -d '{\"url\": \"https://www.ocarinana.com\"}'
```

### 方法3: 使用变量（最清晰）

```powershell
$body = '{"url": "https://www.ocarinana.com"}'
curl.exe -X POST https://www.ocarinana.com/api/seo/baidu-push -H "Content-Type: application/json" -d $body
```

### 方法4: 使用 Invoke-RestMethod（PowerShell原生，推荐）

```powershell
Invoke-RestMethod -Uri https://www.ocarinana.com/api/seo/baidu-push -Method POST -ContentType "application/json" -Body '{"url": "https://www.ocarinana.com"}'
```

## 批量推送

```powershell
$body = '{"urls": ["https://www.ocarinana.com", "https://www.ocarinana.com/shop"]}'
Invoke-RestMethod -Uri https://www.ocarinana.com/api/seo/baidu-push -Method POST -ContentType "application/json" -Body $body
```

