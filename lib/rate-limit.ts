/**
 * API Rate Limiting 工具
 * 使用内存存储，适用于单实例部署
 * 生产环境建议使用 Redis 或 Vercel KV
 */

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// 存储每个 IP 的请求记录
const rateLimitMap = new Map<string, RateLimitInfo>();

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

export interface RateLimitConfig {
  /**
   * 时间窗口内允许的最大请求数
   */
  limit: number;
  
  /**
   * 时间窗口（毫秒）
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * 检查速率限制
 * @param identifier - 唯一标识符（通常是 IP 地址）
 * @param config - 速率限制配置
 * @returns 是否允许请求
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const info = rateLimitMap.get(identifier);

  // 如果没有记录或已过期，创建新记录
  if (!info || now > info.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.window,
    });
    
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.window,
    };
  }

  // 检查是否超过限制
  if (info.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: info.resetTime,
    };
  }

  // 增加计数
  info.count++;
  
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - info.count,
    reset: info.resetTime,
  };
}

/**
 * 从请求中获取标识符（IP 地址）
 */
export function getIdentifier(request: Request): string {
  // 尝试从各种头部获取真实 IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for 可能包含多个 IP，取第一个
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // 如果都没有，使用一个默认值（不推荐）
  return "unknown";
}

/**
 * 预定义的速率限制配置
 */
export const RATE_LIMITS = {
  // 严格限制（认证端点）
  STRICT: {
    limit: 5,
    window: 60 * 1000, // 1 分钟
  },
  
  // 中等限制（写入操作）
  MODERATE: {
    limit: 20,
    window: 60 * 1000, // 1 分钟
  },
  
  // 宽松限制（读取操作）
  LENIENT: {
    limit: 60,
    window: 60 * 1000, // 1 分钟
  },
  
  // 极宽松限制（公共端点）
  VERY_LENIENT: {
    limit: 100,
    window: 60 * 1000, // 1 分钟
  },
} as const;

/**
 * Rate Limit 错误响应
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: "请求过于频繁，请稍后再试",
      message: `您已超过速率限制。请在 ${retryAfter} 秒后重试。`,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

