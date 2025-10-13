# 🚀 Week 4 快速启动指南

**目标：** 48小时内完成支付系统集成  
**今天就开始赚钱！** 💰

---

## ⚡ 5分钟准备工作

### 1. 注册 Stripe 账号（3分钟）
```
1. 访问 https://dashboard.stripe.com/register
2. 使用邮箱注册（建议使用企业邮箱）
3. 跳过"设置您的业务"（稍后完成）
4. 进入测试模式 Dashboard
```

### 2. 获取 API 密钥（2分钟）
```
1. Dashboard → Developers → API keys
2. 复制 Publishable key (pk_test_xxx)
3. 复制 Secret key (sk_test_xxx)
4. 保存到安全的地方（稍后添加到 .env.local）
```

---

## 📦 第一天：Stripe 基础集成（6小时）

### Step 1: 安装依赖（2分钟）
```bash
cd with-supabase-app
npm install @stripe/stripe-js stripe
```

### Step 2: 配置环境变量（3分钟）
在 `.env.local` 添加：
```env
# Stripe 密钥（测试模式）
STRIPE_SECRET_KEY=sk_test_你的密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_你的密钥

# Webhook 密钥（稍后配置）
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Step 3: 创建 Stripe 配置文件（10分钟）

**创建 `lib/stripe.ts`：**
```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// 产品配置（稍后在 Stripe Dashboard 创建后更新）
export const PLANS = {
  free: {
    name: '免费版',
    price: 0,
    priceId: null,
    features: [
      '最多 3 个乐谱',
      '基础编辑功能',
      '导出图片（带水印）',
      '社区支持',
    ],
  },
  pro: {
    name: '专业版',
    price: 29,
    priceId: 'price_xxx', // 替换为实际的 Price ID
    features: [
      '无限乐谱',
      '无水印导出',
      'PDF 导出（即将推出）',
      '优先客服',
      '提前体验新功能',
    ],
  },
};
```

### Step 4: 在 Stripe 创建产品（5分钟）
```
1. Stripe Dashboard → Products → + Add product
2. 产品名称：Ocarinana Pro
3. 描述：陶笛谱生成器专业版
4. 价格：
   - 金额：29 CNY（或 4.99 USD）
   - 计费方式：按月经常性付款
   - 点击 "Save product"
5. 复制 Price ID (price_xxx)
6. 更新 lib/stripe.ts 中的 PLANS.pro.priceId
```

### Step 5: 创建 Checkout API（30分钟）

**创建 `app/api/stripe/create-checkout-session/route.ts`：**
```typescript
import { stripe, PLANS } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { plan } = await req.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: '无效的订阅计划' },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: '此计划不可用' },
        { status: 400 }
      );
    }

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/protected/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: '创建支付会话失败' },
      { status: 500 }
    );
  }
}
```

### Step 6: 创建定价页面（45分钟）

**创建 `app/pricing/page.tsx`：**
```typescript
import { PLANS } from '@/lib/stripe';
import { PricingCard } from '@/components/pricing-card';

