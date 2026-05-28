-- =============================================================
-- 公开乐谱奖励 Plus 体验时长
--
-- 设计目标：
-- 1. 只在付费灰度用户中运行，鼓励用户把优质乐谱分享到乐谱广场。
-- 2. 每首乐谱终身最多奖励一次，取消公开后再次公开不重复奖励。
-- 3. 每个用户每自然月最多获得 7 天奖励，防止刷取长期 Plus。
-- 4. 自动发放、后续可人工复核撤销；撤销只记录风控结果，不倒扣已经消耗的时间。
-- =============================================================

CREATE TABLE IF NOT EXISTS public.score_publication_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_id UUID NOT NULL REFERENCES public.scores(score_id) ON DELETE CASCADE,
  reward_days INTEGER NOT NULL DEFAULT 1 CHECK (reward_days > 0),
  reward_month DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'revoked', 'rejected')),
  quality_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoke_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, score_id)
);

CREATE TABLE IF NOT EXISTS public.score_publication_reward_blocks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_publication_rewards_user_month
  ON public.score_publication_rewards(user_id, reward_month, status);

CREATE INDEX IF NOT EXISTS idx_score_publication_rewards_score
  ON public.score_publication_rewards(score_id);

DROP TRIGGER IF EXISTS trg_score_publication_rewards_updated_at ON public.score_publication_rewards;
CREATE TRIGGER trg_score_publication_rewards_updated_at
  BEFORE UPDATE ON public.score_publication_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

DROP TRIGGER IF EXISTS trg_score_publication_reward_blocks_updated_at ON public.score_publication_reward_blocks;
CREATE TRIGGER trg_score_publication_reward_blocks_updated_at
  BEFORE UPDATE ON public.score_publication_reward_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

ALTER TABLE public.score_publication_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_publication_reward_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own score publication rewards" ON public.score_publication_rewards;
CREATE POLICY "Users can read own score publication rewards"
  ON public.score_publication_rewards FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own score publication reward blocks" ON public.score_publication_reward_blocks;
CREATE POLICY "Users can read own score publication reward blocks"
  ON public.score_publication_reward_blocks FOR SELECT
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.grant_score_publication_reward(
  p_user_id UUID,
  p_score_id UUID,
  p_reward_days INTEGER,
  p_reward_month DATE,
  p_quality_result JSONB
) RETURNS TABLE (
  reward_id UUID,
  granted BOOLEAN,
  reason TEXT,
  monthly_used_days INTEGER,
  period_end TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_existing_reward public.score_publication_rewards%ROWTYPE;
  v_block public.score_publication_reward_blocks%ROWTYPE;
  v_monthly_used INTEGER;
  v_subscription public.subscriptions%ROWTYPE;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT *
  INTO v_block
  FROM public.score_publication_reward_blocks
  WHERE user_id = p_user_id
    AND blocked_until > NOW();

  IF FOUND THEN
    granted := false;
    reason := 'reward_blocked';
    monthly_used_days := 0;
    period_end := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT *
  INTO v_existing_reward
  FROM public.score_publication_rewards
  WHERE user_id = p_user_id
    AND score_id = p_score_id
  FOR UPDATE;

  IF FOUND THEN
    reward_id := v_existing_reward.id;
    granted := false;
    reason := 'already_rewarded';
    monthly_used_days := 0;
    period_end := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  -- 同一用户同一月份的奖励额度需要串行计算，避免并发公开多首乐谱时突破 7 天上限。
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_reward_month::text));

  SELECT COALESCE(SUM(reward_days), 0)
  INTO v_monthly_used
  FROM public.score_publication_rewards
  WHERE user_id = p_user_id
    AND reward_month = p_reward_month
    AND status = 'granted';

  IF v_monthly_used + p_reward_days > 7 THEN
    INSERT INTO public.score_publication_rewards (
      user_id,
      score_id,
      reward_days,
      reward_month,
      status,
      quality_result
    )
    VALUES (
      p_user_id,
      p_score_id,
      p_reward_days,
      p_reward_month,
      'rejected',
      p_quality_result || jsonb_build_object('reason', 'monthly_cap_reached')
    )
    RETURNING id INTO reward_id;

    granted := false;
    reason := 'monthly_cap_reached';
    monthly_used_days := v_monthly_used;
    period_end := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT *
  INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_period_start := GREATEST(NOW(), COALESCE(v_subscription.current_period_end, NOW()));
  v_period_end := v_period_start + make_interval(days => p_reward_days);

  INSERT INTO public.score_publication_rewards (
    user_id,
    score_id,
    reward_days,
    reward_month,
    status,
    quality_result,
    granted_at
  )
  VALUES (
    p_user_id,
    p_score_id,
    p_reward_days,
    p_reward_month,
    'granted',
    p_quality_result,
    NOW()
  )
  RETURNING id INTO reward_id;

  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    latest_order_id
  )
  VALUES (
    p_user_id,
    'plus_publication_reward',
    'active',
    v_period_start,
    v_period_end,
    NULL
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    plan_id = CASE
      WHEN public.subscriptions.plan_id LIKE 'plus_%'
        THEN public.subscriptions.plan_id
      ELSE 'plus_publication_reward'
    END,
    status = 'active',
    current_period_start = CASE
      WHEN public.subscriptions.current_period_end > NOW()
        THEN public.subscriptions.current_period_start
      ELSE EXCLUDED.current_period_start
    END,
    current_period_end = EXCLUDED.current_period_end;

  granted := true;
  reason := 'granted';
  monthly_used_days := v_monthly_used + p_reward_days;
  period_end := v_period_end;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.revoke_score_publication_reward(
  p_reward_id UUID,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.score_publication_rewards
  SET
    status = 'revoked',
    revoked_at = NOW(),
    revoke_reason = p_reason
  WHERE id = p_reward_id
    AND status = 'granted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.grant_score_publication_reward(UUID, UUID, INTEGER, DATE, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_score_publication_reward(UUID, UUID, INTEGER, DATE, JSONB) TO service_role;

REVOKE ALL ON FUNCTION public.revoke_score_publication_reward(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_score_publication_reward(UUID, TEXT) TO service_role;

COMMENT ON TABLE public.score_publication_rewards IS '记录公开乐谱后发放 Plus 体验时长的奖励事件。';
COMMENT ON TABLE public.score_publication_reward_blocks IS '记录被人工风控限制领取公开乐谱奖励的用户。';
COMMENT ON FUNCTION public.grant_score_publication_reward(UUID, UUID, INTEGER, DATE, JSONB)
  IS '在事务中为合格公开乐谱发放 Plus 体验时长，并执行每月 7 天上限和单乐谱唯一奖励约束。';

ANALYZE public.score_publication_rewards;
ANALYZE public.score_publication_reward_blocks;
