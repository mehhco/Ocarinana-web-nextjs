-- 只读后台管理 Dashboard 支持。
-- 管理员名单放在私有表中，避免复用公开可读的 app_config。
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_active
  ON public.admin_users(active);

CREATE OR REPLACE FUNCTION public.set_admin_users_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_users_updated_at();

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 不向浏览器角色开放管理员名单；服务端使用 service_role 完成权限判断。
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users TO service_role;

COMMENT ON TABLE public.admin_users IS '后台管理员私有白名单，支持通过数据库记录热更新只读后台访问权限。';

-- 后台首页汇总指标。只返回聚合数字，不返回支付回调 payload 等敏感明细。
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_summary()
RETURNS TABLE (
  total_users BIGINT,
  new_users_7d BIGINT,
  total_scores BIGINT,
  public_scores BIGINT,
  private_scores BIGINT,
  active_subscriptions BIGINT,
  pending_orders BIGINT,
  paid_orders BIGINT,
  failed_orders BIGINT,
  closed_orders BIGINT,
  paid_amount_cents BIGINT,
  paid_orders_7d BIGINT
) AS $$
  SELECT
    (SELECT COUNT(*) FROM auth.users) AS total_users,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
    (SELECT COUNT(*) FROM public.scores) AS total_scores,
    (SELECT COUNT(*) FROM public.scores WHERE is_public = true) AS public_scores,
    (SELECT COUNT(*) FROM public.scores WHERE is_public = false) AS private_scores,
    (
      SELECT COUNT(*)
      FROM public.subscriptions
      WHERE status = 'active'
        AND current_period_end > NOW()
    ) AS active_subscriptions,
    (SELECT COUNT(*) FROM public.billing_orders WHERE status = 'pending') AS pending_orders,
    (SELECT COUNT(*) FROM public.billing_orders WHERE status = 'paid') AS paid_orders,
    (SELECT COUNT(*) FROM public.billing_orders WHERE status = 'failed') AS failed_orders,
    (SELECT COUNT(*) FROM public.billing_orders WHERE status = 'closed') AS closed_orders,
    COALESCE((SELECT SUM(amount_cents) FROM public.billing_orders WHERE status = 'paid'), 0) AS paid_amount_cents,
    (
      SELECT COUNT(*)
      FROM public.billing_orders
      WHERE status = 'paid'
        AND paid_at >= NOW() - INTERVAL '7 days'
    ) AS paid_orders_7d;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_summary() TO service_role;

COMMENT ON FUNCTION public.get_admin_dashboard_summary()
  IS '后台只读 Dashboard 汇总指标函数，仅允许 service_role 在服务端调用。';

ANALYZE public.admin_users;
