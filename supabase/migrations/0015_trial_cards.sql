-- =============================================================
-- Plus 体验卡
--
-- 管理员生成一个可多人领取的兑换码，用户兑换后获得指定天数的 Plus 体验。
-- 实际权益仍写入 subscriptions，体验卡表只保存营销码和兑换流水。
-- =============================================================

CREATE TABLE IF NOT EXISTS public.trial_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  max_redemptions INTEGER NOT NULL CHECK (max_redemptions > 0),
  claimed_count INTEGER NOT NULL DEFAULT 0 CHECK (claimed_count >= 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (claimed_count <= max_redemptions)
);

CREATE TABLE IF NOT EXISTS public.trial_card_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_card_id UUID NOT NULL REFERENCES public.trial_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (trial_card_id, user_id),
  CHECK (period_end > period_start)
);

CREATE INDEX IF NOT EXISTS idx_trial_cards_active_expires
  ON public.trial_cards(active, expires_at);

CREATE INDEX IF NOT EXISTS idx_trial_card_redemptions_user_created
  ON public.trial_card_redemptions(user_id, redeemed_at DESC);

DROP TRIGGER IF EXISTS trg_trial_cards_updated_at ON public.trial_cards;
CREATE TRIGGER trg_trial_cards_updated_at
  BEFORE UPDATE ON public.trial_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

ALTER TABLE public.trial_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_card_redemptions ENABLE ROW LEVEL SECURITY;

-- 体验卡配置和领取流水不直接开放浏览器角色写入，后台和兑换动作统一走服务端。
REVOKE ALL ON TABLE public.trial_cards FROM anon, authenticated;
REVOKE ALL ON TABLE public.trial_card_redemptions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trial_cards TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trial_card_redemptions TO service_role;

CREATE OR REPLACE FUNCTION public.redeem_trial_card(
  p_code TEXT,
  p_user_id UUID
) RETURNS TABLE (
  redeemed BOOLEAN,
  reason TEXT,
  trial_card_id UUID,
  duration_days INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  remaining_redemptions INTEGER
) AS $$
DECLARE
  v_code TEXT;
  v_card public.trial_cards%ROWTYPE;
  v_existing_redemption public.trial_card_redemptions%ROWTYPE;
  v_subscription public.subscriptions%ROWTYPE;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  v_code := LOWER(TRIM(p_code));

  SELECT *
  INTO v_card
  FROM public.trial_cards card
  WHERE card.code = v_code
  FOR UPDATE;

  IF NOT FOUND THEN
    redeemed := false;
    reason := 'not_found';
    RETURN NEXT;
    RETURN;
  END IF;

  trial_card_id := v_card.id;
  duration_days := v_card.duration_days;
  remaining_redemptions := GREATEST(v_card.max_redemptions - v_card.claimed_count, 0);

  IF v_card.active = false THEN
    redeemed := false;
    reason := 'inactive';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_card.expires_at <= NOW() THEN
    redeemed := false;
    reason := 'expired';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_card.claimed_count >= v_card.max_redemptions THEN
    redeemed := false;
    reason := 'fully_claimed';
    remaining_redemptions := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT *
  INTO v_existing_redemption
  FROM public.trial_card_redemptions redemption
  WHERE redemption.trial_card_id = v_card.id
    AND redemption.user_id = p_user_id
  FOR UPDATE;

  IF FOUND THEN
    redeemed := false;
    reason := 'already_redeemed';
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT *
  INTO v_subscription
  FROM public.subscriptions subscription
  WHERE subscription.user_id = p_user_id
  FOR UPDATE;

  v_period_start := GREATEST(NOW(), COALESCE(v_subscription.current_period_end, NOW()));
  v_period_end := v_period_start + make_interval(days => v_card.duration_days);

  INSERT INTO public.trial_card_redemptions (
    trial_card_id,
    user_id,
    duration_days,
    period_start,
    period_end,
    redeemed_at
  )
  VALUES (
    v_card.id,
    p_user_id,
    v_card.duration_days,
    v_period_start,
    v_period_end,
    NOW()
  );

  UPDATE public.trial_cards
  SET claimed_count = claimed_count + 1
  WHERE id = v_card.id;

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
    'plus_trial_card',
    'active',
    v_period_start,
    v_period_end,
    NULL
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    plan_id = 'plus_trial_card',
    status = 'active',
    current_period_start = CASE
      WHEN public.subscriptions.current_period_end > NOW()
        THEN public.subscriptions.current_period_start
      ELSE EXCLUDED.current_period_start
    END,
    current_period_end = EXCLUDED.current_period_end,
    latest_order_id = NULL;

  redeemed := true;
  reason := 'redeemed';
  period_start := v_period_start;
  period_end := v_period_end;
  remaining_redemptions := GREATEST(v_card.max_redemptions - v_card.claimed_count - 1, 0);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.redeem_trial_card(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_trial_card(TEXT, UUID) TO service_role;

COMMENT ON TABLE public.trial_cards IS '后台生成的 Plus 体验卡营销码配置。';
COMMENT ON TABLE public.trial_card_redemptions IS '记录用户兑换体验卡后获得 Plus 体验时长的流水。';
COMMENT ON FUNCTION public.redeem_trial_card(TEXT, UUID)
  IS '在事务中兑换体验卡、扣减名额并顺延用户 Plus 当前权益。';

ANALYZE public.trial_cards;
ANALYZE public.trial_card_redemptions;
