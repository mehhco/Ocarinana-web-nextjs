import type { RefObject } from 'react';
import type { ScoreDocument } from '@/lib/editor/types';
import {
  EXPORT_BRAND_NAME,
  EXPORT_FONT_STACK,
  buildExportShareUrl,
  getExportFooterCaption,
  getExportFooterMetrics,
} from '@/lib/share/export-watermark';
import { EXPORT_CONFIG } from './constants';

export interface ExportImageOptions {
  /** 是否在图片底部附加品牌与二维码页脚，默认附加 */
  watermark?: boolean;
  /** 二维码指向的地址；不传时按站点首页生成 */
  shareUrl?: string;
  /** 公开乐谱 ID，用于生成默认链接和页脚文案 */
  scoreId?: string | null;
}

type Html2Canvas = (
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    foreignObjectRendering?: boolean;
    removeContainer?: boolean;
    logging?: boolean;
    windowWidth?: number;
    windowHeight?: number;
    width?: number;
    height?: number;
    scrollX?: number;
    scrollY?: number;
  }
) => Promise<HTMLCanvasElement>;

const MAX_EXPORT_SCALE = 3;
const MIN_EXPORT_SCALE = 2;
const EXPORT_RENDER_DELAY_FRAMES = 2;
const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
let html2CanvasPromise: Promise<Html2Canvas> | null = null;

function loadHtml2Canvas(): Promise<Html2Canvas> {
  const existing = (window as Window & { html2canvas?: Html2Canvas }).html2canvas;
  if (existing) return Promise.resolve(existing);
  if (html2CanvasPromise) return html2CanvasPromise;

  html2CanvasPromise = new Promise<Html2Canvas>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = HTML2CANVAS_URL;
    script.async = true;
    script.dataset.editorExportDependency = 'html2canvas';
    script.addEventListener('load', () => {
      const loaded = (window as Window & { html2canvas?: Html2Canvas }).html2canvas;
      if (loaded) {
        resolve(loaded);
        return;
      }
      reject(new Error('导出组件加载失败，请重试'));
    }, { once: true });
    script.addEventListener('error', () => reject(new Error('导出组件加载失败，请检查网络后重试')), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    html2CanvasPromise = null;
    document.querySelector('script[data-editor-export-dependency="html2canvas"]')?.remove();
    throw error;
  });

  return html2CanvasPromise;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function waitForRenderFrames(count = EXPORT_RENDER_DELAY_FRAMES): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await nextFrame();
  }
}

async function waitForFonts(): Promise<void> {
  if ('fonts' in document) {
    await document.fonts.ready;
  }
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));

  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) {
        try {
          await image.decode();
        } catch {
          // Decoding can fail for already-renderable browser-managed images.
        }
        return;
      }

      await new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });

      if (image.naturalWidth > 0) {
        try {
          await image.decode();
        } catch {
          // Keep exporting even if one asset cannot be decoded explicitly.
        }
      }
    })
  );
}

function getSafeFileName(title: string): string {
  const fileName = title.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ');
  return fileName || '乐谱';
}

function getExportScale(): number {
  const configuredScale = EXPORT_CONFIG.IMAGE_SCALE || MIN_EXPORT_SCALE;
  const deviceScale = typeof window === 'undefined' ? MIN_EXPORT_SCALE : window.devicePixelRatio || MIN_EXPORT_SCALE;

  return Math.min(MAX_EXPORT_SCALE, Math.max(MIN_EXPORT_SCALE, configuredScale, deviceScale));
}

function getElementExportSize(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect();

  return {
    width: Math.ceil(Math.max(element.scrollWidth, element.offsetWidth, rect.width)),
    height: Math.ceil(Math.max(element.scrollHeight, element.offsetHeight, rect.height)),
  };
}

