export type PublicScoreShareChannel = 'native' | 'copy' | 'qr';

interface PublicScoreShareTextInput {
  title: string;
  instrumentLabel: string;
  keySignature: string;
  timeSignature: string;
  url: string;
}

/**
 * 为公开乐谱链接添加分享来源参数，便于在统计后台区分分享渠道。
 */
export function buildPublicScoreShareUrl(
  url: string,
  channel: PublicScoreShareChannel
): string {
  const shareUrl = new URL(url);
  shareUrl.searchParams.set('utm_source', channel);
  shareUrl.searchParams.set('utm_medium', 'share');
  shareUrl.searchParams.set('utm_campaign', 'public_score');
  return shareUrl.toString();
}

/**
 * 生成适合系统分享、微信粘贴和社交平台使用的乐谱分享文案。
 */
export function buildPublicScoreShareText({
  title,
  instrumentLabel,
  keySignature,
  timeSignature,
  url,
}: PublicScoreShareTextInput): string {
  return `《${title}》${instrumentLabel}陶笛谱，1=${keySignature}，${timeSignature} 拍。\n打开查看指法图并导出图片：${url}`;
}
