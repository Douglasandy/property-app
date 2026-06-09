"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastMessageProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  variant?: "success" | "default";
}

export function ToastMessage({
  message,
  visible,
  onDismiss,
  variant = "success",
}: ToastMessageProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-4 bottom-24 z-50 mx-auto max-w-lg",
        "rounded-xl border px-4 py-3 shadow-card-hover backdrop-blur-md",
        variant === "success"
          ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
          : "border-border bg-white/95 text-navy"
      )}
      role="status"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {variant === "success" && (
          <Check className="size-4 shrink-0 text-emerald-600" />
        )}
        {message}
      </div>
    </div>
  );
}