export const metadata = {
  title: '价格 - Ocarinana',
  description: '选择适合您的订阅计划',
};

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          选择适合您的计划
        </h1>
        <p className="text-xl text-muted-foreground">
          从免费版开始，随时升级到专业版
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => (
          <PricingCard
            key={key}
            planId={key}
            name={plan.name}
            price={plan.price}
            features={plan.features}
            recommended={key === 'pro'}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">常见问题</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <div>
            <h3 className="font-semibold">可以取消订阅吗？</h3>
            <p className="text-muted-foreground">
              可以随时取消。取消后您仍可使用专业版功能直到当前计费周期结束。
            </p>
          </div>
          <div>
            <h3 className="font-semibold">支持哪些支付方式？</h3>
            <p className="text-muted-foreground">
              支持信用卡、借记卡（通过 Stripe）。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**创建 `components/pricing-card.tsx`：**
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PricingCardProps {
  planId: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export function PricingCard({ planId, name, price, features, recommended }: PricingCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (planId === 'free') {
      router.push('/auth/sign-up');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '创建支付会话失败');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '发生错误');
      setLoading(false);
    }
  };

  return (
    <Card className={recommended ? 'border-primary shadow-lg' : ''}>
      {recommended && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
          推荐
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">¥{price}</span>
          {price > 0 && <span className="text-muted-foreground">/月</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={recommended ? 'default' : 'outline'}
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? '加载中...' : planId === 'free' ? '开始使用' : '订阅'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Step 7: 测试支付流程（30分钟）
```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问定价页面
http://localhost:3000/pricing

# 3. 点击"订阅"按钮

# 4. 使用 Stripe 测试卡号
卡号：4242 4242 4242 4242
过期日期：任意未来日期（如 12/25）
CVC：任意3位数字（如 123）
邮编：任意（如 12345）

# 5. 完成支付，应该跳转到成功页面
```

**✅ 第一天完成！** 您现在有了：
- ✅ Stripe 账号配置
- ✅ 支付 API 端点
- ✅ 定价页面
- ✅ 可以接受测试支付

---

## 📦 第二天：Webhook 和数据库（6小时）

### Step 1: 创建订阅表（15分钟）

**创建 `supabase/migrations/0002_create_subscriptions.sql`：**
```sql
-- 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS 策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为每个新用户创建免费订阅
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_free_subscription();
```

**在 Supabase Dashboard 中运行：**
```
1. 打开 Supabase Dashboard
2. SQL Editor → New Query
3. 粘贴上面的 SQL
4. Run
```

### Step 2: 创建 Webhook 端点（2小时）

**创建 `app/api/stripe/webhook/route.ts`：**
```typescript
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 使用 service role key（可以绕过 RLS）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    throw new Error('Missing metadata');
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    plan_id: plan,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  }, {
    onConflict: 'user_id',
  });

  console.log(`✅ Subscription created for user ${userId}, plan: ${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`✅ Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_id: 'free',
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`✅ Subscription canceled: ${subscription.id}`);
}
```

### Step 3: 配置 Stripe Webhook（15分钟）

**使用 Stripe CLI（推荐）：**
```bash
# 1. 安装 Stripe CLI
# Windows (使用 Scoop):
scoop install stripe

# macOS:
brew install stripe/stripe-cli/stripe

# 2. 登录
stripe login

# 3. 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. 复制 webhook signing secret (whsec_xxx)
# 添加到 .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**或者使用 Stripe Dashboard（生产环境）：**
```
1. Stripe Dashboard → Developers → Webhooks
2. + Add endpoint
3. Endpoint URL: https://your-domain.com/api/stripe/webhook
4. 选择事件：
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
5. Add endpoint
6. 复制 Signing secret
7. 添加到生产环境变量
```

### Step 4: 需要 Service Role Key（5分钟）

在 `.env.local` 添加：
```env
# Supabase Service Role Key（用于 Webhook）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**获取方式：**
```
1. Supabase Dashboard → Settings → API
2. 复制 service_role key (以 eyJ 开头的长字符串)
3. ⚠️ 警告：这个 key 可以绕过所有安全策略，仅在服务端使用！
```

### Step 5: 测试 Webhook（30分钟）

```bash
# 终端 1：启动开发服务器
npm run dev

# 终端 2：启动 Stripe CLI 监听
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 终端 3：触发测试事件
stripe trigger checkout.session.completed
```

**检查：**
- ✅ 终端 2 显示 webhook 接收成功
- ✅ Supabase subscriptions 表有新记录
- ✅ 开发服务器日志显示处理成功

**✅ 第二天完成！** 您现在有了：
- ✅ 订阅数据库表
- ✅ Webhook 处理逻辑
- ✅ 自动同步订阅状态

---

## 🎉 恭喜！48小时内完成支付系统！

您现在可以：
1. ✅ 接受订阅付款
2. ✅ 自动管理订阅状态
3. ✅ 存储用户订阅信息

### 下一步
- [ ] 第三天：实现会员功能限制
- [ ] 第四天：图片优化
- [ ] 第五天：测试和文档

### 需要帮助？
- Stripe 文档：https://stripe.com/docs
- Supabase 文档：https://supabase.com/docs
- Next.js 文档：https://nextjs.org/docs

---

**创建时间：** 2025-10-13  
**预计完成：** 2天（16小时）  
**实际收益：** 开始赚钱！💰

