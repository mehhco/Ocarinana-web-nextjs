import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PendingLink } from "@/components/pending-link";
import { sanitizeNextPath } from "@/lib/auth/safe-next";

interface SignUpSuccessPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function Page({ searchParams }: SignUpSuccessPageProps) {
  const params = await searchParams;
  const targetPath = sanitizeNextPath(params.next);
  const loginHref =
    targetPath === "/" ? "/auth/login" : `/auth/login?next=${encodeURIComponent(targetPath)}`;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                注册成功！
              </CardTitle>
              <CardDescription>您的账户已创建成功</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                恭喜您，账户注册成功！现在可以使用您的邮箱和密码登录了。
              </p>
              {targetPath !== "/" && (
                <p className="text-sm text-muted-foreground">
                  登录后会回到刚才的编辑器，继续保存你正在写的乐谱。
                </p>
              )}
              <Button asChild className="w-full">
                <PendingLink href={loginHref} pendingText="打开中..." showPendingSpinner>
                  立即登录
                </PendingLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
