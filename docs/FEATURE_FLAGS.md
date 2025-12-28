# 功能开关管理指南

## 概述

应用使用 Supabase 数据库配置表实现功能开关，支持热更新（修改数据库即可生效，无需重新部署）。

## 数据库表结构

配置存储在 `app_config` 表中，包含以下字段：
- `key`: 配置键名（唯一）
- `value`: 配置值（JSONB 格式）
- `description`: 配置描述
- `updated_at`: 更新时间
- `updated_by`: 更新人（可选）

## 当前功能开关

### shop_enabled - 精选陶笛功能

控制"精选陶笛"功能的显示和访问。

## 使用方法

### 1. 启用功能

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 方法一：使用 INSERT ... ON CONFLICT（推荐）
INSERT INTO public.app_config (key, value, description)
VALUES (
  'shop_enabled',
  '{"enabled": true}'::jsonb,
  '精选陶笛功能开关'
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
```

或者使用 UPDATE：

```sql
-- 方法二：直接更新
UPDATE public.app_config
SET value = '{"enabled": true}'::jsonb,
    updated_at = NOW()
WHERE key = 'shop_enabled';
```

### 2. 禁用功能

```sql
UPDATE public.app_config
SET value = '{"enabled": false}'::jsonb,
    updated_at = NOW()
WHERE key = 'shop_enabled';
```

### 3. 检查功能状态

```sql
SELECT key, value, description, updated_at
FROM public.app_config
WHERE key = 'shop_enabled';
```

### 4. 通过 Supabase Dashboard 管理

1. 进入 Supabase Dashboard
2. 选择你的项目
3. 进入 Table Editor
4. 选择 `app_config` 表
5. 找到 `shop_enabled` 行
6. 编辑 `value` 字段：
   - 启用：`{"enabled": true}`
   - 禁用：`{"enabled": false}`
7. 保存更改

## 注意事项

### RLS 策略限制

由于安全考虑，`app_config` 表的写入权限被 RLS 策略限制。如果需要通过 SQL 修改配置：

1. **方法一（推荐）**：在 Supabase Dashboard 的 SQL Editor 中执行（会自动使用服务角色权限）
2. **方法二**：临时禁用 RLS 策略（不推荐，仅用于初始化）

### 缓存机制

配置值会被缓存 5 分钟，修改配置后可能需要等待最多 5 分钟才能生效。如果需要立即生效，可以：

1. 等待缓存过期（5分钟）
2. 重新部署应用（会清除所有缓存）
3. 在代码中使用 `revalidateTag` 清除特定配置的缓存（需要添加相应代码）

### 默认行为

- 如果配置不存在，功能默认**关闭**
- 如果配置值为 `null` 或格式错误，功能默认**关闭**

## 添加新功能开关

如果需要添加新的功能开关：

1. 在 `app_config` 表中插入新配置：

```sql
INSERT INTO public.app_config (key, value, description)
VALUES (
  'your_feature_key',
  '{"enabled": false}'::jsonb,
  '你的功能描述'
);
```

2. 在 `lib/supabase/config.ts` 中添加查询函数：

```typescript
export async function isYourFeatureEnabled(): Promise<boolean> {
  const config = await getConfig('your_feature_key');
  return config?.enabled === true;
}
```

3. 在需要的地方使用该函数控制功能显示/访问

## 故障排查

### 功能开关不生效

1. **检查配置是否存在**：
   ```sql
   SELECT * FROM public.app_config WHERE key = 'shop_enabled';
   ```

2. **检查配置值格式**：
   确保 `value` 字段是有效的 JSON，格式为 `{"enabled": true}` 或 `{"enabled": false}`

3. **检查缓存**：
   配置会被缓存 5 分钟，等待缓存过期或重新部署

4. **检查 RLS 策略**：
   确保读取策略允许所有人访问（SELECT 策略应该为 `USING (true)`）

### 无法修改配置

如果无法通过 SQL 修改配置：

1. 检查是否在 Supabase Dashboard 的 SQL Editor 中执行（推荐）
2. 检查 RLS 策略是否正确配置
3. 如果需要，可以临时禁用 RLS 策略（仅用于初始化，不推荐用于生产环境）

## 安全建议

1. **不要在生产环境禁用 RLS 策略**
2. **定期备份配置表**
3. **记录配置变更日志**（可以通过 `updated_at` 和 `updated_by` 字段追踪）
4. **考虑添加管理员角色检查**（未来可以扩展 RLS 策略）

