"use client"

import { useNotification } from "@/lib/context/notification-context"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function ToastContainer() {
  const { toasts, dismissToast } = useNotification()

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-primary" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 bg-card rounded-xl border border-border shadow-[0_4px_14px_rgba(0,0,0,0.12)]",
            "animate-slide-up min-w-[300px] max-w-[400px]",
          )}
        >
          {icons[toast.type]}
          <div className="flex-1">
            <p className="font-semibold text-foreground">{toast.title}</p>
            {toast.message && <p className="text-sm text-muted-foreground mt-1">{toast.message}</p>}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
