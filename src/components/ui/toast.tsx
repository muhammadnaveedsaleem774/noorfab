"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (m: string) => console.log("[toast]", m),
      success: (m: string) => console.log("[toast]", m),
      error: (m: string) => console.error("[toast]", m),
      info: (m: string) => console.log("[toast]", m),
    };
  }
  return ctx;
}

function ToastItemComponent({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { id, type, message } = item;
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };
  const Icon = icons[type];
  const colors = {
    success: "border-green-500/50 bg-green-50 text-green-800",
    error: "border-red-500/50 bg-red-50 text-red-800",
    info: "border-[#C4A747]/50 bg-[#C4A747]/10 text-[#333333]",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex min-w-[280px] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg",
        colors[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-1 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const remove = useCallback((id: string) => {
    const t = timeoutsRef.current.get(id);
    if (t) clearTimeout(t);
    timeoutsRef.current.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType = "info", duration = DEFAULT_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const item: ToastItem = { id, type, message, duration };
      setItems((prev) => [...prev, item]);
      if (duration > 0) {
        const t = setTimeout(() => remove(id), duration);
        timeoutsRef.current.set(id, t);
      }
    },
    [remove]
  );

  const value: ToastContextValue = {
    toast: add,
    success: (m, d) => add(m, "success", d),
    error: (m, d) => add(m, "error", d),
    info: (m, d) => add(m, "info", d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {hasMounted &&
        createPortal(
          <div
            className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
            aria-label="Notifications"
          >
            {items.map((item) => (
              <ToastItemComponent key={item.id} item={item} onDismiss={remove} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
