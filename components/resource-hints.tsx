"use client";

import { useEffect } from 'react';

interface ResourceHintsProps {
  dnsPrefetch?: string[];
  preconnect?: string[];
  preload?: Array<{
    href: string;
    as: string;
    type?: string;
    crossOrigin?: boolean;
  }>;
}

export function ResourceHints({
  dnsPrefetch = [],
  preconnect = [],
  preload = [],
}: ResourceHintsProps) {
  useEffect(() => {
    const addResourceHint = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;

      Object.entries(attributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });

      document.head.appendChild(link);
    };

    dnsPrefetch.forEach((domain) => {
      addResourceHint('dns-prefetch', domain);
    });

    preconnect.forEach((domain) => {
      addResourceHint('preconnect', domain, { crossorigin: 'anonymous' });
    });

    preload.forEach((resource) => {
      const attributes: Record<string, string> = {
        as: resource.as,
      };

      if (resource.type) {
        attributes.type = resource.type;
      }

      if (resource.crossOrigin) {
        attributes.crossorigin = 'anonymous';
      }

      addResourceHint('preload', resource.href, attributes);
    });
  }, [dnsPrefetch, preconnect, preload]);

  return null;
}

export const COMMON_RESOURCE_HINTS = {
  dnsPrefetch: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//images.unsplash.com',
    '//cdn.jsdelivr.net',
  ],
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://images.unsplash.com',
  ],
  preload: [
    {
      href: '/webfile/static/note.webp',
      as: 'image',
      type: 'image/webp',
    },
    {
      href: '/webfile/script.js',
      as: 'script',
    },
    {
      href: '/webfile/styles.css',
      as: 'style',
    },
  ],
};

export const EDITOR_RESOURCE_HINTS = {
  dnsPrefetch: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
  ],
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  preload: [
    {
      href: '/webfile/static/C-graph/1.svg',
      as: 'image',
      type: 'image/svg+xml',
    },
    {
      href: '/webfile/static/F-graph/1.svg',
      as: 'image',
      type: 'image/svg+xml',
    },
    {
      href: '/webfile/static/G-graph/1.svg',
      as: 'image',
      type: 'image/svg+xml',
    },
  ],
};
