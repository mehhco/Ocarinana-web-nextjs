-- =============================================================
-- 商品表：products
-- 创建时间：2025-01-XX
-- 说明：用于存储陶笛商品信息，支持多个电商平台
-- =============================================================

-- 创建 products 表
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('taobao', 'tmall', 'jd', 'pdd')),
  product_url TEXT NOT NULL,
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_platform ON public.products(platform);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION public.set_products_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_products_updated_at();

-- 启用 RLS（行级安全策略）
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取活跃商品
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- 更新表统计信息
ANALYZE public.products;

