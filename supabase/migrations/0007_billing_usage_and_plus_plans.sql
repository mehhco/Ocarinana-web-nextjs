-- =============================================================
-- 正式 Plus 订阅支持
--
-- 本迁移继续复用 0006 中已经创建好的 ZPAY 订单表和订阅表，
-- 只新增“登录用户每日使用量”记录能力。
--
-- 当前支付模式仍是一次性付款：
-- 1. 用户购买月卡、季卡或年卡。
-- 2. ZPAY 异步通知验签成功后，应用延长 subscriptions.current_period_end。
-- 3. 不做自动续费或代扣。
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  export_count INTEGER NOT NULL DEFAULT 0 CHECK (export_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_usage_user_date
  ON public.user_daily_usage(user_id, usage_date DESC);

DROP TRIGGER IF EXISTS trg_user_daily_usage_updated_at ON public.user_daily_usage;
CREATE TRIGGER trg_user_daily_usage_updated_at
  BEFORE UPDATE ON public.user_daily_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

ALTER TABLE public.user_daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own daily usage" ON public.user_daily_usage;
CREATE POLICY "Users can read own daily usage"
  ON public.user_daily_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.increment_user_daily_export_usage(
  p_user_id UUID,
  p_usage_date DATE,
  p_limit INTEGER
) RETURNS TABLE (
  allowed BOOLEAN,
  used_count INTEGER,
  remaining_count INTEGER
) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.user_daily_usage (user_id, usage_date, export_count)
  VALUES (p_user_id, p_usage_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT export_count
  INTO v_count
  FROM public.user_daily_usage
  WHERE user_id = p_user_id
    AND usage_date = p_usage_date
  FOR UPDATE;

  IF v_count >= p_limit THEN
    allowed := false;
    used_count := v_count;
    remaining_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  v_count := v_count + 1;

  UPDATE public.user_daily_usage
  SET export_count = v_count
  WHERE user_id = p_user_id
    AND usage_date = p_usage_date;

  allowed := true;
  used_count := v_count;
  remaining_count := GREATEST(p_limit - v_count, 0);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER) TO service_role;

COMMENT ON TABLE public.user_daily_usage IS '记录登录用户每日使用量，用于执行订阅额度限制。';
COMMENT ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER)
  IS '原子化递增登录用户每日导出次数，并根据传入的每日额度判断是否允许继续导出。';

ANALYZE public.user_daily_usage;
