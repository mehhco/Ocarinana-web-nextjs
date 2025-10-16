"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// 性能优化：路由级别的代码分割
// 这些组件只在特定页面需要时才加载

// 乐谱列表组件 - 只在乐谱列表页面加载
export const LazyScoreListClient = dynamic(
  () => import("@/components/score-list-client").then(mod => ({ default: mod.ScoreListClient })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    ),
  }
);

// 新建乐谱按钮 - 只在需要时加载
export const LazyNewScoreButton = dynamic(
  () => import("@/components/new-score-button"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-8 w-16" />,
  }
);

// 乐谱卡片 - 批量加载优化
export const LazyScoreCard = dynamic(
  () => import("@/components/score-card").then(mod => ({ default: mod.ScoreCard })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    ),
  }
);

// 主题切换器 - 非关键组件
export const LazyThemeSwitcher = dynamic(
  () => import("@/components/theme-switcher").then(mod => ({ default: mod.ThemeSwitcher })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-8 w-8 rounded" />,
  }
);

// 注意：AppNav 不能懒加载，因为它使用了 next/headers (Server Component)
// 如果需要懒加载导航，需要创建一个纯客户端的导航组件

// 教程步骤组件 - 只在需要时加载
export const LazyFetchDataSteps = dynamic(
  () => import("@/components/tutorial/fetch-data-steps").then(mod => ({ default: mod.FetchDataSteps })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    ),
  }
);

// 连接 Supabase 步骤 - 只在需要时加载
export const LazyConnectSupabaseSteps = dynamic(
  () => import("@/components/tutorial/connect-supabase-steps").then(mod => ({ default: mod.ConnectSupabaseSteps })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    ),
  }
);

// 用户注册步骤 - 只在需要时加载
export const LazySignUpUserSteps = dynamic(
  () => import("@/components/tutorial/sign-up-user-steps").then(mod => ({ default: mod.SignUpUserSteps })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    ),
  }
);

// 代码块组件 - 只在教程页面加载
export const LazyCodeBlock = dynamic(
  () => import("@/components/tutorial/code-block").then(mod => ({ default: mod.CodeBlock })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg bg-muted p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ),
  }
);

// 教程步骤组件 - 通用组件
export const LazyTutorialStep = dynamic(
  () => import("@/components/tutorial/tutorial-step").then(mod => ({ default: mod.TutorialStep })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ),
  }
);