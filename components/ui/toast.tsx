"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function Toast({ id, title, description, variant = "default" }: ToastProps) {
  const { removeToast } = useToast();

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
        {
          "bg-background border-border": variant === "default",
          "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900":
            variant === "success",
          "bg-destructive/10 border-destructive/50": variant === "destructive",
        }
      )}
    >
      <div className="flex-1 space-y-1">
        {title && (
          <p
            className={cn("text-sm font-medium", {
              "text-foreground": variant === "default",
              "text-green-700 dark:text-green-300": variant === "success",
              "text-destructive": variant === "destructive",
            })}
          >
            {title}
          </p>
        )}
        {description && (
          <p
            className={cn("text-sm", {
              "text-muted-foreground": variant === "default",
              "text-green-600 dark:text-green-400": variant === "success",
              "text-destructive/80": variant === "destructive",
            })}
          >
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
