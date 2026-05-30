import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicationRewardHint } from '@/components/billing/publication-reward-hint';
import { LazyScoreListClient } from '@/components/lazy-components';
import { PendingLink } from '@/components/pending-link';
import { UpgradePrompt } from '@/components/personal/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { getUserEntitlements } from '@/lib/billing/entitlements';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: '我的乐谱 - Ocarinana',
  description: '管理你的六孔和十二孔陶笛指法谱',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ScoreDocumentSummary = {
  version?: string;
  settings?: {
    instrumentType?: string;
    keySignature?: string;
    timeSignature?: string;
  };
};

type ScoreRow = {
  score_id: string;
  title: string | null;
  document?: ScoreDocumentSummary | null;
  created_at: string;
  updated_at: string;
  is_public?: boolean | null;
  published_at?: string | null;
};

export default async function MeScoresPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  const primaryScoresResult = await supabase
    .from('scores')
    .select('score_id, title, document, created_at, updated_at, is_public, published_at')
    .eq('owner_user_id', user.id)
    .order('updated_at', { ascending: false });
  let scoresData = primaryScoresResult.data as ScoreRow[] | null;
  let error = primaryScoresResult.error;

  if (error) {
    const fallback = await supabase
      .from('scores')
      .select('score_id, title, document, created_at, updated_at')
      .eq('owner_user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!fallback.error) {
      scoresData = fallback.data as ScoreRow[] | null;
      error = null;
    }
  }

  if (error) {
    console.error('Failed to fetch scores:', error);
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
        加载乐谱失败，请刷新页面重试
      </div>
    );
  }

  const entitlements = await getUserEntitlements(user.id);
  const scores = (scoresData || []).map((row) => ({
    scoreId: row.score_id,
    title: row.title || '未命名简谱',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublic: row.is_public ?? false,
    publishedAt: row.published_at,
    editorHref:
      row.document?.version === '2.0'
        ? `/protected/editor/v2?scoreId=${encodeURIComponent(row.score_id)}`
        : `/protected/scores?scoreId=${encodeURIComponent(row.score_id)}`,
    settings: {
      instrumentType: row.document?.settings?.instrumentType || '12-hole',
      keySignature: row.document?.settings?.keySignature || 'C',
      timeSignature: row.document?.settings?.timeSignature || '4/4',
    },
  }));
  const shouldPromptPrivateLimit = !entitlements.isPlus && scores.length >= entitlements.privateScoreLimit * 0.8;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950">我的乐谱</h2>
          <p className="mt-1 text-sm text-zinc-600">管理作品、继续编辑、删除草稿或公开到乐谱广场。</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <PendingLink href="/protected/editor/v2/new" pendingText="创建中..." showPendingSpinner>
            <PlusIcon className="h-5 w-5" />
            新建乐谱
          </PendingLink>
        </Button>
      </div>

      <PublicationRewardHint />

      {shouldPromptPrivateLimit && (
        <UpgradePrompt
          title="保存额度接近上限"
          description={`你已保存 ${scores.length} 首乐谱，免费版最多保存 ${entitlements.privateScoreLimit} 首。公开乐谱不受数量限制；升级 Plus 后可保存 100 首私有乐谱。`}
        />
      )}

      <LazyScoreListClient initialScores={scores} />
    </div>
  );
}
