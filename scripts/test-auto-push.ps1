# 测试自动化推送功能
# 注意：需要先部署代码才能测试

Write-Host "=== 测试自动化推送功能 ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "https://www.ocarinana.com"

Write-Host "1. 测试推送所有页面（GET请求）" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/seo/auto-push" -Method GET
    Write-Host "成功！" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
} catch {
    Write-Host "失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "提示: 路由尚未部署，请先部署代码" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "2. 测试推送指定URL列表（POST请求）" -ForegroundColor Yellow
try {
    $body = @{
        urls = @(
            "$baseUrl",
            "$baseUrl/shop"
        )
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/seo/auto-push" -Method POST -ContentType "application/json" -Body $body
    Write-Host "成功！" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
} catch {
    Write-Host "失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "提示: 路由尚未部署，请先部署代码" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "3. 测试推送单个URL" -ForegroundColor Yellow
try {
    $body = @{
        url = "$baseUrl/shop"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/seo/auto-push-single" -Method POST -ContentType "application/json" -Body $body
    Write-Host "成功！" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
} catch {
    Write-Host "失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "提示: 路由尚未部署，请先部署代码" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "提示：" -ForegroundColor Cyan
Write-Host "  - 如果返回404，说明代码尚未部署" -ForegroundColor White
Write-Host "  - 部署后，定时任务会在每天UTC 02:00（北京时间10:00）自动执行" -ForegroundColor White
Write-Host "  - 可以在Vercel Dashboard的Cron Jobs中查看执行日志" -ForegroundColor White

