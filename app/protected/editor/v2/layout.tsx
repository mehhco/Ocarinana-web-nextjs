import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "乐谱编辑器 v2 - Ocarinana",
  description: "陶笛简谱编辑器，支持六孔和十二孔陶笛简谱与指法图。",
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
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      {children}
    </div>
  );
}
