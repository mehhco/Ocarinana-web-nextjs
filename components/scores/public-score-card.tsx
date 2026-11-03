import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon } from '@/components/ui/icons';
import {
  getInstrumentLabel,
  getScoreSettings,
  type PublicScoreListItem,
} from '@/lib/scores/public-list';

function formatDate(value: string | null): string {
  if (!value) return '未知时间';

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function PublicScoreCard({ score }: { score: PublicScoreListItem }) {
  const settings = getScoreSettings(score);
  const instrumentLabel = getInstrumentLabel(settings.instrumentType);
  const href = `/scores/${score.score_id}`;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-lg leading-snug">
          <Link href={href} className="hover:text-emerald-600">
            {score.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{instrumentLabel}</Badge>
          <Badge variant="secondary">1={settings.keySignature || 'C'}</Badge>
          <Badge variant="outline">{settings.timeSignature || '4/4'}</Badge>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>作者：{score.public_author_label || '匿名用户'}</div>
          <div>公开于：{formatDate(score.published_at)}</div>
        </div>
        <Button asChild size="sm" className="w-full">
          <Link href={href}>
            <EyeIcon className="h-4 w-4" />
            查看乐谱
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
