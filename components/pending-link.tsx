"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { LoadingButtonContent } from "@/components/loading-button-content";
import { cn } from "@/lib/utils";

type PendingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "children"> & {
    children: ReactNode | ((isPending: boolean) => ReactNode);
    pendingClassName?: string;
    pendingText?: string;
    showPendingSpinner?: boolean;
  };

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function isHashOnlyHref(href: LinkProps["href"]) {
  return typeof href === "string" && href.startsWith("#");
}

export function PendingLink({
  children,
  className,
  href,
  onClick,
  pendingClassName = "pointer-events-none opacity-75",
  pendingText,
  showPendingSpinner = false,
  target,
  ...props
}: PendingLinkProps) {
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(false);
  }, [pathname]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      isModifiedEvent(event) ||
      target === "_blank" ||
      isHashOnlyHref(href)
    ) {
      return;
    }

    const targetUrl = new URL(event.currentTarget.href);
    const currentUrl = new URL(window.location.href);
    targetUrl.hash = "";
    currentUrl.hash = "";

    if (targetUrl.href === currentUrl.href) {
      return;
    }

    setIsPending(true);
  }

  return (
    <Link
      aria-busy={isPending || undefined}
      className={cn(className, isPending && pendingClassName)}
      href={href}
      onClick={handleClick}
      target={target}
      {...props}
    >
      {typeof children === "function" ? (
        children(isPending)
      ) : showPendingSpinner ? (
        <LoadingButtonContent loading={isPending} loadingText={pendingText || "加载中..."}>
          {children}
        </LoadingButtonContent>
      ) : isPending && pendingText ? (
        pendingText
      ) : (
        children
      )}
    </Link>
  );
}
