/**
 * 导出图片页脚（品牌 + 二维码）的版式与链接规则。
 *
 * 免费用户导出的 PNG 会带一条页脚，二维码指向带 utm 参数的页面，
 * 这样每一张被保存、转发到微信群或小红书上的图片都能带回流量；
 * Plus 用户可以通过 canExportWithoutWatermark 关掉这条页脚。
 */

export const EXPORT_BRAND_NAME = 'Ocarinana';
export const EXPORT_FONT_STACK =
  '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif';

export interface ExportFooterMetrics {
  /** 页脚总高度（设备像素） */
  height: number;
  /** 内边距（设备像素） */
  padding: number;
  /** 二维码边长（设备像素） */
  qrSize: number;
  brandFontSize: number;
  captionFontSize: number;
  /** 上下两行文字之间的额外间距 */
  lineGap: number;
  borderWidth: number;
}

const QR_SIZE = 64;
const PADDING = 18;
const BRAND_FONT_SIZE = 17;
const CAPTION_FONT_SIZE = 11;
const LINE_GAP = 6;

export function getExportFooterMetrics(scale: number): ExportFooterMetrics {
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

  return {
    qrSize: Math.round(QR_SIZE * safeScale),
    padding: Math.round(PADDING * safeScale),
    height: Math.round((QR_SIZE + PADDING * 2) * safeScale),
    brandFontSize: Math.round(BRAND_FONT_SIZE * safeScale),
    captionFontSize: Math.round(CAPTION_FONT_SIZE * safeScale),
    lineGap: Math.round(LINE_GAP * safeScale),
    borderWidth: Math.max(1, Math.round(safeScale)),
  };
}

export interface ExportShareUrlInput {
  /** 站点 origin，例如 https://www.ocarinana.com */
  origin: string;
  /** 公开乐谱 ID；没有时链接到首页 */
  scoreId?: string | null;
}

/**
 * 生成二维码里编码的地址，带上 utm 参数，便于区分"图片回流"带来的访问。
 */
export function buildExportShareUrl({ origin, scoreId }: ExportShareUrlInput): string {
  const base = origin.replace(/\/+$/, '');
  const path = scoreId ? `/scores/${encodeURIComponent(scoreId)}` : '/';
  const url = new URL(`${base}${path}`);

  url.searchParams.set('utm_source', 'export');
  url.searchParams.set('utm_medium', 'image');
  url.searchParams.set('utm_campaign', 'score_export');

  return url.toString();
}

export function getExportFooterCaption(scoreId?: string | null): string {
  return scoreId
    ? '扫码打开这份陶笛谱，可查看指法并继续编辑'
    : '扫码在线制作陶笛谱，自动匹配指法图';
}
