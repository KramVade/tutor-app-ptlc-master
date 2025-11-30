"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  DollarSign,
  Clock,
} from "lucide-react"

export function MobileNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const navItems: Record<UserRole, { href: string; icon: any; label: string }[]> = {
    parent: [
      { href: "/parent/dashboard", icon: Home, label: "Home" },
      { href: "/parent/tutors", icon: Search, label: "Search" },
      { href: "/parent/bookings", icon: Calendar, label: "Bookings" },
      { href: "/parent/messages", icon: MessageCircle, label: "Messages" },
    ],
    tutor: [
      { href: "/tutor/dashboard", icon: Home, label: "Home" },
      { href: "/tutor/schedule", icon: Clock, label: "Schedule" },
      { href: "/tutor/bookings", icon: Calendar, label: "Bookings" },
      { href: "/tutor/messages", icon: MessageCircle, label: "Messages" },
      { href: "/tutor/earnings", icon: DollarSign, label: "Earnings" },
    ],
    admin: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/users", icon: Users, label: "Users" },
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/admin/payments", icon: CreditCard, label: "Payments" },
      { href: "/admin/moderation", icon: Shield, label: "Moderation" },
    ],
  }

  const items = navItems[user.role]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
