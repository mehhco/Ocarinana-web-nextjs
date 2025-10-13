"use client";

import dynamic from "next/dynamic";
import { EditorLoading } from "@/components/editor-loading";

// 性能优化：动态导入 ScoresBridge 组件
// 这个组件是客户端组件，包含较多逻辑，延迟加载可以减少初始 Bundle
const ScoresBridge = dynamic(
  () => import("@/components/scores-bridge"),
  {
    ssr: false, // 编辑器不需要服务端渲染
    loading: () => <EditorLoading />, // 显示加载状态
  }
);

interface EditorClientWrapperProps {
  iframeId: string;
}

export function EditorClientWrapper({ iframeId }: EditorClientWrapperProps) {
  return (
    <>
      {/* 性能优化：ScoresBridge 组件已动态导入，只在需要时加载 */}
      <ScoresBridge iframeId={iframeId} />
      <iframe
        id={iframeId}
        src="/webfile/index.html"
        title="交互式简谱生成器"
        className="w-full h-full border-0"
      />
    </>
  );
}

