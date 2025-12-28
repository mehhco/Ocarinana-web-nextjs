import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ProductList } from "@/components/shop/product-list";
import { getActiveProducts, type Product } from "@/lib/supabase/products";
import { ProductSchema } from "@/components/seo/structured-data";
import { isShopEnabled } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "精选陶笛",
  description: "精选优质陶笛商品，来自淘宝、天猫、京东、拼多多等平台，为您的音乐之旅提供最佳选择。",
  keywords: [
    "陶笛购买",
    "陶笛商城",
    "陶笛推荐",
    "淘宝陶笛",
    "京东陶笛",
    "拼多多陶笛",
    "天猫陶笛",
  ],
  openGraph: {
    title: "精选陶笛 - Ocarinana",
    description: "精选优质陶笛商品，来自各大电商平台",
    type: "website",
  },
};

export default async function ShopPage() {
  // 检查功能是否启用
  const shopEnabled = await isShopEnabled();
  if (!shopEnabled) {
    notFound();
  }

  let products: Product[] = [];
  try {
    products = await getActiveProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppNav currentPath="/shop" />
      
      {/* 页面标题区域 */}
      <section className="w-full border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="w-full max-w-6xl mx-auto px-5 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">精选陶笛</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            精选优质陶笛商品，来自淘宝、天猫、京东、拼多多等平台，为您的音乐之旅提供最佳选择
          </p>
        </div>
      </section>

      {/* 商品列表区域 */}
      <section className="w-full flex-1">
        <div className="w-full max-w-6xl mx-auto px-5 py-8">
          <ProductList products={products} />
        </div>
      </section>

      {/* SEO: 结构化数据 */}
      {products.length > 0 && (
        <ProductSchema products={products} />
      )}

      {/* 页脚 */}
      <footer className="w-full border-t mt-auto">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/60">
              © {new Date().getFullYear()} Ocarinana · 陶笛谱生成器
            </p>
            <div className="flex items-center gap-6 text-xs">
              <p className="text-foreground/60">
                商品链接跳转到第三方平台，购买时请注意商品详情
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

