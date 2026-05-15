"use client";

import { ProductCard } from "./product-card";
import type { Product } from "@/lib/supabase/products";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductList({ products, isLoading }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="w-full aspect-square rounded-t-xl" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-white px-5 py-10 text-center">
        <p className="font-medium text-zinc-900">暂无真实商品</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          添加 Supabase products 数据后，这里会自动显示真实商品卡片。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

