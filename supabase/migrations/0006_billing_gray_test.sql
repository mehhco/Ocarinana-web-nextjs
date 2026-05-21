-- =============================================================
-- ZPAY 收款内部灰度测试数据结构
--
-- 设计目标：
-- 1. 先验证完整收款链路，不在本迁移中定义正式会员权益。
-- 2. 只允许被加入 billing_testers 的内部用户看到和使用订阅入口。
-- 3. ZPAY 只作为一次性收款通道；“订阅/会员有效期”由本项目自己维护。
-- 4. 以 ZPAY notify_url 异步通知作为唯一入账依据，return_url 只做状态展示。
-- 5. 保存订单、当前权益和回调审计日志，方便灰度期间排查和人工对账。
-- 6. 回调入账使用数据库函数加行锁，保证重复通知和并发通知不会重复延长期限。
-- =============================================================

-- -------------------------------------------------------------
-- 灰度用户表
--
-- 只要用户在此表中且 active = true，同时 app_config.billing_enabled = true，
-- 前端才展示订阅入口，后端才允许创建支付订单。
--
-- 该表不承担管理员体系，只是内部灰度名单。初期通过 Supabase Dashboard
-- 或 SQL Editor 手动维护，避免过早建设后台管理功能。
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_testers (
  -- 直接使用 auth.users(id) 作为主键，确保一个用户只有一条灰度记录。
  -- 用户删除时自动清理灰度记录，避免孤儿数据。
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- false 表示保留记录但临时关闭该用户测试权限，便于灰度回收。
  active BOOLEAN NOT NULL DEFAULT true,
  -- 内部备注，例如“创始人账号”“支付链路测试账号”，不对用户展示。
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 支付订单表
--
-- 每一次点击支付都会创建一笔订单。订单保存套餐快照和金额快照，
-- 回调时必须用这里的金额校验 ZPAY 返回的 money，不能信任前端传入价格。
--
-- 状态流转：
-- pending -> paid   : ZPAY 异步通知验签、验金额、验订单后入账。
-- pending -> failed : 预留给后续主动关单/人工标记，当前代码暂不使用。
-- pending -> closed : 预留给订单过期或人工关闭，当前代码暂不使用。
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_orders (
  -- 内部订单 ID，用于页面路由和表关联。
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 传给 ZPAY 的商户订单号。ZPAY 文档对 out_trade_no 有长度要求，
  -- 这里限制不超过 32 字符，并加 UNIQUE 防止订单号碰撞。
  out_trade_no TEXT UNIQUE NOT NULL CHECK (char_length(out_trade_no) <= 32),
  -- 付款用户。用户删除时删除其订单；灰度测试阶段不做财务长期留存。
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 套餐快照。即使未来套餐改名/改价，历史订单仍保留当时信息。
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  -- 金额使用“分”存储，避免浮点误差。展示或提交 ZPAY 时再格式化为元。
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'CNY',
  -- 本次付款应增加的权益天数。初期是 30 天，未来可扩展不同周期。
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  -- 预留支付服务商字段。当前只允许 zpay，后续若接入其他通道可扩展。
  payment_provider TEXT NOT NULL DEFAULT 'zpay' CHECK (payment_provider IN ('zpay')),
  -- ZPAY 支付方式，目前只开放支付宝和微信。
  payment_type TEXT NOT NULL CHECK (payment_type IN ('alipay', 'wxpay')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'closed')),
  -- ZPAY 平台交易号，用于在 ZPAY 后台对账。
  zpay_trade_no TEXT,
  -- 传给 ZPAY 的 param 扩展字段。当前使用订单号或短标识，不放敏感信息。
  zpay_param TEXT,
  -- 保存原始回调参数，便于排查签名、金额、状态等问题。
  zpay_raw_notify JSONB,
  -- 本笔订单实际开通的权益区间。只有 paid 订单才会写入。
  subscription_period_start TIMESTAMP WITH TIME ZONE,
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  -- ZPAY notify 验证通过并成功入账的时间。
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 当前订阅权益表
--
-- 该表只保存每个用户“当前有效权益”的聚合状态，而不是历史流水。
-- 历史流水在 billing_orders 中；当前访问控制应优先查 subscriptions。
--
-- 一个用户最多一条订阅记录。重复购买时更新同一行，并延长 current_period_end。
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 一个用户只有一个当前权益记录。
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  -- active 表示当前权益可用；expired/canceled 预留给后续定时任务或人工处理。
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
  -- 当前权益周期。判断是否可用时还需要比较 current_period_end > NOW()。
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  -- 最近一次导致权益变化的订单。订单删除时保留订阅记录但清空引用。
  latest_order_id UUID REFERENCES public.billing_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- 防止写入无效时间段。
  CHECK (current_period_end > current_period_start)
);

