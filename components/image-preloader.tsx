"use client";

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    // 预加载关键图片
    const preloadImages = () => {
      images.forEach((src) => {
        // 检查是否已存在，避免重复添加
        const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        
        // 如果是高优先级图片，添加 fetchpriority
        if (priority) {
          link.setAttribute('fetchpriority', 'high');
        }
        
        // 添加 crossorigin 属性（如果需要）
        if (src.startsWith('http') || src.includes('cdn')) {
          link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
      });
    };

    // 立即预加载
    preloadImages();

    // 注意：不清理预加载的链接，因为它们是性能优化的一部分
    // 清理会导致图片重新加载，影响性能
  }, [images, priority]); // 包含依赖，但添加重复检查避免问题

  return null; // 这个组件不渲染任何内容
}

// 预定义的关键图片列表
export const CRITICAL_IMAGES = [
  // 主页关键图片
  '/webfile/static/Cfinger.png',
  
  // 编辑器关键指法图（前几张，最常用）
  '/webfile/static/C-graph/1.webp',
  '/webfile/static/C-graph/2.webp',
  '/webfile/static/C-graph/3.webp',
  '/webfile/static/C-graph/4.webp',
  '/webfile/static/C-graph/5.webp',
  
  // F调关键指法图
  '/webfile/static/F-graph/1.webp',
  '/webfile/static/F-graph/2.webp',
  '/webfile/static/F-graph/3.webp',
  
  // G调关键指法图
  '/webfile/static/G-graph/1.webp',
  '/webfile/static/G-graph/2.webp',
  '/webfile/static/G-graph/3.webp',
];

// 编辑器专用图片（延迟加载）
export const EDITOR_IMAGES = [
  // C调完整指法图
  '/webfile/static/C-graph/1.webp',
  '/webfile/static/C-graph/1h.webp',
  '/webfile/static/C-graph/2.webp',
  '/webfile/static/C-graph/2h.webp',
  '/webfile/static/C-graph/3.webp',
  '/webfile/static/C-graph/3h.webp',
  '/webfile/static/C-graph/4.webp',
  '/webfile/static/C-graph/4h.webp',
  '/webfile/static/C-graph/5.webp',
  '/webfile/static/C-graph/6.webp',
  '/webfile/static/C-graph/6l.webp',
  '/webfile/static/C-graph/7.webp',
  '/webfile/static/C-graph/7l.webp',
  
  // F调完整指法图
  '/webfile/static/F-graph/1.webp',
  '/webfile/static/F-graph/1h.webp',
  '/webfile/static/F-graph/2.webp',
  '/webfile/static/F-graph/3.webp',
  '/webfile/static/F-graph/3l.webp',
  '/webfile/static/F-graph/4.webp',
  '/webfile/static/F-graph/4l.webp',
  '/webfile/static/F-graph/5.webp',
  '/webfile/static/F-graph/5l.webp',
  '/webfile/static/F-graph/6.webp',
  '/webfile/static/F-graph/6l.webp',
  '/webfile/static/F-graph/7.webp',
  '/webfile/static/F-graph/7l.webp',
  
  // G调完整指法图
  '/webfile/static/G-graph/1.webp',
  '/webfile/static/G-graph/2.webp',
  '/webfile/static/G-graph/2l.webp',
  '/webfile/static/G-graph/3.webp',
  '/webfile/static/G-graph/3l.webp',
  '/webfile/static/G-graph/4.webp',
  '/webfile/static/G-graph/4l.webp',
  '/webfile/static/G-graph/5.webp',
  '/webfile/static/G-graph/5l.webp',
  '/webfile/static/G-graph/6.webp',
  '/webfile/static/G-graph/6l.webp',
  '/webfile/static/G-graph/7l.webp',
  '/webfile/static/G-graph/b7.webp',
];
