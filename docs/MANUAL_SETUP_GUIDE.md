# 手动配置指南

本文档列出所有需要您手动配置的事项，以确保SEO优化功能正常工作。

## 🔴 必需配置（生产环境）

### 1. 环境变量配置

在您的 `.env.local` 文件（本地开发）或 Vercel 环境变量（生产环境）中添加以下配置：

#### 必需的环境变量

```bash
# 应用URL（必须设置为您的实际域名）
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### SEO相关环境变量（可选但强烈推荐）

```bash
# 百度站长工具验证码
# 获取方式：见下方"百度站长工具配置"部分
NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=your_verification_code

# 百度推送API配置
# 获取方式：见下方"百度推送API配置"部分
BAIDU_PUSH_SITE=https://yourdomain.com
BAIDU_PUSH_TOKEN=your_push_token
```

---

## 📊 百度站长工具配置（推荐）

### 步骤1: 注册并登录百度站长平台

1. 访问 [百度站长平台](https://ziyuan.baidu.com/)
2. 使用百度账号登录
3. 如果没有账号，需要先注册

### 步骤2: 添加网站

1. 登录后，点击"用户中心" → "站点管理"
2. 点击"添加网站"
3. 输入您的网站URL（例如：`https://ocarinana.com`）
4. 选择网站类型和验证方式

### 步骤3: 验证网站所有权

有两种验证方式：

#### 方式A: Meta标签验证（推荐）

1. 在验证页面选择"HTML标签验证"
2. 复制验证码（类似：`abc123def456`）
3. 将验证码添加到环境变量：
   ```bash
   NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=abc123def456
   ```
4. 重新部署网站
5. 在百度站长平台点击"完成验证"

#### 方式B: 文件验证

1. 在验证页面选择"文件验证"
2. 下载验证文件（如：`baidu_verify_xxxxx.html`）
3. 将文件上传到您的网站根目录
4. 在百度站长平台点击"完成验证"

### 步骤4: 获取推送接口Token

1. 验证成功后，进入"数据引入" → "链接提交"
2. 选择"API提交"
3. 复制接口调用地址中的token（URL中的token参数）
4. 将token添加到环境变量：
   ```bash
   BAIDU_PUSH_SITE=https://yourdomain.com
   BAIDU_PUSH_TOKEN=your_token_here
   ```

### 步骤5: 提交Sitemap

1. 在百度站长平台，进入"数据引入" → "链接提交"
2. 选择"sitemap"
3. 输入您的sitemap地址：`https://yourdomain.com/sitemap.xml`
4. 点击"提交"

---

## 🔍 Google Search Console配置（推荐）

### 步骤1: 添加网站

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 点击"添加属性"
3. 选择"网址前缀"方式
4. 输入您的网站URL

### 步骤2: 验证网站所有权

1. 选择"HTML标记"验证方式
2. 复制meta标签中的content值
3. 添加到环境变量（如果需要）
4. 或者使用其他验证方式（DNS、HTML文件等）

### 步骤3: 提交Sitemap

1. 验证成功后，进入"Sitemap"部分
2. 输入：`sitemap.xml`
3. 点击"提交"

---

## 📈 分析工具配置（可选）

### Google Analytics

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建属性并获取Measurement ID（格式：`G-XXXXXXXXXX`）
3. 添加到环境变量：
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 百度统计

1. 访问 [百度统计](https://tongji.baidu.com/)
2. 添加网站并获取统计代码ID
3. 添加到环境变量：
   ```bash
   NEXT_PUBLIC_BAIDU_ANALYTICS_ID=your_baidu_id
   ```

---

## ✅ 配置检查清单

### 部署前检查

- [ ] `NEXT_PUBLIC_APP_URL` 已设置为生产环境域名
- [ ] 所有必需的环境变量已配置
- [ ] 网站已成功部署并可访问
- [ ] `https://yourdomain.com/sitemap.xml` 可正常访问
- [ ] `https://yourdomain.com/robots.txt` 可正常访问

### SEO功能检查

- [ ] 百度站长工具验证已完成
- [ ] 百度推送API token已配置（如需要）
- [ ] Sitemap已提交到百度站长平台
- [ ] Google Search Console验证已完成（如需要）
- [ ] Sitemap已提交到Google Search Console（如需要）

### 功能测试

- [ ] 访问网站首页，检查meta标签是否正确
- [ ] 使用浏览器开发者工具检查结构化数据（JSON-LD）
- [ ] 测试百度推送API（如已配置）：
  ```bash
  curl -X POST https://yourdomain.com/api/seo/baidu-push \
    -H "Content-Type: application/json" \
    -d '{"url": "https://yourdomain.com"}'
  ```

---

## 🚀 部署后操作

### 1. 验证SEO配置

部署后，访问以下URL验证配置：

- Sitemap: `https://yourdomain.com/sitemap.xml`
- Robots: `https://yourdomain.com/robots.txt`
- 首页: `https://yourdomain.com`（检查meta标签）

### 2. 使用SEO测试工具

- [Google Rich Results Test](https://search.google.com/test/rich-results) - 测试结构化数据
- [百度站长工具 - 抓取诊断](https://ziyuan.baidu.com/diagnosis/index) - 测试百度爬虫访问
- [PageSpeed Insights](https://pagespeed.web.dev/) - 测试页面性能

### 3. 监控SEO效果

定期检查：

- 百度站长平台的数据报告
- Google Search Console的搜索表现
- 网站收录情况
- 关键词排名变化

---

## 📝 注意事项

1. **环境变量更新后需要重新部署**
   - 本地开发：重启开发服务器
   - 生产环境：重新部署应用

2. **百度推送API配额**
   - 每个站点每天有推送配额限制
   - 建议优先推送重要页面

3. **Sitemap更新**
   - 当添加新页面时，sitemap会自动更新
   - 但需要等待搜索引擎重新抓取，或使用推送API主动推送

4. **验证码安全**
   - 不要将验证码提交到Git仓库
   - 使用环境变量管理敏感信息

---

## 🆘 常见问题

### Q: 百度验证失败怎么办？

A: 
1. 检查环境变量是否正确配置
2. 确认网站已部署且可访问
3. 检查meta标签是否正确生成（查看网页源代码）
4. 尝试使用文件验证方式

### Q: 推送API返回错误？

A:
1. 检查token是否正确
2. 确认URL格式正确（必须是完整的https URL）
3. 检查是否超出每日配额
4. 查看服务器日志获取详细错误信息

### Q: Sitemap无法访问？

A:
1. 确认网站已部署
2. 检查 `NEXT_PUBLIC_APP_URL` 配置是否正确
3. 尝试直接访问 `https://yourdomain.com/sitemap.xml`

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 环境变量配置是否正确
2. 网站是否已成功部署
3. 浏览器控制台是否有错误
4. 服务器日志中的错误信息

