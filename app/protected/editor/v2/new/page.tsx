import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function NewScoreV2Page() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const now = new Date().toISOString();
  const document = {
    version: '2.0',
    title: '未命名简谱',
    measures: [{ id: 'measure-1', elements: [] }],
    ties: [],
    beams: [],
    expressions: [],
    lyrics: [],
    settings: {
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 120,
      skin: 'white',
      showLyrics: false,
      showFingering: true,
    },
    createdAt: now,
    updatedAt: now,
  };

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
