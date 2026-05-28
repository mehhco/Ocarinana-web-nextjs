# ZPAY 收款内部灰度测试

## 环境变量

在部署环境配置：

```env
ZPAY_PID=
ZPAY_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BILLING_PLAN_AMOUNT_CENTS_JSON={"plus_monthly":990,"plus_quarterly":2500,"plus_yearly":8800}
```

`ZPAY_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY` 只能放在服务端环境变量中，不要添加 `NEXT_PUBLIC_` 前缀。

## 数据库初始化

执行 Supabase 迁移 `0006_billing_gray_test.sql` 和 `0007_billing_usage_and_plus_plans.sql` 后，默认 `billing_enabled` 为关闭。

开启灰度：

```sql
UPDATE public.app_config
SET value = '{"enabled": true}'::jsonb,
    updated_at = NOW()
WHERE key = 'billing_enabled';
```

添加灰度用户：

```sql
INSERT INTO public.billing_testers (user_id, active, note)
VALUES ('USER_UUID_HERE', true, 'internal billing tester')
ON CONFLICT (user_id)
DO UPDATE SET active = EXCLUDED.active,
              note = EXCLUDED.note,
              updated_at = NOW();
```

关闭灰度入口：

```sql
UPDATE public.app_config
SET value = '{"enabled": false}'::jsonb,
    updated_at = NOW()
WHERE key = 'billing_enabled';
```

关闭后不能创建新订单，但已经发起的订单仍会接受 ZPAY 异步通知并完成入账。

## 链路验证

1. 用已加入 `billing_testers` 的灰度账号访问 `/protected/billing`。
2. 分别创建 Plus 月卡、季卡、年卡订单。
3. 当前前台只开放支付宝支付，非灰度用户不会看到会员入口，也不会受到 Plus 免费额度限制影响。
4. 支付完成后返回页应先显示确认中，再由 `/api/billing/zpay/notify` 更新为已支付。
5. 核对 `billing_orders`、`subscriptions`、`billing_events` 三张表。
6. 重放同一笔有效 notify，应只记录重复成功，不重复延长权益。

## 公开乐谱奖励

正式 Plus 灰度期间，灰度用户公开优质乐谱可以获得 Plus 体验时长。
具体规则和排查 SQL 见 `docs/SCORE_PUBLICATION_REWARDS.md`。
