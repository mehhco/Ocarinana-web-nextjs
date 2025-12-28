import { createClient } from '@/lib/supabase/server';

export interface Product {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  platform: 'taobao' | 'tmall' | 'jd' | 'pdd';
  product_url: string;
  price: number | null;
  original_price: number | null;
  sales_count: number;
  rating: number | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data || [];
}

