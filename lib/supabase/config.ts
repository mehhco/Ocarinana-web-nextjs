import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export interface AppConfig {
  key: string;
  value: any;
  description?: string;
}

/**
 * 创建匿名 Supabase 客户端（用于读取公开配置，不需要 cookies）
 */
function createAnonymousClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
}

/**
 * 获取配置值（原始查询，无缓存）
 * @param key 配置键名
 * @returns 配置值，如果不存在返回 null
 */
async function getConfigRaw(key: string): Promise<any | null> {
  const supabase = createAnonymousClient();
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error || !data) {
    return null;
  }
  return data.value;
}

/**
 * 获取配置值（带缓存）
 * @param key 配置键名
 * @returns 配置值，如果不存在返回 null
 */
export async function getConfig(key: string): Promise<any | null> {
  // 开发环境：禁用缓存，避免 Hydration 错误
  // 生产环境：5分钟缓存（平衡性能和实时性）
  if (process.env.NODE_ENV === 'development') {
    // 开发环境直接查询，不使用缓存
    return getConfigRaw(key);
  }
  
  // 生产环境使用缓存
  return unstable_cache(
    async (configKey: string) => {
      return getConfigRaw(configKey);
    },
    [`app_config_${key}`],
    {
      revalidate: 300, // 5分钟缓存
      tags: [`config_${key}`],
    }
  )(key);
}

/**
 * 检查精选陶笛功能是否启用
 * @returns true 如果功能启用，否则 false
 */
export async function isShopEnabled(): Promise<boolean> {
  const config = await getConfig('shop_enabled');
  return config?.enabled === true;
}

