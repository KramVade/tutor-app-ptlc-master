"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/context/auth-context"
import { DataProvider } from "@/lib/context/data-context"
import { NotificationProvider } from "@/lib/context/notification-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </DataProvider>
    </AuthProvider>
  )
}
