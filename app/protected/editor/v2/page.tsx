import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ScoreEditor } from '@/components/editor/core/ScoreEditor';

interface EditorV2PageProps {
  searchParams: Promise<{ scoreId?: string }>;
}

export default async function EditorV2Page({ searchParams }: EditorV2PageProps) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }
  
  const params = await searchParams;
  const scoreId = params.scoreId;
  
  let initialDocument = null;
  
  // 如果有 scoreId，尝试从 API 加载乐谱
  if (scoreId) {
    try {
      const { data, error: scoreError } = await supabase
        .from('scores')
        .select('score_id, owner_user_id, document, created_at, updated_at')
        .eq('owner_user_id', user.id)
        .eq('score_id', scoreId)
        .maybeSingle();

      if (!scoreError && data) {
        const document = data.document ?? {};
        initialDocument = {
          ...document,
          scoreId: data.score_id ?? document.scoreId ?? scoreId,
          ownerUserId: user.id,
          createdAt: document.createdAt ?? data.created_at,
          updatedAt: document.updatedAt ?? data.updated_at,
        };
      }
    } catch (error) {
      console.error('加载乐谱失败:', error);
    }
  }
  
  return (
    <ScoreEditor 
      initialDocument={initialDocument || undefined}
      scoreId={scoreId}
    />
  );
}
