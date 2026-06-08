# 后台管理 Dashboard

后台页面位于 `/protected/admin`，用于只读查看用户、乐谱、Plus 会员、订单和支付汇总数据。

## 权限配置

管理员名单存放在私有表 `public.admin_users`，只允许服务端通过 `SUPABASE_SERVICE_ROLE_KEY` 读取。变更数据库记录后，下次请求即生效，不需要重新部署。

添加或重新启用管理员：

```sql
INSERT INTO public.admin_users (user_id, note)
VALUES ('用户UUID', 'owner')
ON CONFLICT (user_id) DO UPDATE
SET active = true,
    note = EXCLUDED.note;
```

停用管理员：

```sql
UPDATE public.admin_users
SET active = false
WHERE user_id = '用户UUID';
```

## 环境变量

后台读取跨用户数据必须配置：

```env
SUPABASE_SERVICE_ROLE_KEY=
```

该变量只能存在于服务端环境中，不要添加 `NEXT_PUBLIC_` 前缀。

## 访问控制

- 未登录用户访问 `/protected/admin` 会进入登录流程。
- 已登录但不在 `admin_users` 或 `active = false` 的用户会收到 404。
- 管理员用户会在顶部导航看到“后台”入口。

第一版后台严格只读，不提供改会员、改订单、删除用户或修改配置等操作。
