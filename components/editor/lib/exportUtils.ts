/**
 * 乐谱导出工具
 */

import type { ScoreDocument } from '@/lib/editor/types';

/**
 * 导出为 PNG 图片（使用全局 html2canvas）
 * 注意：需要在页面中先加载 html2canvas 脚本
 */
export async function exportAsImage(
  containerRef: React.RefObject<HTMLDivElement>,
  title: string
): Promise<void> {
  // 使用全局 html2canvas（通过 CDN 加载）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvas = (window as any).html2canvas;
  
  if (!html2canvas) {
    throw new Error('html2canvas 未加载，请确保页面已加载该脚本');
  }

  if (!containerRef.current) {
    throw new Error('乐谱容器不存在');
  }

  const canvas = await html2canvas(containerRef.current, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: false,
    removeContainer: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = `${title || '乐谱'}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

/**
 * 导出为 JSON 文件
 */
export function exportAsJson(scoreDoc: ScoreDocument): void {
  const data = {
    title: scoreDoc.title,
    settings: scoreDoc.settings,
    measures: scoreDoc.measures,
    lyrics: scoreDoc.lyrics,

  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${scoreDoc.title || '乐谱'}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 保存到云端
 */
export async function saveToCloud(
  scoreDoc: ScoreDocument,
  scoreId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/scores/${encodeURIComponent(scoreId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreDoc),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message || '保存失败' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}
