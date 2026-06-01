import Link from "next/link";
import { BookOpenText, Mail, Tv } from "lucide-react";

type SiteOwnerContactProps = {
  align?: "start" | "center";
  className?: string;
};

const ownerLinks = [
  {
    label: "邮箱",
    value: "mehhco@163.com",
    href: "mailto:mehhco@163.com",
    icon: Mail,
    badgeClass: "bg-emerald-50 text-emerald-800 ring-emerald-900/10 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-200/15",
  },
  {
    label: "小红书",
    value: "陶笛谱寻路人",
    meta: "ID 506603710",
    href: "https://www.xiaohongshu.com/search_result?keyword=506603710",
    icon: BookOpenText,
    badgeClass: "bg-red-50 text-red-700 ring-red-900/10 dark:bg-red-400/10 dark:text-red-200 dark:ring-red-200/15",
  },
  {
    label: "哔哩哔哩",
    value: "mehhco",
    href: "https://search.bilibili.com/upuser?keyword=mehhco",
    icon: Tv,
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-900/10 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-200/15",
  },
];

export function SiteOwnerContact({ align = "start", className = "" }: SiteOwnerContactProps) {
  const isCentered = align === "center";

  return (
    <div
      className={[
        "flex flex-col gap-3 text-xs text-zinc-500 dark:text-slate-400",
        isCentered ? "items-center text-center" : "items-start",
        className,
      ].filter(Boolean).join(" ")}
    >
      <div className={["flex flex-col gap-1", isCentered ? "items-center" : "items-start"].join(" ")}>
        <p className="font-semibold text-zinc-700 dark:text-slate-200">关注作者</p>
        <p className="max-w-md leading-5">
          获取陶笛谱制作思路、更新记录和使用反馈入口。
        </p>
      </div>

      <div className={["flex flex-wrap gap-2", isCentered ? "justify-center" : "justify-start"].join(" ")}>
        {ownerLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
              className="group inline-flex min-h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-2.5 py-1.5 text-left text-xs text-zinc-600 transition-colors hover:border-emerald-700 hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-emerald-300/60 dark:hover:text-white"
            >
              <Icon className="h-3.5 w-3.5 flex-none text-zinc-400 transition-colors group-hover:text-emerald-700 dark:text-slate-500 dark:group-hover:text-emerald-200" />
              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className={["rounded-sm px-1.5 py-0.5 font-semibold ring-1", item.badgeClass].join(" ")}>
                  {item.label}
                </span>
                <span className="font-medium text-zinc-700 dark:text-slate-200">{item.value}</span>
                {item.meta && <span className="text-zinc-400 dark:text-slate-500">{item.meta}</span>}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