function copyContainedImageRatio(sourceImage: HTMLImageElement, cloneImage: HTMLImageElement): void {
  const sourceRect = sourceImage.getBoundingClientRect();
  const boxWidth = sourceRect.width;
  const boxHeight = sourceRect.height;
  const naturalWidth = sourceImage.naturalWidth;
  const naturalHeight = sourceImage.naturalHeight;

  if (boxWidth <= 0 || boxHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
    return;
  }

  const ratio = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
  const renderedWidth = naturalWidth * ratio;
  const renderedHeight = naturalHeight * ratio;
  const verticalMargin = Math.max(0, (boxHeight - renderedHeight) / 2);
  const horizontalMargin = Math.max(0, (boxWidth - renderedWidth) / 2);

  cloneImage.style.display = 'block';
  cloneImage.style.width = `${renderedWidth}px`;
  cloneImage.style.height = `${renderedHeight}px`;
  cloneImage.style.minWidth = '0';
  cloneImage.style.minHeight = '0';
  cloneImage.style.maxWidth = 'none';
  cloneImage.style.maxHeight = 'none';
  cloneImage.style.margin = `${verticalMargin}px ${horizontalMargin}px`;
  cloneImage.style.objectFit = 'fill';
  cloneImage.style.objectPosition = 'center';
}

function preserveImageRendering(source: HTMLElement, clone: HTMLElement): void {
  const sourceImages = Array.from(source.querySelectorAll('img'));
  const cloneImages = Array.from(clone.querySelectorAll('img'));

  sourceImages.forEach((sourceImage, index) => {
    const cloneImage = cloneImages[index];

    if (!cloneImage) {
      return;
    }

    copyContainedImageRatio(sourceImage, cloneImage);
  });
}

function createExportSandbox(source: HTMLElement, width: number): { sandbox: HTMLDivElement; clone: HTMLElement } {
  const sandbox = document.createElement('div');
  sandbox.setAttribute('aria-hidden', 'true');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '0';
  sandbox.style.top = '0';
  sandbox.style.width = `${width}px`;
  sandbox.style.minHeight = '1px';
  sandbox.style.overflow = 'visible';
  sandbox.style.pointerEvents = 'none';
  sandbox.style.zIndex = '-2147483648';
  sandbox.style.background = EXPORT_CONFIG.BACKGROUND_COLOR;

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.width = `${width}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.height = 'auto';
  clone.style.minHeight = '0';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.background = EXPORT_CONFIG.BACKGROUND_COLOR;
  clone.style.transform = 'none';
  clone.style.boxShadow = 'none';
  clone.style.pointerEvents = 'none';
  clone.style.transition = 'none';

  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      animation: none !important;
      caret-color: transparent !important;
      transition: none !important;
    }
  `;

  sandbox.appendChild(style);
  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  return { sandbox, clone };
}

