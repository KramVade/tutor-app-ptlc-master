"use client"

import type { ReactNode } from "react"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { ToastContainer } from "../ui/toast-container"

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileNav />
      <ToastContainer />
    </div>
  )
}
