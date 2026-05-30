"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LoadingButtonContent } from "@/components/loading-button-content";

type PendingSubmitButtonProps = ButtonProps & {
  loadingText?: string;
};

export function PendingSubmitButton({
  children,
  loadingText = "提交中...",
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} aria-busy={pending} {...props}>
      <LoadingButtonContent loading={pending} loadingText={loadingText}>
        {children}
      </LoadingButtonContent>
    </Button>
  );
}
