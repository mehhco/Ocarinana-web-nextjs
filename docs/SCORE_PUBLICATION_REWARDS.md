# 公开乐谱 Plus 奖励说明

## 规则

- 仅在 `billing_enabled=true` 且用户已登录时生效。
- 公开乐谱本身不设数量上限；奖励只决定是否发放 Plus 体验时长。
- 用户首次公开一首符合基础质量规则的乐谱，可获得 1 天 Plus 体验。
- 同一首乐谱终身最多奖励一次，取消公开后再次公开不重复奖励。
- 每个用户每自然月最多获得 7 天奖励。
- 奖励自动发放，后续发现滥用可通过数据库标记撤销或封禁奖励资格。

## 基础质量检查

系统会在公开时做轻量检查：

- 标题不能是“未命名简谱”“测试”等默认或明显测试标题。
- 标题不能过短、全重复字符或包含垃圾链接。
- 乐谱内容至少需要 8 个有效音乐元素。
- 空白乐谱、过短乐谱、明显测试内容可以公开，但不会发放 Plus 奖励。

## 常用查询

查看最近奖励：

```sql
SELECT user_id, score_id, reward_days, reward_month, status,
       quality_result, granted_at, revoked_at, revoke_reason
FROM public.score_publication_rewards
ORDER BY created_at DESC
LIMIT 30;
```

查看某个用户本月奖励：

```sql
SELECT COALESCE(SUM(reward_days), 0) AS granted_days
FROM public.score_publication_rewards
WHERE user_id = 'USER_UUID_HERE'
  AND reward_month = date_trunc('month', NOW())::date
  AND status = 'granted';
```

临时禁止某个用户继续获得公开奖励：

```sql
INSERT INTO public.score_publication_reward_blocks (user_id, blocked_until, reason)
VALUES ('USER_UUID_HERE', NOW() + INTERVAL '30 days', '公开低质量或重复乐谱')
ON CONFLICT (user_id)
DO UPDATE SET blocked_until = EXCLUDED.blocked_until,
              reason = EXCLUDED.reason,
              updated_at = NOW();
```

撤销某条奖励记录：

```sql
SELECT public.revoke_score_publication_reward(
  'REWARD_UUID_HERE',
  '人工复核：公开内容质量不足'
);
```

## 测试流程

1. 用已登录账号创建一首标题正常、内容不少于 8 个有效音乐元素的乐谱。
2. 公开到乐谱广场。
3. 检查 `score_publication_rewards.status = 'granted'`。
4. 检查 `subscriptions.current_period_end` 增加 1 天。
5. 再次取消公开并重新公开同一首乐谱，确认不重复奖励。
6. 连续公开第 8 首合格乐谱，确认公开成功但不再发放奖励。
