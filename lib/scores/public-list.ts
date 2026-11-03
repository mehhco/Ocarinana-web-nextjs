import { createClient } from '@supabase/supabase-js';

export interface PublicScoreSettings {
  instrumentType?: string | null;
  keySignature?: string | null;
  timeSignature?: string | null;
}

export interface PublicScoreListItem {
  score_id: string;
  title: string;
  document: { settings?: PublicScoreSettings | null } | null;
  published_at: string | null;
  public_author_label: string | null;
}

interface FetchPublicScoresOptions {
  instrumentType?: '6-hole' | '12-hole';
  keySignature?: 'C' | 'F' | 'G';
  limit?: number;
}

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * 读取公开乐谱列表。
 *
 * 落地页是给搜索引擎和首次访问者看的，不需要登录态，
 * 所以这里用匿名客户端（而不是读 cookie 的 server client），
 * 让页面可以按 ISR 缓存，避免每次抓取都打一次数据库。
 */
export async function fetchPublicScores({
  instrumentType,
  keySignature,
  limit = 18,
}: FetchPublicScoresOptions = {}): Promise<PublicScoreListItem[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from('scores')
    .select('score_id, title, document, published_at, public_author_label')
    .eq('is_public', true);

  if (instrumentType === '6-hole') {
    query = query.eq('document->settings->>instrumentType', '6-hole');
  } else if (instrumentType === '12-hole') {
    query = query.or(
      'document->settings->>instrumentType.eq.12-hole,document->settings->>instrumentType.is.null'
    );
  }

  if (keySignature) {
    query = query.eq('document->settings->>keySignature', keySignature);
  }

  const { data, error } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as PublicScoreListItem[];
}

export function getScoreSettings(score: PublicScoreListItem): PublicScoreSettings {
  return score.document?.settings ?? {};
}

export function getInstrumentLabel(instrumentType: string | null | undefined): string {
  return instrumentType === '6-hole' ? '六孔' : '十二孔';
}
