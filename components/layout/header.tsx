"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { cn } from "@/lib/utils"
import { Bell, Menu, X, User, LogOut, Settings, ChevronDown, GraduationCap } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAllAsRead } = useNotification()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const roleLinks: Record<UserRole, { href: string; label: string }[]> = {
    parent: [
      { href: "/parent/dashboard", label: "Dashboard" },
      { href: "/parent/tutors", label: "Find Tutors" },
      { href: "/parent/bookings", label: "Bookings" },
      { href: "/parent/payments", label: "Payments" },
      { href: "/parent/children", label: "Manage Children" },
      { href: "/parent/messages", label: "Messages" },
    ],
    tutor: [
      { href: "/tutor/dashboard", label: "Dashboard" },
      { href: "/tutor/schedule", label: "Schedule" },
      { href: "/tutor/bookings", label: "Bookings" },
      { href: "/tutor/messages", label: "Messages" },
      { href: "/tutor/earnings", label: "Earnings" },
    ],
    admin: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/tutors", label: "Tutors" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/moderation", label: "Moderation" },
    ],
  }

  const links = user ? roleLinks[user.role] : []

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? `/${user.role}/dashboard` : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PTLC Digital Coach</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications)
                      setShowUserMenu(false)
                    }}
                    className="relative p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-[0_2px_16px_rgba(0,0,0,0.12)] animate-scale-in">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="font-semibold">Notifications</span>
                        <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-muted-foreground">No notifications</p>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              className={cn(
                                "px-4 py-3 border-b border-border last:border-0 hover:bg-secondary transition-colors cursor-pointer",
                                !notif.read && "bg-primary/5",
                              )}
                            >
                              <p className="font-medium text-sm">{notif.title}</p>
                              {notif.message && <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu)
                      setShowNotifications(false)
                    }}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-border hover:shadow-md transition-all"
                  >
                    <img
                      src={user.avatar || `/placeholder.svg?height=32&width=32&query=avatar`}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-[0_2px_16px_rgba(0,0,0,0.12)] animate-scale-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href={user.role === "tutor" ? "/tutor/profile" : "#"}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && showMobileMenu && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
