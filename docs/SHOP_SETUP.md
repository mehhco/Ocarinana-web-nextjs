# 商城模块设置指南

## 数据库迁移

1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 执行迁移文件 `supabase/migrations/0003_create_products.sql`
3. 确认 `products` 表已创建，并且 RLS 策略已启用

## 添加商品数据

### 方法一：通过 Supabase Dashboard

1. 进入 Supabase Dashboard → Table Editor
2. 选择 `products` 表
3. 点击 "Insert" → "Insert row"
4. 填写以下字段：

**必填字段：**
- `title`: 商品标题（例如："12孔AC陶笛 初学者入门"）
- `platform`: 平台类型（`taobao`、`tmall`、`jd`、`pdd`）
- `product_url`: 商品链接（完整的电商平台商品URL）
- `is_active`: 设置为 `true`

**可选字段：**
- `description`: 商品描述
- `image_url`: 商品图片URL（建议使用电商平台提供的图片链接）
- `price`: 当前价格（数字，例如：99.00）
- `original_price`: 原价（如果有折扣）
- `sales_count`: 销量（数字）
- `rating`: 评分（0-5之间的小数，例如：4.8）
- `is_featured`: 是否推荐（`true` 或 `false`）
- `sort_order`: 排序顺序（数字越小越靠前，默认0）

### 方法二：通过 SQL 插入

```sql
INSERT INTO public.products (
  title,
  description,
  image_url,
  platform,
  product_url,
  price,
  original_price,
  sales_count,
  rating,
  is_featured,
  sort_order,
  is_active
) VALUES (
  '12孔AC陶笛 初学者入门',
  '适合初学者的12孔AC调陶笛，音色优美，易于上手',
  'https://img.alicdn.com/imgextra/i4/3175561121/O1CN01g8x0U71K9T6KMg5vk_!!3175561121.jpg_.webp',
  'taobao',
  'https://item.taobao.com/item.htm?id=1002638842381&mi_id=0000JG6itfl4RqcfmzjaOnv4cZGbIxVJSv2VDNIt-Pu1y5Y&spm=a219t._portal_v2_pages_promo_goods_detail_htm.MainGoodCard.d_good_detail_main_main_img.629675a5vldk5c&union_lens=lensId%253APUB%25401766679733%2540212ce7b8_2fdc_19b565165f7_8a27%2540027Sb7HtwJEAbCeAOjjQV0xq%2540eyJmbG9vcklkIjo4NTQ2Nywiic3BtQiiI6Il9wb3J0YWxfdjJfcGFnZXNfcHJvbW9fZ29vZHNfZGV0YWlsX2h0bSIsInNyY0Zsb29ySWQiiOiiI4MDY3NCJ9%253BtkScm%253Asearch_fuzzy_selectionPlaza_site_4358_0_0_0_6_17666797338083204487362%253Bscm%253A1007.30148.329090.pub_search-item_8eaf08c5-24b2-4466-b5d9-493f2b3c9e5e_%253Bb_pvid%253Aa219t._portal_v2_home_plus_index_htm_1766679632305_5440953124290837_DVLUI',
  99.00,
  129.00,
  1000,
  4.8,
  true,
  1,
  true
);
```

## 商品图片URL获取

### 淘宝/天猫
1. 打开商品页面
2. 右键点击商品主图 → "复制图片地址"
3. 将URL粘贴到 `image_url` 字段

### 京东
1. 打开商品页面
2. 找到商品主图，右键 → "复制图片地址"
3. 将URL粘贴到 `image_url` 字段

### 拼多多
1. 打开商品页面
2. 找到商品主图，右键 → "复制图片地址"
3. 将URL粘贴到 `image_url` 字段

**注意：** 如果图片无法显示，可能需要将图片域名添加到 `next.config.ts` 的 `images.remotePatterns` 中。

## 商品链接格式

确保商品链接是完整的、可直接访问的URL：

- 淘宝：`https://item.taobao.com/item.htm?id=...`
- 天猫：`https://detail.tmall.com/item.htm?id=...`
- 京东：`https://item.jd.com/...`
- 拼多多：`https://mobile.yangkeduo.com/goods.html?goods_id=...`

## 推荐商品设置

将重要或热销商品设置为推荐商品：
- 设置 `is_featured = true`
- 设置较小的 `sort_order` 值（例如：1, 2, 3）

推荐商品会优先显示在商品列表的前面。

## 测试

1. 启动开发服务器：`npm run dev`
2. 访问 `http://localhost:3000/shop`
3. 确认商品列表正常显示
4. 点击商品卡片，确认链接跳转正常

## 常见问题

### 图片不显示
- 检查图片URL是否正确
- 确认图片域名已添加到 `next.config.ts` 的 `images.remotePatterns`
- 检查图片URL是否支持HTTPS

### 商品不显示
- 确认 `is_active = true`
- 检查 RLS 策略是否正确配置
- 查看浏览器控制台是否有错误信息

### 链接跳转失败
- 确认商品链接格式正确
- 检查链接是否包含完整的协议（https://）
- 测试链接是否在浏览器中可以直接打开

