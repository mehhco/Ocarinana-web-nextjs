import type { ReactNode } from "react";

interface LoadingButtonContentProps {
  loading: boolean;
  loadingText: string;
  children: ReactNode;
}

export function LoadingButtonContent({
  loading,
  loadingText,
  children,
}: LoadingButtonContentProps) {
  if (!loading) return <>{children}</>;

  return (
    <>
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span>{loadingText}</span>
    </>
  );
}
