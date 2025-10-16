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
  preload = [] 
}: ResourceHintsProps) {
  useEffect(() => {
    const addResourceHint = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      // 检查是否已存在
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      
      // 添加额外属性
      Object.entries(attributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      
      document.head.appendChild(link);
    };

    // DNS 预解析
    dnsPrefetch.forEach(domain => {
      addResourceHint('dns-prefetch', domain);
    });

    // 预连接
    preconnect.forEach(domain => {
      addResourceHint('preconnect', domain, { crossorigin: 'anonymous' });
    });

    // 预加载
    preload.forEach(resource => {
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

    // 注意：不清理资源提示，因为它们是性能优化的一部分
    // 清理会导致资源重新加载，影响性能
  }, [dnsPrefetch, preconnect, preload]); // 包含依赖，但添加重复检查避免问题

  return null; // 这个组件不渲染任何内容
}

// 预定义的资源提示配置
export const COMMON_RESOURCE_HINTS = {
  // DNS 预解析 - 常用第三方域名
  dnsPrefetch: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//images.unsplash.com',
    '//cdn.jsdelivr.net',
  ],
  
  // 预连接 - 关键第三方资源
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://images.unsplash.com',
  ],
  
  // 预加载 - 关键资源
  preload: [
    {
      href: '/webfile/static/Cfinger.png',
      as: 'image',
      type: 'image/png',
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

// 编辑器专用资源提示
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
    // 关键指法图
    {
      href: '/webfile/static/C-graph/1.webp',
      as: 'image',
      type: 'image/webp',
    },
    {
      href: '/webfile/static/F-graph/1.webp',
      as: 'image',
      type: 'image/webp',
    },
    {
      href: '/webfile/static/G-graph/1.webp',
      as: 'image',
      type: 'image/webp',
    },
  ],
};
