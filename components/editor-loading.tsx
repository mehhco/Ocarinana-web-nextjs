import { Skeleton } from "@/components/ui/skeleton";

export function EditorLoading() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-16 w-screen bg-background p-4">
      <div className="h-full w-full space-y-4">
        {/* 工具栏骨架 */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 flex-1" />
        </div>
        
        {/* 编辑器主体骨架 */}
        <Skeleton className="h-[calc(100%-3rem)] w-full" />
        
        {/* 加载提示 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">加载编辑器中...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

