"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showSuccess, showError, showLoading } from "@/lib/toast";

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    const loadingToast = showLoading("正在导出您的数据...");

    try {
      const response = await fetch("/api/user/export", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("导出失败");
      }

      // 获取文件名
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") ||
          `ocarinana-data-${Date.now()}.json`
        : `ocarinana-data-${Date.now()}.json`;

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess("数据导出成功！");
    } catch (error) {
      console.error("导出失败:", error);
      showError("导出数据失败，请稍后重试");
    } finally {
      setIsExporting(false);
      // 关闭加载提示
      if (loadingToast) {
        const toast = await import("react-hot-toast");
        toast.default.dismiss(loadingToast);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showError('请输入 "DELETE" 以确认删除');
      return;
    }

    setIsDeleting(true);
    const loadingToast = showLoading("正在删除您的账户...");

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "删除失败");
      }

      showSuccess("账户已成功删除。再见！");
      
      // 等待一会儿让用户看到消息
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("删除失败:", error);
      showError(
        error instanceof Error ? error.message : "删除账户失败，请稍后重试"
      );
      setIsDeleting(false);
    } finally {
      // 关闭加载提示
      if (loadingToast) {
        const toast = await import("react-hot-toast");
        toast.default.dismiss(loadingToast);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航 */}
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <Link
            href="/protected/scores"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            ← 返回我的乐谱
          </Link>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="flex-1 max-w-4xl mx-auto px-5 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">账户设置</h1>

        {/* 数据导出 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">数据导出</h2>
          <p className="text-foreground/70 mb-6">
            根据 GDPR 和 CCPA，您有权获取我们存储的所有关于您的数据。
            导出的数据包括您的账户信息和所有乐谱。
          </p>

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? "正在导出..." : "📥 导出我的数据"}
          </button>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-foreground/80">
              <strong>提示：</strong>导出的数据为 JSON 格式，包含您的所有乐谱和账户信息。
              您可以使用此文件备份数据或迁移到其他服务。
            </p>
          </div>
        </section>

        {/* 删除账户 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-destructive">
            删除账户
          </h2>
          <p className="text-foreground/70 mb-6">
            删除您的账户将永久删除您的所有数据，包括所有乐谱、设置和个人信息。
            <strong className="text-destructive">此操作不可撤销！</strong>
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              🗑️ 删除我的账户
            </button>
          ) : (
            <div className="border border-destructive rounded-lg p-6 bg-destructive/10">
              <h3 className="text-lg font-semibold mb-4">
                ⚠️ 确认删除账户
              </h3>

              <div className="space-y-4">
                <div className="bg-background border border-border rounded p-4">
                  <p className="text-sm mb-2">
                    <strong>删除后将发生以下情况：</strong>
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-foreground/80">
                    <li>所有乐谱将被永久删除</li>
                    <li>您的账户信息将被移除</li>
                    <li>此操作无法撤销</li>
                    <li>您将立即登出</li>
                  </ul>
                </div>

                <div>
                  <label
                    htmlFor="delete-confirm"
                    className="block text-sm font-medium mb-2"
                  >
                    请输入 <code className="px-1 py-0.5 bg-muted rounded">DELETE</code> 以确认：
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-2 border border-border rounded-md bg-background"
                    disabled={isDeleting}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== "DELETE"}
                    className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "正在删除..." : "确认删除账户"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    disabled={isDeleting}
                    className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 相关链接 */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-sm font-semibold mb-3">相关文档</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/legal/privacy"
              className="text-primary hover:underline"
            >
              隐私政策
            </Link>
            <Link href="/legal/terms" className="text-primary hover:underline">
              用户协议
            </Link>
            <Link
              href="/legal/cookies"
              className="text-primary hover:underline"
            >
              Cookie 政策
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

