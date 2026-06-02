# ZPAY 收款正式运行

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

执行 Supabase 迁移 `0006_billing_gray_test.sql`、`0007_billing_usage_and_plus_plans.sql`、`0008_score_publication_rewards.sql` 和 `0012_enable_billing_formal_launch.sql` 后，`billing_enabled` 会设置为开启。

正式开启：

```sql
UPDATE public.app_config
SET value = '{"enabled": true}'::jsonb,
    description = 'Plus 订阅正式收费总开关',
    updated_at = NOW()
WHERE key = 'billing_enabled';
```

`billing_testers` 保留为历史灰度记录和内部标记，不再作为购买、创建订单或公开奖励的准入条件。

紧急关闭购买入口：

```sql
UPDATE public.app_config
SET value = '{"enabled": false}'::jsonb,
    updated_at = NOW()
WHERE key = 'billing_enabled';
```

关闭后不能创建新订单，也不会发放新的公开奖励；已经发起的订单仍会接受 ZPAY 异步通知并完成入账。

## 链路验证

1. 用任意已登录账号访问 `/protected/me/plus`。
2. 分别创建 Plus 月卡、季卡、年卡订单。
3. 当前前台只开放支付宝支付；Plus 只影响保存空间、导出次数和无水印等会员能力。
4. 支付完成后返回页应先显示确认中，再由 `/api/billing/zpay/notify` 更新为已支付。
5. 核对 `billing_orders`、`subscriptions`、`billing_events` 三张表。
6. 重放同一笔有效 notify，应只记录重复成功，不重复延长权益。

## 公开乐谱奖励

公开乐谱本身是基础能力，不按游客、普通用户或 Plus 用户设置数量上限。正式运行期间，登录用户公开优质乐谱可以获得 Plus 体验时长。
具体规则和排查 SQL 见 `docs/SCORE_PUBLICATION_REWARDS.md`。