-- -------------------------------------------------------------
-- 支付回调事件表
--
-- 每一次 ZPAY notify 都记录在这里，包括签名失败、金额不匹配、
-- 订单不存在、重复通知和成功入账。灰度期间排查问题主要看这张表。
--
-- 注意：该表是审计日志，不作为权益判断依据。
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 如果能匹配到订单，则记录订单 ID；匹配不到时仍保存 out_trade_no 和 payload。
  order_id UUID REFERENCES public.billing_orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'zpay',
  -- 当前只记录异步通知；后续如果加主动查单，可新增 query/reconcile。
  event_type TEXT NOT NULL DEFAULT 'notify',
  out_trade_no TEXT,
  zpay_trade_no TEXT,
  -- 原始回调参数。不要在回调参数中放用户隐私或密钥。
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- 服务端根据 ZPAY 文档签名规则计算后的验签结果。
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  -- received/rejected/error/success/duplicate_success 等处理结果。
  processing_result TEXT NOT NULL DEFAULT 'received',
  -- 拒绝或异常时的可读原因，用于人工排查。
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 查询索引
-- -------------------------------------------------------------

-- 快速判断灰度名单中是否存在 active 用户。
CREATE INDEX IF NOT EXISTS idx_billing_testers_active ON public.billing_testers(active);

-- 用户订阅页读取最近订单时使用。
CREATE INDEX IF NOT EXISTS idx_billing_orders_user_created ON public.billing_orders(user_id, created_at DESC);

-- 后续后台筛选 pending/paid/failed 订单时使用。
CREATE INDEX IF NOT EXISTS idx_billing_orders_status ON public.billing_orders(status);

-- 按 ZPAY 平台交易号对账时使用。
CREATE INDEX IF NOT EXISTS idx_billing_orders_zpay_trade_no ON public.billing_orders(zpay_trade_no);

-- 判断用户当前权益状态时使用。
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- 查看某订单的回调记录时使用。
CREATE INDEX IF NOT EXISTS idx_billing_events_order_created ON public.billing_events(order_id, created_at DESC);

-- 回调无法匹配订单或人工排查订单号时使用。
CREATE INDEX IF NOT EXISTS idx_billing_events_out_trade_no ON public.billing_events(out_trade_no);

-- -------------------------------------------------------------
-- updated_at 自动更新时间
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_billing_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_billing_testers_updated_at ON public.billing_testers;
CREATE TRIGGER trg_billing_testers_updated_at
  BEFORE UPDATE ON public.billing_testers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

DROP TRIGGER IF EXISTS trg_billing_orders_updated_at ON public.billing_orders;
CREATE TRIGGER trg_billing_orders_updated_at
  BEFORE UPDATE ON public.billing_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_billing_updated_at();

ALTER TABLE public.billing_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- RLS 策略
--
-- 原则：
-- 1. 用户只能读取自己的灰度状态、订单和订阅。
-- 2. 用户不能直接写入订单、订阅或事件；写入必须走服务端接口。
-- 3. billing_events 不开放用户读取，避免暴露支付回调 payload。
-- 4. notify 回调由服务端使用 service role 写入，绕过 RLS。
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Billing testers can read own status" ON public.billing_testers;
CREATE POLICY "Billing testers can read own status"
  ON public.billing_testers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own billing orders" ON public.billing_orders;
CREATE POLICY "Users can read own billing orders"
  ON public.billing_orders FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- -------------------------------------------------------------
