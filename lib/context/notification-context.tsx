"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useAuth } from "./auth-context"

interface Notification {
  id: string
  type: "booking" | "message" | "payment" | "system"
  title: string
  message?: string
  read: boolean
  link?: string
  createdAt: string
}

interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message?: string
}

interface NotificationContextType {
  notifications: Notification[]
  toasts: Toast[]
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  showToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
  unreadCount: number
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load notifications from Firebase with real-time updates
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    let unsubscribe: (() => void) | undefined

    const setupNotifications = async () => {
      try {
        const { subscribeToNotifications } = await import("@/firebase/notifications")
        
        unsubscribe = subscribeToNotifications(user.id, (notifs) => {
          setNotifications(notifs as any)
          setIsLoading(false)
        })
      } catch (error) {
        console.error('Error setting up notifications:', error)
        setIsLoading(false)
      }
    }

    setupNotifications()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    if (!user) return

    try {
      const { addNotification: addNotificationToFirebase } = await import("@/firebase/notifications")
      await addNotificationToFirebase({
        ...notification,
        userId: user.id,
        read: false,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }, [user])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { markNotificationAsRead } = await import("@/firebase/notifications")
      await markNotificationAsRead(id)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const { markAllNotificationsAsRead } = await import("@/firebase/notifications")
      await markAllNotificationsAsRead(user.id)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const newToast: Toast = { ...toast, id: `toast_${Date.now()}` }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        addNotification,
        markAsRead,
        markAllAsRead,
        showToast,
        dismissToast,
        unreadCount,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
