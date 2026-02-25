import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function NewScoreV2Page() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }
  
  // 创建一个新乐谱并重定向到编辑器
  const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
  try {
    const res = await fetch(`${origin}/api/scores`, { 
      method: 'POST', 
      cache: 'no-store' 
    });
    
    if (res.ok) {
      const { scoreId } = await res.json();
      redirect(`/protected/editor/v2?scoreId=${encodeURIComponent(scoreId)}`);
    }
  } catch (error) {
    console.error('创建乐谱失败:', error);
  }
  
  // 失败时仍然进入空白编辑器
  redirect('/protected/editor/v2');
}
