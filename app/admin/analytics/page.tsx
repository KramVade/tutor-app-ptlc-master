"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"

export default function AdminAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>

        <AirbnbCard>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Analytics page coming soon...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Detailed analytics and insights will be available here.
            </p>
          </div>
        </AirbnbCard>
      </div>
    </PageLayout>
  )
}
