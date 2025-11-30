"use client"

import type React from "react"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface AirbnbButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive"
  size?: "sm" | "md" | "lg" | "xl"
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const AirbnbButton = forwardRef<HTMLButtonElement, AirbnbButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 press-effect focus:outline-none focus:ring-2 focus:ring-offset-2"

    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-dark focus:ring-primary",
      secondary: "bg-secondary text-secondary-foreground hover:bg-neutral-border focus:ring-muted-foreground",
      outline:
        "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background focus:ring-foreground",
      ghost: "text-foreground hover:bg-secondary focus:ring-muted-foreground",
      link: "text-primary underline-offset-4 hover:underline focus:ring-primary p-0",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
    }

    const sizes = {
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
      xl: "h-14 px-8 text-lg gap-3",
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  },
)

AirbnbButton.displayName = "AirbnbButton"
