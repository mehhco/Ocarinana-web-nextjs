import { Skeleton } from "@/components/ui/skeleton";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

type RouteLoadingVariant = "scores" | "classroom" | "shop" | "notes";

interface RouteLoadingStateProps {
  variant: RouteLoadingVariant;
}

const publicTabLabels = ["乐谱广场", "音乐课堂", "陶笛推荐"];

const pageCopy: Record<RouteLoadingVariant, { title: string; description: string }> = {
  scores: {
    title: "乐谱广场",
    description: "正在加载公开乐谱和筛选条件...",
  },
  classroom: {
    title: "音乐课堂",
    description: "正在准备课程目录和学习内容...",
  },
  shop: {
    title: "陶笛推荐",
    description: "正在整理陶笛分类和推荐信息...",
  },
  notes: {
    title: "我的",
    description: "正在同步你的个人中心...",
  },
};

async function hasSupabaseSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.getAll().some((cookie) => {
    const name = cookie.name.toLowerCase();
    return name.startsWith("sb-") && name.includes("auth-token") && Boolean(cookie.value);
  });
}

function StaticLoadingNav({
  activeLabel,
  showPrivateTab,
  variant,
}: {
  activeLabel: string;
  showPrivateTab: boolean;
  variant: RouteLoadingVariant;
}) {
  const tabLabels =
    showPrivateTab
      ? ["我的", "乐谱广场", "音乐课堂", "陶笛推荐"]
      : publicTabLabels;
  const isClassroom = variant === "classroom";
  const isShop = variant === "shop";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
        isClassroom &&
          "border-lime-950/10 bg-[#eef3dd] supports-[backdrop-filter]:bg-[#eef3dd]/92 dark:border-white/10 dark:bg-[#111908] dark:supports-[backdrop-filter]:bg-[#111908]/94",
        isShop &&
          "border-teal-950/10 bg-[#e5f3f1] supports-[backdrop-filter]:bg-[#e5f3f1]/92 dark:border-white/10 dark:bg-[#061719] dark:supports-[backdrop-filter]:bg-[#061719]/94",
        !isClassroom &&
          !isShop &&
          "border-emerald-950/10 bg-white/78 dark:border-white/10 dark:bg-zinc-950/76",
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-2 md:h-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-7 md:px-5 md:py-0">
        <div
          className={cn(
            "brand-font truncate text-3xl md:text-4xl",
            isClassroom && "text-lime-800 dark:text-lime-200",
            isShop && "text-teal-800 dark:text-teal-200",
            !isClassroom && !isShop && "text-emerald-700",
          )}
        >
          Ocarinana
        </div>
        <div className="justify-self-end">
          <Skeleton className="h-9 w-24 bg-zinc-200/80 dark:bg-white/10" />
        </div>
        <div className="col-span-2 overflow-x-auto scrollbar-hide md:col-span-1 md:col-start-2 md:row-start-1">
          <div className="inline-flex h-10 min-w-max items-center gap-1">
            {tabLabels.map((label) => (
              <span
                key={label}
                className={
                  label === activeLabel
                    ? cn(
                        "relative inline-flex h-10 items-center px-3 text-sm font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full",
                        isClassroom && "text-lime-800 after:bg-lime-700 dark:text-lime-100 dark:after:bg-lime-300",
                        isShop && "text-teal-800 after:bg-teal-700 dark:text-teal-100 dark:after:bg-teal-300",
                        !isClassroom && !isShop && "text-emerald-800 after:bg-emerald-600 dark:text-emerald-100 dark:after:bg-emerald-300",
                      )
                    : cn(
                        "inline-flex h-10 items-center px-3 text-sm font-medium",
                        isClassroom && "text-lime-950/70 dark:text-lime-50/72",
                        isShop && "text-teal-950/70 dark:text-teal-50/72",
                        !isClassroom && !isShop && "text-zinc-600 dark:text-zinc-300",
                      )
                }
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeaderSkeleton({ variant }: { variant: RouteLoadingVariant }) {
  const copy = pageCopy[variant];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-3xl font-bold text-zinc-950 dark:text-white">
          {copy.title}
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          {copy.description}
        </p>
      </div>
      <Skeleton className="h-10 w-32 bg-zinc-200/80 dark:bg-white/10" />
    </div>
  );
}

function ScoresSkeleton() {
  return (
    <>
      <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_160px_160px_160px_auto] dark:border-white/10 dark:bg-white/[0.04]">
        <Skeleton className="h-10 bg-zinc-200/80 dark:bg-white/10" />
        <Skeleton className="h-10 bg-zinc-200/80 dark:bg-white/10" />
        <Skeleton className="h-10 bg-zinc-200/80 dark:bg-white/10" />
        <Skeleton className="h-10 bg-zinc-200/80 dark:bg-white/10" />
        <Skeleton className="h-10 w-20 bg-zinc-200/80 dark:bg-white/10" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Skeleton className="h-5 w-4/5 bg-zinc-200/80 dark:bg-white/10" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-14 bg-zinc-200/80 dark:bg-white/10" />
              <Skeleton className="h-6 w-16 bg-zinc-200/80 dark:bg-white/10" />
            </div>
            <Skeleton className="mt-5 h-4 w-2/3 bg-zinc-200/80 dark:bg-white/10" />
            <Skeleton className="mt-2 h-4 w-1/2 bg-zinc-200/80 dark:bg-white/10" />
            <Skeleton className="mt-5 h-9 w-full bg-zinc-200/80 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </>
  );
}

function ClassroomSkeleton() {
  return (
    <>
      <div className="grid gap-10 rounded-lg border border-lime-950/10 bg-[#eef3dd] p-6 md:grid-cols-[1.05fr_0.95fr] dark:border-white/10 dark:bg-[#111908]">
        <div>
          <Skeleton className="h-4 w-40 bg-lime-900/15 dark:bg-lime-200/10" />
          <Skeleton className="mt-5 h-12 w-56 bg-lime-900/15 dark:bg-lime-200/10" />
          <Skeleton className="mt-5 h-4 w-full bg-lime-900/15 dark:bg-lime-200/10" />
          <Skeleton className="mt-3 h-4 w-5/6 bg-lime-900/15 dark:bg-lime-200/10" />
          <Skeleton className="mt-8 h-11 w-36 bg-lime-900/15 dark:bg-lime-200/10" />
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
          <Skeleton className="h-5 w-32 bg-zinc-200/80 dark:bg-white/10" />
          <div className="mt-4 grid gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 bg-zinc-200/80 dark:bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 bg-zinc-200/80 dark:bg-white/10" />
        ))}
      </div>
    </>
  );
}

