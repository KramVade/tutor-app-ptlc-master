"use client"

import type React from "react"

import { AirbnbCard } from "../ui/airbnb-card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: "up" | "down"
}

export function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  return (
    <AirbnbCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                trend === "up" ? "text-success" : "text-destructive",
              )}
            >
              {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(change)}%<span className="text-muted-foreground font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-secondary rounded-xl">{icon}</div>
      </div>
    </AirbnbCard>
  )
}
