import Link from "next/link";
import { Globe } from "lucide-react";

interface LanguageSwitchProps {
  href: string;
  hrefLang: string;
  label: string;
  title: string;
}

/**
 * 语言切换入口。
 *
 * 放在页头右侧工具区（登录按钮旁），而不是混进主导航：
 * 主导航回答"我要去哪个功能"，语言切换属于全局设置，
 * 混在一起会让导航层级变乱，也不符合多数站点把语言放在页头右上角的习惯。
 */
export function LanguageSwitch({ href, hrefLang, label, title }: LanguageSwitchProps) {
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      aria-label={title}
      title={title}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-current px-2.5 text-xs font-semibold opacity-70 transition-opacity hover:opacity-100 sm:px-3"
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
