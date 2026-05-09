"use client";

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    const preloadImages = () => {
      images.forEach((src) => {
        const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;

        if (priority) {
          link.setAttribute('fetchpriority', 'high');
        }

        if (src.startsWith('http') || src.includes('cdn')) {
          link.crossOrigin = 'anonymous';
        }

        document.head.appendChild(link);
      });
    };

    preloadImages();
  }, [images, priority]);

  return null;
}

export const CRITICAL_IMAGES = [
  '/webfile/static/note.webp',
  '/webfile/static/C-graph/1.svg',
  '/webfile/static/C-graph/2.svg',
  '/webfile/static/C-graph/3.svg',
  '/webfile/static/C-graph/4.svg',
  '/webfile/static/C-graph/5.svg',
  '/webfile/static/F-graph/1.svg',
  '/webfile/static/F-graph/2.svg',
  '/webfile/static/F-graph/3.svg',
  '/webfile/static/G-graph/1.svg',
  '/webfile/static/G-graph/2.svg',
  '/webfile/static/G-graph/3.svg',
];

export const EDITOR_IMAGES = [
  '/webfile/static/C-graph/1.svg',
  '/webfile/static/C-graph/1h.svg',
  '/webfile/static/C-graph/2.svg',
  '/webfile/static/C-graph/2h.svg',
  '/webfile/static/C-graph/3.svg',
  '/webfile/static/C-graph/3h.svg',
  '/webfile/static/C-graph/4.svg',
  '/webfile/static/C-graph/4h.svg',
  '/webfile/static/C-graph/5.svg',
  '/webfile/static/C-graph/6.svg',
  '/webfile/static/C-graph/6l.svg',
  '/webfile/static/C-graph/7.svg',
  '/webfile/static/C-graph/7l.svg',
  '/webfile/static/F-graph/1.svg',
  '/webfile/static/F-graph/1h.svg',
  '/webfile/static/F-graph/2.svg',
  '/webfile/static/F-graph/3.svg',
  '/webfile/static/F-graph/3l.svg',
  '/webfile/static/F-graph/4.svg',
  '/webfile/static/F-graph/4l.svg',
  '/webfile/static/F-graph/5.svg',
  '/webfile/static/F-graph/5l.svg',
  '/webfile/static/F-graph/6.svg',
  '/webfile/static/F-graph/6l.svg',
  '/webfile/static/F-graph/7.svg',
  '/webfile/static/F-graph/7l.svg',
  '/webfile/static/G-graph/1.svg',
  '/webfile/static/G-graph/2.svg',
  '/webfile/static/G-graph/2l.svg',
  '/webfile/static/G-graph/3.svg',
  '/webfile/static/G-graph/3l.svg',
  '/webfile/static/G-graph/4.svg',
  '/webfile/static/G-graph/4l.svg',
  '/webfile/static/G-graph/5.svg',
  '/webfile/static/G-graph/5l.svg',
  '/webfile/static/G-graph/6.svg',
  '/webfile/static/G-graph/6l.svg',
  '/webfile/static/G-graph/7l.svg',
  '/webfile/static/G-graph/b7.svg',
];
