import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '乐谱编辑器 v2 - Ocarinana',
  description: '全新版本的乐谱编辑器，使用 React + TypeScript 构建',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditorV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}
