"use client";

import { Toaster } from "react-hot-toast";

/**
 * Toast 通知系统提供者
 * 全局配置 Toast 的样式和行为
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // 默认配置
        duration: 4000,
        
        // 样式
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.5rem',
          padding: '16px',
        },
        
        // 成功提示
        success: {
          duration: 3000,
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--primary-foreground))',
          },
        },
        
        // 错误提示
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        
        // 加载提示
        loading: {
          duration: Infinity,
        },
      }}
    />
  );
}

