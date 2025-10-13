"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局错误边界组件
 * 捕获 React 组件树中的错误，防止整个应用白屏
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到错误报告服务（如 Sentry）
    console.error("ErrorBoundary 捕获到错误:", error, errorInfo);
    
    // TODO: 在这里集成 Sentry
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 使用自定义降级 UI 或默认的
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold mb-2">哎呀，出错了！</h1>
              <p className="text-foreground/70">
                应用遇到了一个意外的错误。请尝试刷新页面。
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left bg-muted p-4 rounded-lg border border-border">
                <summary className="cursor-pointer font-medium mb-2">
                  错误详情（仅开发环境显示）
                </summary>
                <pre className="text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors"
              >
                重试
              </button>
            </div>

            <div className="mt-6 text-sm text-foreground/60">
              <Link
                href="/"
                className="text-primary hover:underline"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 函数式错误边界包装器（使用 react-error-boundary 库的替代方案）
 * 用于更简单的错误边界需求
 */
export function SimpleErrorBoundary({
  children,
  message = "出错了",
}: {
  children: ReactNode;
  message?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">⚠️ {message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-primary hover:underline"
          >
            刷新页面
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

