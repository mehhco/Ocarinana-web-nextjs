"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    } else {
      clearDevelopmentServiceWorkerState();
    }
  }, []);

  return null; // 这个组件不渲染任何内容
}

/**
 * 开发环境清理旧版 Service Worker 和本项目缓存，
 * 防止生产环境留下的缓存优先策略继续返回过期的开发 chunk。
 */
async function clearDevelopmentServiceWorkerState() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('ocarinana-'))
          .map((cacheName) => caches.delete(cacheName))
      );
    }
  } catch (error) {
    console.warn('Development Service Worker cleanup failed:', error);
  }
}

async function registerServiceWorker() {
  try {
    console.log('🔧 Registering Service Worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ Service Worker registered successfully:', registration);

    // 监听 Service Worker 更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新的 Service Worker 已安装，提示用户刷新
            console.log('🔄 New Service Worker available, please refresh');
            
            // 可以在这里显示更新提示
            if (confirm('新版本已可用，是否刷新页面？')) {
              window.location.reload();
            }
          }
        });
      }
    });

    // 监听 Service Worker 控制权变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🎯 Service Worker controller changed');
      // 可以在这里处理控制权变化
    });

    // 监听 Service Worker 消息
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Service Worker message:', event.data);
    });

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

// 手动缓存 URL 的工具函数
export function cacheUrls(urls: string[]) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      payload: urls,
    });
  }
}

// 检查 Service Worker 支持
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

// 获取 Service Worker 状态
export function getServiceWorkerStatus(): Promise<string> {
  return new Promise((resolve) => {
    if (!isServiceWorkerSupported()) {
      resolve('not-supported');
      return;
    }

    if (!navigator.serviceWorker.controller) {
      resolve('not-registered');
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        resolve('active');
      } else if (registration.installing) {
        resolve('installing');
      } else if (registration.waiting) {
        resolve('waiting');
      } else {
        resolve('unknown');
      }
    });
  });
}
