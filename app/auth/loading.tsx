export default function AuthLoading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border bg-white p-8 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent"
        />
        <div>
          <p className="text-sm font-medium text-zinc-900">正在打开页面...</p>
          <p className="mt-1 text-xs text-zinc-500">网络较慢时请稍等片刻</p>
        </div>
      </div>
    </div>
  );
}
