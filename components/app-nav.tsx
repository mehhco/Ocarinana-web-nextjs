import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { isShopEnabled } from "@/lib/supabase/config";

interface AppNavProps {
  currentPath?: string;
}

export async function AppNav({ currentPath = "/" }: AppNavProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const isNotesPage = currentPath.includes("/notes");
  const isShopPage = currentPath.includes("/shop");
  const isClassroomPage = currentPath === "/music-classroom";
  const isScoresPage = currentPath === "/scores" || currentPath.startsWith("/scores/");
  const shopEnabled = await isShopEnabled();

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center">
      <div className="w-full max-w-6xl mx-auto px-5 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="brand-font text-4xl text-emerald-600 drop-shadow transition-colors hover:text-emerald-700"
          >
            Ocarinana
          </Link>
          <div className="hidden md:flex items-center gap-5 text-lg">
            <Link
              href="/scores"
              className={`hover:underline transition-colors ${
                isScoresPage
                  ? "text-emerald-600 font-semibold"
                  : "text-foreground hover:text-emerald-600"
              }`}
            >
              乐谱广场
            </Link>
            <Link
              href="/music-classroom"
              className={`hover:underline transition-colors ${
                isClassroomPage
                  ? "text-emerald-600 font-semibold"
                  : "text-foreground hover:text-emerald-600"
              }`}
            >
              音乐课堂
            </Link>
            {user && (
              <Link
                href={`/${user.id}/notes`}
                className={`hover:underline transition-colors ${
                  isNotesPage
                    ? "text-emerald-600 font-semibold"
                    : "text-foreground hover:text-emerald-600"
                }`}
              >
                我的乐谱
              </Link>
            )}
            {shopEnabled && (
              <Link
                href="/shop"
                className={`hover:underline transition-colors ${
                  isShopPage
                    ? "text-emerald-600 font-semibold"
                    : "text-foreground hover:text-emerald-600"
                }`}
              >
                精选陶笛
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
