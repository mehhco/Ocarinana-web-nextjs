# 百度推送API测试脚本
# 使用方法: .\scripts\test-baidu-push.ps1

Write-Host "🚀 测试百度推送API" -ForegroundColor Green
Write-Host ""

# 测试单个URL推送
Write-Host "📤 测试1: 推送首页..." -ForegroundColor Yellow
try {
    $body1 = '{"url": "https://www.ocarinana.com"}'
    $response1 = Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/baidu-push" -Method POST -ContentType "application/json" -Body $body1
    
    Write-Host "✅ 成功！" -ForegroundColor Green
    Write-Host "响应: " -ForegroundColor Cyan -NoNewline
    $response1 | ConvertTo-Json | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# 测试批量推送
Write-Host "📤 测试2: 批量推送多个页面..." -ForegroundColor Yellow
try {
    $body2 = '{"urls": ["https://www.ocarinana.com", "https://www.ocarinana.com/shop", "https://www.ocarinana.com/home"]}'
    $response2 = Invoke-RestMethod -Uri "https://www.ocarinana.com/api/seo/baidu-push" -Method POST -ContentType "application/json" -Body $body2
    
    Write-Host "✅ 成功！" -ForegroundColor Green
    Write-Host "响应: " -ForegroundColor Cyan -NoNewline
    $response2 | ConvertTo-Json | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "✅ 测试完成！" -ForegroundColor Green
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "   - 如果返回 '配置未设置'，请检查Vercel环境变量" -ForegroundColor White
Write-Host "   - 如果返回 '推送失败'，请检查token和URL格式" -ForegroundColor White
Write-Host "   - 成功响应应包含 '成功推送' 字样" -ForegroundColor White

