"use client"

import { type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface AirbnbModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showClose?: boolean
}

export function AirbnbModal({ isOpen, onClose, title, children, size = "md", showClose = true }: AirbnbModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative w-full bg-card rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.28)] animate-scale-in",
          sizes[size],
          size === "full" ? "overflow-hidden" : "max-h-[90vh] overflow-auto",
        )}
      >
        {(title || showClose) && (
          <div className="sticky top-0 bg-card z-10 flex items-center justify-between px-6 py-4 border-b border-border">
            {showClose && (
              <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
            {title && <h2 className="flex-1 text-center font-semibold text-foreground">{title}</h2>}
            {showClose && <div className="w-9" />}
          </div>
        )}
        <div className={size === "full" ? "h-[calc(100%-65px)] overflow-auto" : ""}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
