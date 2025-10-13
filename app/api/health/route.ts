import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 健康检查端点
 * 用于监控服务状态
 */
export async function GET() {
  const startTime = Date.now();
  const health: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    services: {
      database: {
        status: "up" | "down";
        latency?: number;
        error?: string;
      };
      api: {
        status: "up";
        latency: number;
      };
    };
    version: string;
    environment: string;
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: "down",
      },
      api: {
        status: "up",
        latency: 0,
      },
    },
    version: "1.1.0",
    environment: process.env.NODE_ENV || "development",
  };

  try {
    // 检查数据库连接
    const dbStartTime = Date.now();
    const supabase = await createClient();
    
    // 执行简单查询来测试连接
    const { error } = await supabase
      .from("scores")
      .select("score_id")
      .limit(1);

    const dbLatency = Date.now() - dbStartTime;

    if (error) {
      health.services.database.status = "down";
      health.services.database.error = error.message;
      health.status = "degraded";
    } else {
      health.services.database.status = "up";
      health.services.database.latency = dbLatency;
    }
  } catch (error) {
    health.services.database.status = "down";
    health.services.database.error =
      error instanceof Error ? error.message : "Unknown error";
    health.status = "unhealthy";
  }

  // 计算 API 响应延迟
  health.services.api.latency = Date.now() - startTime;

  // 根据服务状态设置 HTTP 状态码
  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 207 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

