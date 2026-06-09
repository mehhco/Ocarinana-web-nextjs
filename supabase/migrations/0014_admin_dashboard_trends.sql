-- 后台趋势图数据。按天聚合最近一段时间的注册、乐谱、公开和支付数据。
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_daily_trends(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  trend_date DATE,
  new_users BIGINT,
  new_scores BIGINT,
  published_scores BIGINT,
  paid_orders BIGINT,
  paid_amount_cents BIGINT
) AS $$
  WITH bounds AS (
    SELECT GREATEST(LEAST(p_days, 90), 7) AS days
  ),
  days AS (
    SELECT generate_series(
      (CURRENT_DATE - ((SELECT days FROM bounds) - 1)),
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS trend_date
  )
  SELECT
    days.trend_date,
    COALESCE(users_by_day.new_users, 0) AS new_users,
    COALESCE(scores_by_day.new_scores, 0) AS new_scores,
    COALESCE(published_by_day.published_scores, 0) AS published_scores,
    COALESCE(orders_by_day.paid_orders, 0) AS paid_orders,
    COALESCE(orders_by_day.paid_amount_cents, 0) AS paid_amount_cents
  FROM days
  LEFT JOIN (
    SELECT created_at::date AS trend_date, COUNT(*) AS new_users
    FROM auth.users
    WHERE created_at::date >= (CURRENT_DATE - ((SELECT days FROM bounds) - 1))
    GROUP BY created_at::date
  ) users_by_day USING (trend_date)
  LEFT JOIN (
    SELECT created_at::date AS trend_date, COUNT(*) AS new_scores
    FROM public.scores
    WHERE created_at::date >= (CURRENT_DATE - ((SELECT days FROM bounds) - 1))
    GROUP BY created_at::date
  ) scores_by_day USING (trend_date)
  LEFT JOIN (
    SELECT published_at::date AS trend_date, COUNT(*) AS published_scores
    FROM public.scores
    WHERE published_at IS NOT NULL
      AND published_at::date >= (CURRENT_DATE - ((SELECT days FROM bounds) - 1))
    GROUP BY published_at::date
  ) published_by_day USING (trend_date)
  LEFT JOIN (
    SELECT
      paid_at::date AS trend_date,
      COUNT(*) AS paid_orders,
      COALESCE(SUM(amount_cents), 0) AS paid_amount_cents
    FROM public.billing_orders
    WHERE status = 'paid'
      AND paid_at IS NOT NULL
      AND paid_at::date >= (CURRENT_DATE - ((SELECT days FROM bounds) - 1))
    GROUP BY paid_at::date
  ) orders_by_day USING (trend_date)
  ORDER BY days.trend_date;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_daily_trends(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_daily_trends(INTEGER) TO service_role;

COMMENT ON FUNCTION public.get_admin_dashboard_daily_trends(INTEGER)
  IS '后台只读 Dashboard 趋势图日聚合数据函数，仅允许 service_role 在服务端调用。';
