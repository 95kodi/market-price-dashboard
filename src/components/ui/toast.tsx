"use client";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
};

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-emerald-600 text-white",
  error: "bg-rose-600 text-white",
  info: "bg-slate-800 text-white"
};

export function Toast({ message, variant = "info", visible }: ToastProps) {

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed right-4 top-4 z-50 transition-all duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className={cn("rounded-2xl px-4 py-3 shadow-xl shadow-slate-900/10", variantClasses[variant])}>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
