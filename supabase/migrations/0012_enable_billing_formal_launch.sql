-- =============================================================
-- Plus 订阅正式收费开关
--
-- 购买入口现在由 app_config.billing_enabled 作为总闸门控制，
-- 不再要求用户存在于 billing_testers 灰度名单。
-- =============================================================

INSERT INTO public.app_config (key, value, description)
VALUES (
  'billing_enabled',
  '{"enabled": true}'::jsonb,
  'Plus 订阅正式收费总开关'
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

ANALYZE public.app_config;
