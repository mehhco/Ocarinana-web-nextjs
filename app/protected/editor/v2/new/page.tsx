import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlements } from '@/lib/billing/entitlements';
import { canUseBilling } from '@/lib/billing/access';
import { BillingRedirectNotice } from '@/components/billing/billing-redirect-notice';
import { PendingLink } from '@/components/pending-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DEFAULT_PRODUCER,
  DEFAULT_SETTINGS,
  DEFAULT_TITLE,
  INSTRUMENT_OPTIONS,
} from '@/components/editor/lib/constants';
import type { InstrumentType } from '@/lib/editor/types';

interface NewScoreV2PageProps {
  searchParams: Promise<{ instrument?: string }>;
}

function isInstrumentType(value: string | undefined): value is InstrumentType {
  return value === '12-hole' || value === '6-hole';
}

function createInitialDocument(instrumentType: InstrumentType) {
  const now = new Date().toISOString();

  return {
    version: '2.0',
    title: DEFAULT_TITLE,
    producer: DEFAULT_PRODUCER,
    lyricist: '',
    composer: '',
    additionalInfo: '',
    measures: [{ id: 'measure-1', elements: [] }],
    ties: [],
    beams: [],
    expressions: [],
    lyrics: [],
    settings: {
      ...DEFAULT_SETTINGS,
      instrumentType,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export default async function NewScoreV2Page({ searchParams }: NewScoreV2PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const instrumentType = isInstrumentType(params.instrument) ? params.instrument : null;

  if (!instrumentType) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-5 py-10 text-center sm:py-16">
        <div className="mx-auto w-full max-w-3xl space-y-7">
          <div className="text-center">
            <Button asChild variant="ghost" size="sm" className="mb-5 text-slate-600">
              <PendingLink href="/protected/me/scores" pendingText="返回中..." showPendingSpinner>
                返回我的乐谱
              </PendingLink>
            </Button>
            <h1 className="text-2xl font-bold tracking-normal text-slate-900">选择陶笛类型</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              新建后陶笛类型会锁定，六孔和十二孔乐谱会分别使用对应的音域与指法图。
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {INSTRUMENT_OPTIONS.map((option) => (
              <Card key={option.value} className="flex h-full flex-col border-slate-200 bg-white text-center shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{option.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  <p className="flex-1 text-sm leading-6 text-slate-600">
                    {option.value === '6-hole'
                      ? '适合制作六孔陶笛谱，支持 C/F/G 调和对应六孔指法图。'
                      : '适合继续制作十二孔陶笛谱，兼容现有 C/F/G 调指法图。'}
                  </p>
                  <Button asChild className="w-full">
                    <PendingLink href={`/protected/editor/v2/new?instrument=${option.value}`} pendingText="创建中..." showPendingSpinner>
                      选择{option.shortLabel}
                    </PendingLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (await canUseBilling()) {
    const entitlements = await getUserEntitlements(user.id);
    const { count } = await supabase
      .from('scores')
      .select('score_id', { count: 'exact', head: true })
      .eq('owner_user_id', user.id);

    if ((count || 0) >= entitlements.privateScoreLimit) {
      return (
        <BillingRedirectNotice
          title="暂时无法继续创建乐谱"
          description={`当前账号已保存 ${count || 0} 首乐谱，免费版最多可保存 ${entitlements.privateScoreLimit} 首。需要充值或升级 Plus 后，才能继续创建新的私有乐谱。`}
          billingHref="/protected/me/plus?reason=score-limit"
          backHref="/protected/me/scores"
          backLabel="返回我的乐谱"
        />
      );
    }
  }

  const document = createInitialDocument(instrumentType);
  let createdScoreId: string | null = null;

  try {
    const { data, error: createError } = await supabase
      .from('scores')
      .insert({
        owner_user_id: user.id,
        title: document.title,
        document,
      })
      .select('score_id')
      .single();

    if (!createError && data?.score_id) {
      createdScoreId = data.score_id;
    }
  } catch (error) {
    console.error('Failed to create v2 score:', error);
  }

  if (createdScoreId) {
    redirect(`/protected/editor/v2?scoreId=${encodeURIComponent(createdScoreId)}`);
  }

  redirect('/protected/editor/v2');
}
