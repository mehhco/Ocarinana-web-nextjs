import { Skeleton } from "@/components/ui/skeleton";

export default function NewScoreLoading() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-5 py-10 text-center sm:py-16">
      <div className="mx-auto w-full max-w-3xl space-y-7">
        <div className="flex flex-col items-center">
          <div
            aria-hidden="true"
            className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-normal text-slate-900">正在准备新乐谱...</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">正在检查账号额度并创建草稿，请稍等。</p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <Skeleton className="h-44 bg-white" />
          <Skeleton className="h-44 bg-white" />
        </div>
      </div>
    </main>
  );
}
