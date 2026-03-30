import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '乐谱编辑器 v2 - Ocarinana',
  description: '陶笛简谱编辑器，支持双轨显示简谱+指法图',
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
    <div className="-mx-5 -mt-5 flex h-[calc(100%+1.25rem)] min-h-0 w-[calc(100%+2.5rem)] flex-1 overflow-hidden">
      {children}
    </div>
  );
}
