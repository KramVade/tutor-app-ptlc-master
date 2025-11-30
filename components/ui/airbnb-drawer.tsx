"use client"

import { type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface AirbnbDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  position?: "left" | "right" | "bottom"
}

export function AirbnbDrawer({ isOpen, onClose, title, children, position = "right" }: AirbnbDrawerProps) {
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

  if (!isOpen) return null

  const positionStyles = {
    left: "left-0 top-0 h-full w-full max-w-md animate-slide-in-right",
    right: "right-0 top-0 h-full w-full max-w-md",
    bottom: "bottom-0 left-0 w-full max-h-[90vh] rounded-t-2xl",
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/60 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "absolute bg-card shadow-[0_8px_28px_rgba(0,0,0,0.28)]",
          positionStyles[position],
          position === "right" && "animate-slide-in-right",
        )}
        style={position === "right" ? { animationDirection: "normal" } : undefined}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
          {title && <h2 className="flex-1 text-center font-semibold text-foreground">{title}</h2>}
          <div className="w-9" />
        </div>
        <div className="h-[calc(100%-65px)] overflow-auto">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