-- ZPAY 入账函数
--
-- 该函数只做“已经通过服务端验签和业务校验后的入账动作”：
-- - 不负责验 ZPAY 签名；
-- - 不负责校验 pid、money、trade_status、payment_type；
-- - 这些校验在 app/api/billing/zpay/notify/route.ts 中完成。
--
-- 为什么放在数据库函数中：
-- - 使用 SELECT ... FOR UPDATE 锁住订单行，防止并发回调重复处理。
-- - 使用 SELECT ... FOR UPDATE 锁住订阅行，防止并发购买导致权益覆盖错误。
-- - 将订单更新和订阅更新放在同一个事务上下文中。
--
-- 返回值：
-- - already_paid = true 表示重复通知，调用方仍应向 ZPAY 返回 success。
-- - period_end 返回最终权益截止时间，便于日志或调试。
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_zpay_billing_payment(
  p_out_trade_no TEXT,
  p_trade_no TEXT,
  p_payload JSONB
) RETURNS TABLE (
  order_id UUID,
  subscription_id UUID,
  already_paid BOOLEAN,
  period_end TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_order public.billing_orders%ROWTYPE;
  v_existing_subscription public.subscriptions%ROWTYPE;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 锁定订单行。若同一笔 ZPAY notify 被重复或并发发送，
  -- 后到的事务会等待先到事务完成，再读取最新 status。
  SELECT *
  INTO v_order
  FROM public.billing_orders
  WHERE out_trade_no = p_out_trade_no
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Billing order not found: %', p_out_trade_no
      USING ERRCODE = 'P0002';
  END IF;

  -- 幂等处理：订单已经 paid 时，不再更新订阅、不再延长有效期。
  -- ZPAY 文档要求重复通知也返回 success；调用方可据此记录 duplicate_success。
  IF v_order.status = 'paid' THEN
    SELECT *
    INTO v_existing_subscription
    FROM public.subscriptions
    WHERE user_id = v_order.user_id;

    order_id := v_order.id;
    subscription_id := v_existing_subscription.id;
    already_paid := true;
    period_end := COALESCE(v_order.subscription_period_end, v_existing_subscription.current_period_end);
    RETURN NEXT;
    RETURN;
  END IF;

  -- 只有 pending 订单允许入账。failed/closed 说明订单已被关闭或异常处理，
  -- 此时继续入账可能破坏人工处理结果，所以直接报错。
  IF v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'Billing order is not payable: %', v_order.status
      USING ERRCODE = 'P0001';
  END IF;

  -- 锁定当前用户的订阅行。若用户短时间内支付多笔订单，
  -- 每笔订单会基于前一笔处理后的 current_period_end 顺序延长。
  SELECT *
  INTO v_existing_subscription
  FROM public.subscriptions
  WHERE user_id = v_order.user_id
  FOR UPDATE;

  -- 如果用户已有未过期权益，则从原截止时间继续延长；
  -- 如果没有权益或权益已过期，则从当前时间开始计算。
  v_period_start := GREATEST(NOW(), COALESCE(v_existing_subscription.current_period_end, NOW()));
  v_period_end := v_period_start + make_interval(days => v_order.duration_days);

  -- 先把订单标记为 paid，并保存 ZPAY 交易号、原始回调和本订单对应的权益区间。
  UPDATE public.billing_orders
  SET
    status = 'paid',
    zpay_trade_no = p_trade_no,
    zpay_raw_notify = p_payload,
    paid_at = NOW(),
    subscription_period_start = v_period_start,
    subscription_period_end = v_period_end
  WHERE id = v_order.id;

  -- 创建或更新当前权益。
  --
  -- 对已有未过期权益：
  -- - current_period_start 保持原值，表示连续权益从第一次有效期开始。
  -- - current_period_end 更新为延长后的截止时间。
  --
  -- 对无权益或已过期权益：
  -- - current_period_start 使用本次订单的新开始时间。
  -- - current_period_end 使用本次订单的新截止时间。
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    latest_order_id
  )
  VALUES (
    v_order.user_id,
    v_order.plan_id,
    'active',
    v_period_start,
    v_period_end,
    v_order.id
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    plan_id = EXCLUDED.plan_id,
    status = 'active',
    current_period_start = CASE
      WHEN public.subscriptions.current_period_end > NOW()
        THEN public.subscriptions.current_period_start
      ELSE EXCLUDED.current_period_start
    END,
    current_period_end = EXCLUDED.current_period_end,
    latest_order_id = EXCLUDED.latest_order_id
  RETURNING id INTO subscription_id;

  order_id := v_order.id;
  already_paid := false;
  period_end := v_period_end;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 该函数使用 SECURITY DEFINER，因为回调处理需要更新受 RLS 保护的订单和订阅。
-- 但不能开放给普通 authenticated/anon 用户调用，只授权给 service_role。
REVOKE ALL ON FUNCTION public.apply_zpay_billing_payment(TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_zpay_billing_payment(TEXT, TEXT, JSONB) TO service_role;

-- -------------------------------------------------------------
-- 全局灰度开关
--
-- 默认关闭，避免迁移上线后自动暴露订阅入口。
-- 开启方式见 docs/BILLING_GRAY_TEST.md。
-- -------------------------------------------------------------
INSERT INTO public.app_config (key, value, description)
VALUES (
  'billing_enabled',
  '{"enabled": false}'::jsonb,
  '订阅收款内部灰度开关'
)
ON CONFLICT (key) DO NOTHING;

-- 更新 PostgreSQL 统计信息，帮助查询规划器在迁移后选择更合理的执行计划。
ANALYZE public.billing_testers;
ANALYZE public.billing_orders;
ANALYZE public.subscriptions;
ANALYZE public.billing_events;
