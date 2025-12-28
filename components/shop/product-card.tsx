"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "./platform-badge";
import { ExternalLink } from "lucide-react";
import type { Product } from "@/lib/supabase/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.original_price && product.price && product.original_price > product.price;
  const discountPercent = hasDiscount && product.original_price && product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <Card className="group flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-square overflow-hidden rounded-t-xl bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              暂无图片
            </div>
          )}
          <div className="absolute top-2 left-2">
            <PlatformBadge platform={product.platform} />
          </div>
          {hasDiscount && discountPercent && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col">
        <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem]">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            {product.price !== null && (
              <span className="text-xl font-bold text-emerald-600">
                ¥{product.price.toFixed(2)}
              </span>
            )}
            {hasDiscount && product.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                ¥{product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          {(product.sales_count > 0 || product.rating) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {product.sales_count > 0 && (
                <span>已售 {product.sales_count.toLocaleString()}</span>
              )}
              {product.rating && (
                <span>评分 {product.rating.toFixed(1)}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full"
          variant="default"
        >
          <Link
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            去购买
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