function downloadCanvas(canvas: HTMLCanvasElement, title: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('图片生成失败'));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${getSafeFileName(title)}.png`;
      link.href = url;
      link.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve();
      }, 0);
    }, 'image/png', EXPORT_CONFIG.IMAGE_QUALITY);
  });
}

/**
 * 生成二维码图片。失败时返回 null，导出仍然继续（只是页脚没有二维码）。
 */
async function loadQrImage(
  url: string,
  size: number
): Promise<HTMLImageElement | null> {
  try {
    const { default: QRCode } = await import('qrcode');
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: Math.max(64, Math.round(size)),
      color: { dark: '#111827', light: '#ffffff' },
    });
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => reject(new Error('二维码加载失败')), {
        once: true,
      });
      image.src = dataUrl;
    });

    return image;
  } catch {
    return null;
  }
}

/**
 * 在导出图片底部追加品牌页脚：左侧品牌与说明，右侧二维码。
 */
function composeWatermark(
  source: HTMLCanvasElement,
  qrImage: HTMLImageElement | null,
  caption: string,
  scale: number
): HTMLCanvasElement {
  const metrics = getExportFooterMetrics(scale);
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height + metrics.height;

  const context = canvas.getContext('2d');
  if (!context) {
    return source;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0);

  const footerTop = source.height;
  context.fillStyle = '#e5e7eb';
  context.fillRect(0, footerTop, canvas.width, metrics.borderWidth);

  const left = metrics.padding;
  const brandBaseline = footerTop + metrics.padding + metrics.brandFontSize;
  const textMaxWidth = canvas.width - metrics.padding * 3 - metrics.qrSize;

  context.textBaseline = 'alphabetic';
  context.fillStyle = '#065f46';
  context.font = `700 ${metrics.brandFontSize}px ${EXPORT_FONT_STACK}`;
  context.fillText(EXPORT_BRAND_NAME, left, brandBaseline, textMaxWidth);

  context.fillStyle = '#6b7280';
  context.font = `400 ${metrics.captionFontSize}px ${EXPORT_FONT_STACK}`;
  context.fillText(
    caption,
    left,
    brandBaseline + metrics.lineGap + metrics.captionFontSize,
    textMaxWidth
  );

  if (qrImage) {
    const qrSize = metrics.qrSize;
    const qrX = canvas.width - metrics.padding - qrSize;
    const qrY = footerTop + Math.round((metrics.height - qrSize) / 2);

    context.imageSmoothingEnabled = false;
    context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  }

  return canvas;
}

/**
 * 导出为 PNG 图片（首次导出时按需加载 html2canvas）
 *
 * 默认在图片底部加品牌二维码页脚，二维码带 utm 参数，图片被转发后仍能带回访问。
 */
export async function exportAsImage(
  containerRef: RefObject<HTMLDivElement | null>,
  title: string,
  options: ExportImageOptions = {}
): Promise<void> {
  const html2canvas = await loadHtml2Canvas();

  if (!containerRef.current) {
    throw new Error('乐谱容器不存在');
  }

  const source = containerRef.current;
  const { width: exportWidth } = getElementExportSize(source);
  const { sandbox, clone } = createExportSandbox(source, exportWidth);

  try {
    await waitForFonts();
    await waitForImages(source);
    await waitForImages(clone);
    preserveImageRendering(source, clone);
    await waitForRenderFrames();

    const { height: exportHeight } = getElementExportSize(clone);
    const scale = getExportScale();

    const canvas = await html2canvas(clone, {
      backgroundColor: EXPORT_CONFIG.BACKGROUND_COLOR,
      scale,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      removeContainer: true,
      logging: false,
      width: exportWidth,
      height: exportHeight,
      windowWidth: exportWidth,
      windowHeight: exportHeight,
      scrollX: 0,
      scrollY: 0,
    });

    if (options.watermark === false) {
      await downloadCanvas(canvas, title);
      return;
    }

    const shareUrl =
      options.shareUrl ??
      (typeof window === 'undefined'
        ? ''
        : buildExportShareUrl({
            origin: window.location.origin,
            scoreId: options.scoreId,
          }));
    const qrImage = shareUrl
      ? await loadQrImage(shareUrl, getExportFooterMetrics(scale).qrSize)
      : null;
    const composed = composeWatermark(
      canvas,
      qrImage,
      getExportFooterCaption(options.scoreId),
      scale
    );

    await downloadCanvas(composed, title);
  } finally {
    sandbox.remove();
  }
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
      const error = await res.json().catch(() => null);
      return { success: false, error: error?.message || error?.error || '保存失败' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

export async function createScoreInCloud(
  scoreDoc: ScoreDocument
): Promise<{ success: boolean; scoreId?: string; error?: string; skipped?: boolean }> {
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreDoc),
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      return { success: false, error: payload?.message || payload?.error || '保存失败' };
    }

    if (payload?.skipped) {
      return { success: true, skipped: true };
    }

    if (!payload?.scoreId) {
      return { success: false, error: '保存失败：缺少乐谱 ID' };
    }

    return { success: true, scoreId: payload.scoreId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}
