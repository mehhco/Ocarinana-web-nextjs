import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Spicy_Rice } from "next/font/google";
import { Plus } from "lucide-react";

const spicyRice = Spicy_Rice({ subsets: ["latin"], weight: "400", display: "swap" });

interface AppNavProps {
  currentPath?: string;
}

export async function AppNav({ currentPath = "/" }: AppNavProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const isNotesPage = currentPath.includes("/notes");

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center">
      <div className="w-full max-w-6xl mx-auto px-5 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className={`${spicyRice.className} font-bold text-4xl text-emerald-600 drop-shadow hover:text-emerald-700 transition-colors`}
          >
            Ocarinana
          </Link>
          <div className="hidden md:flex items-center gap-5 text-lg">
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
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/protected/scores/new">
                <Plus className="mr-1 h-4 w-4" />
                新建
              </Link>
            </Button>
          )}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}

