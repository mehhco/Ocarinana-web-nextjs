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
      const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
      const res = await fetch(`${origin}/api/scores/${scoreId}`, {
        cache: 'no-store',
      });
      
      if (res.ok) {
        const data = await res.json();
        const document = data.document ?? data;
        initialDocument = {
          ...document,
          scoreId: data.scoreId ?? document.scoreId ?? scoreId,
          ownerUserId: user.id,
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
