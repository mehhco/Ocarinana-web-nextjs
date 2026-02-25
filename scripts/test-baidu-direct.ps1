# 直接测试百度API（不通过我们的API路由）
# 用于验证token和配置是否正确

Write-Host "=== 直接测试百度推送API ===" -ForegroundColor Green
Write-Host ""

# 从您提供的接口地址提取的参数
$site = "https://www.ocarinana.com"
$token = "hceLQBxtaHXPlprt"
$testUrl = "https://www.ocarinana.com"

Write-Host "测试参数：" -ForegroundColor Yellow
Write-Host "  Site: $site" -ForegroundColor Cyan
Write-Host "  Token: $token" -ForegroundColor Cyan
Write-Host "  推送URL: $testUrl" -ForegroundColor Cyan
Write-Host ""

# 构建百度API URL - 使用单引号避免&符号问题
$encodedSite = [System.Web.HttpUtility]::UrlEncode($site)
$baiduApiUrl = 'http://data.zz.baidu.com/urls?site=' + $encodedSite + '&token=' + $token

Write-Host "百度API地址：" -ForegroundColor Yellow
Write-Host "  $baiduApiUrl" -ForegroundColor Cyan
Write-Host ""

Write-Host "发送推送请求..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baiduApiUrl -Method POST -ContentType "text/plain" -Body $testUrl
    
    Write-Host "成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "响应结果：" -ForegroundColor Cyan
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
    
    if ($response.success -gt 0) {
        Write-Host ""
        Write-Host "推送成功！成功推送 $($response.success) 个URL，剩余配额：$($response.remain)" -ForegroundColor Green
    }
} catch {
    Write-Host "失败" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "详细错误: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    
    # 尝试获取响应体
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "响应内容: $responseBody" -ForegroundColor Yellow
        } catch {
            Write-Host "无法读取响应内容" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "   - 如果成功，说明token和配置正确" -ForegroundColor White
Write-Host "   - 如果失败，请检查token是否正确（注意大小写和字符）" -ForegroundColor White
Write-Host "   - 确认token与百度站长平台显示的完全一致" -ForegroundColor White
