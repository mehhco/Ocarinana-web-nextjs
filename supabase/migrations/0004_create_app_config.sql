-- =============================================================
-- 应用配置表：app_config
-- 创建时间：2025-01-XX
-- 说明：用于存储应用功能开关和配置，支持热更新
-- =============================================================

-- 创建 app_config 表
CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_app_config_key ON public.app_config(key);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION public.set_app_config_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_config_updated_at ON public.app_config;
CREATE TRIGGER trg_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_app_config_updated_at();

-- 启用 RLS（行级安全策略）
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- 所有人可以读取配置（功能开关需要公开）
DROP POLICY IF EXISTS "Anyone can read config" ON public.app_config;
CREATE POLICY "Anyone can read config"
  ON public.app_config FOR SELECT
  USING (true);

-- 暂时禁用写入权限（后续可通过 Supabase Dashboard 手动管理，或添加管理员检查逻辑）
-- 注意：如果需要通过应用修改配置，需要先禁用这些策略，或添加管理员检查
DROP POLICY IF EXISTS "Only admins can update config" ON public.app_config;
CREATE POLICY "Only admins can update config"
  ON public.app_config FOR UPDATE
  USING (false); -- 暂时禁用，后续可添加管理员检查

DROP POLICY IF EXISTS "Only admins can insert config" ON public.app_config;
CREATE POLICY "Only admins can insert config"
  ON public.app_config FOR INSERT
  WITH CHECK (false); -- 暂时禁用，后续可添加管理员检查

DROP POLICY IF EXISTS "Only admins can delete config" ON public.app_config;
CREATE POLICY "Only admins can delete config"
  ON public.app_config FOR DELETE
  USING (false); -- 暂时禁用，后续可添加管理员检查

-- 初始化配置：精选陶笛功能（默认关闭）
-- 注意：由于 RLS 策略限制，此插入需要在 Supabase Dashboard 的 SQL Editor 中手动执行
-- 执行以下 SQL 来初始化配置：
/*
INSERT INTO public.app_config (key, value, description)
VALUES (
  'shop_enabled',
  '{"enabled": false}'::jsonb,
  '精选陶笛功能开关'
)
ON CONFLICT (key) DO NOTHING;
*/

-- 更新表统计信息
ANALYZE public.app_config;
