"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { StatsCard } from "@/components/admin/stats-card"
import { ChartCard } from "@/components/admin/chart-card"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { mockAnalytics } from "@/lib/mock-data"
import { Users, GraduationCap, Calendar, DollarSign, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Users"
            value={mockAnalytics.totalUsers.toLocaleString()}
            change={8}
            trend="up"
            icon={<Users className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Active Tutors"
            value={mockAnalytics.activeTutors}
            change={12}
            trend="up"
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Total Bookings"
            value={mockAnalytics.totalBookings.toLocaleString()}
            change={15}
            trend="up"
            icon={<Calendar className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Revenue"
            value={`$${(mockAnalytics.revenue / 1000).toFixed(0)}K`}
            change={10}
            trend="up"
            icon={<DollarSign className="h-6 w-6 text-primary" />}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ChartCard
            title="Bookings Trend"
            subtitle="Monthly bookings over the past 6 months"
            data={mockAnalytics.bookingsTrend}
            type="line"
            dataKey="bookings"
            xAxisKey="month"
          />
          <ChartCard
            title="Revenue Trend"
            subtitle="Monthly revenue over the past 6 months"
            data={mockAnalytics.revenueTrend}
            type="bar"
            dataKey="revenue"
            xAxisKey="month"
            color="#00A699"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/admin/tutors">
            <AirbnbCard hoverable className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-semibold">Pending Verifications</p>
                  <p className="text-sm text-muted-foreground">3 tutors awaiting review</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </AirbnbCard>
          </Link>
          <Link href="/admin/moderation">
            <AirbnbCard hoverable className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">Content Reports</p>
                  <p className="text-sm text-muted-foreground">2 reports need attention</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </AirbnbCard>
          </Link>
          <Link href="/admin/analytics">
            <AirbnbCard hoverable className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Detailed platform insights</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </AirbnbCard>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
