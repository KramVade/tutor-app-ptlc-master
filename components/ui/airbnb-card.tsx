"use client"

import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AirbnbCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export const AirbnbCard = forwardRef<HTMLDivElement, AirbnbCardProps>(
  ({ className, hoverable = false, padding = "md", children, ...props }, ref) => {
    const paddingSizes = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-card rounded-xl border border-border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
          hoverable && "hover-lift cursor-pointer",
          paddingSizes[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

AirbnbCard.displayName = "AirbnbCard"
