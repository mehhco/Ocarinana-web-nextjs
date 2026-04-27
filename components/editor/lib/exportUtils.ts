import type { RefObject } from 'react';
import type { ScoreDocument } from '@/lib/editor/types';
import { EXPORT_CONFIG } from './constants';

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
 * 导出为 PNG 图片（使用全局 html2canvas）
 * 注意：需要在页面中先加载 html2canvas 脚本
 */
export async function exportAsImage(
  containerRef: RefObject<HTMLDivElement | null>,
  title: string
): Promise<void> {
  // 使用全局 html2canvas（通过 CDN 加载）
  const html2canvas = (window as Window & { html2canvas?: Html2Canvas }).html2canvas;
  
  if (!html2canvas) {
    throw new Error('html2canvas 未加载，请确保页面已加载该脚本');
  }

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

    const canvas = await html2canvas(clone, {
      backgroundColor: EXPORT_CONFIG.BACKGROUND_COLOR,
      scale: getExportScale(),
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

    await downloadCanvas(canvas, title);
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
