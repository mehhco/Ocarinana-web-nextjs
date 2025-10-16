import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 性能优化：图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // 图片格式优化
    formats: ['image/webp', 'image/avif'],
  },

  // 性能优化：编译器选项
  compiler: {
    // 生产环境移除 console.log
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 性能优化：实验性功能
  experimental: {
    // 优化包导入（tree shaking）
    optimizePackageImports: ['lucide-react', '@/components/ui'],
    // CSS 优化暂时禁用（Next.js 15 中不稳定）
    // optimizeCss: true,
  },

  // 服务端组件外部包（已移动到根级别）
  serverExternalPackages: ['sharp'],

  // 优化 webpack 缓存配置，减少构建警告
  webpack: (config, { dev, isServer }) => {
    // 在开发环境中禁用持久化缓存以减少警告
    if (dev) {
      config.cache = false;
    }
    
    // 优化缓存策略
    if (!dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // 减少缓存文件大小
        maxMemoryGenerations: 1,
      };
    }
    
    return config;
  },

  // 安全响应头配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // 防止点击劫持攻击
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // 防止 MIME 类型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS 防护
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer 策略
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 权限策略：禁用不必要的浏览器功能
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // 静态资源缓存
      {
        source: '/webfile/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 图片缓存
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
