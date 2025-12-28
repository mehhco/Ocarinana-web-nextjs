-- =============================================================
-- 初始化精选陶笛功能配置
-- 创建时间：2025-01-XX
-- 说明：在 Supabase Dashboard 的 SQL Editor 中手动执行此脚本
-- =============================================================

-- 初始化配置：精选陶笛功能（默认关闭）
INSERT INTO public.app_config (key, value, description)
VALUES (
  'shop_enabled',
  '{"enabled": false}'::jsonb,
  '精选陶笛功能开关'
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