function ShopSkeleton() {
  return (
    <>
      <div className="grid gap-10 rounded-lg border border-teal-950/10 bg-[#e5f3f1] p-6 md:grid-cols-[1.1fr_0.9fr] dark:border-white/10 dark:bg-[#061719]">
        <div>
          <Skeleton className="h-4 w-44 bg-teal-900/15 dark:bg-teal-200/10" />
          <Skeleton className="mt-5 h-11 w-4/5 bg-teal-900/15 dark:bg-teal-200/10" />
          <Skeleton className="mt-5 h-4 w-full bg-teal-900/15 dark:bg-teal-200/10" />
          <Skeleton className="mt-3 h-4 w-5/6 bg-teal-900/15 dark:bg-teal-200/10" />
          <Skeleton className="mt-7 h-11 w-36 bg-teal-900/15 dark:bg-teal-200/10" />
        </div>
        <Skeleton className="h-44 bg-white/70 dark:bg-white/10" />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 bg-zinc-200/80 dark:bg-white/10" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 bg-zinc-200/80 dark:bg-white/10" />
        ))}
      </div>
    </>
  );
}

function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <Skeleton className="h-5 w-3/4 bg-zinc-200/80 dark:bg-white/10" />
          <Skeleton className="mt-4 h-4 w-1/2 bg-zinc-200/80 dark:bg-white/10" />
          <Skeleton className="mt-2 h-4 w-2/3 bg-zinc-200/80 dark:bg-white/10" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-8 flex-1 bg-zinc-200/80 dark:bg-white/10" />
            <Skeleton className="h-8 flex-1 bg-zinc-200/80 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BodySkeleton({ variant }: { variant: RouteLoadingVariant }) {
  if (variant === "scores") return <ScoresSkeleton />;
  if (variant === "classroom") return <ClassroomSkeleton />;
  if (variant === "shop") return <ShopSkeleton />;
  return <NotesSkeleton />;
}

function getProgressColor(variant: RouteLoadingVariant) {
  if (variant === "classroom") {
    return "bg-lime-600 dark:bg-lime-300";
  }

  if (variant === "shop") {
    return "bg-teal-600 dark:bg-teal-300";
  }

  return "bg-emerald-600 dark:bg-emerald-300";
}

export async function RouteLoadingState({ variant }: RouteLoadingStateProps) {
  const showPrivateTab = variant === "notes" || (await hasSupabaseSessionCookie());
  const activeLabel =
    variant === "scores"
      ? "乐谱广场"
      : variant === "classroom"
        ? "音乐课堂"
        : variant === "shop"
          ? "陶笛推荐"
          : "我的";

  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-slate-950 dark:text-white">
      <StaticLoadingNav
        activeLabel={activeLabel}
        showPrivateTab={showPrivateTab}
        variant={variant}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8">
        <HeaderSkeleton variant={variant} />
        <div className="relative h-1 overflow-hidden rounded-full bg-emerald-900/10 dark:bg-white/10">
          <div className={`absolute inset-y-0 left-0 w-1/3 animate-[loading-slide_1.1s_ease-in-out_infinite] rounded-full ${getProgressColor(variant)}`} />
        </div>
        <BodySkeleton variant={variant} />
      </div>
    </main>
  );
}
