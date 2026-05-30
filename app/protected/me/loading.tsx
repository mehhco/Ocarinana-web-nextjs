import { Skeleton } from "@/components/ui/skeleton";

export default function MeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 py-4">
      <header className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-emerald-800">个人中心</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-zinc-950">我的</h1>
          <p className="mt-2 text-sm text-zinc-600">正在同步你的个人中心...</p>
        </div>
        <div className="h-11 border-b border-zinc-200">
          <div className="flex gap-2">
            <Skeleton className="h-11 w-20" />
            <Skeleton className="h-11 w-16" />
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-28" />
          </div>
        </div>
      </header>
      <div className="relative h-1 overflow-hidden rounded-full bg-emerald-900/10">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-[loading-slide_1.1s_ease-in-out_infinite] rounded-full bg-emerald-600" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    </div>
  );
}
