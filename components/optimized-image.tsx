"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  placeholder = "empty",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 生成响应式图片源（预留功能）
  // const generateSrcSet = (baseSrc: string) => {
  //   const sizes = [320, 640, 768, 1024, 1200, 1920];
  //   return sizes
  //     .map((size) => {
  //       // 如果是 WebP 图片，保持 WebP 格式
  //       if (baseSrc.includes('.webp')) {
  //         return `${baseSrc}?w=${size}&q=${quality} ${size}w`;
  //       }
  //       // 否则生成 WebP 版本
  //       return `${baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')}?w=${size}&q=${quality} ${size}w`;
  //     })
  //     .join(', ');
  // };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">图片加载失败</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        // 启用现代图片格式
        unoptimized={false}
      />
    </div>
  );
}

// 预定义的响应式图片配置
export const RESPONSIVE_IMAGE_CONFIGS = {
  hero: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw",
    quality: 90,
    priority: true,
  },
  card: {
    sizes: "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
    quality: 85,
    priority: false,
  },
  thumbnail: {
    sizes: "(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw",
    quality: 80,
    priority: false,
  },
  fullWidth: {
    sizes: "100vw",
    quality: 85,
    priority: false,
  },
} as const;
