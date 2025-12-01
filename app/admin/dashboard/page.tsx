"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { StatsCard } from "@/components/admin/stats-card"
import { ChartCard } from "@/components/admin/chart-card"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { Users, GraduationCap, Calendar, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  activeTutors: number
  totalParents: number
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  revenue: number
  bookingsTrend: Array<{ month: string; bookings: number }>
  revenueTrend: Array<{ month: string; revenue: number }>
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeTutors: 0,
    totalParents: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    revenue: 0,
    bookingsTrend: [],
    revenueTrend: []
  })
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true)
      console.log('📊 Loading admin dashboard data...')
      
      // Load all data from Firebase
      const [
        { getAllTutors },
        { getAllParents },
        { getAllBookings }
      ] = await Promise.all([
        import("@/firebase/tutors"),
        import("@/firebase/parents"),
        import("@/firebase/bookings")
      ])

      const [tutors, parents, bookings] = await Promise.all([
        getAllTutors(),
        getAllParents(),
        getAllBookings()
      ])

      console.log('✅ Data loaded:', { tutors: tutors.length, parents: parents.length, bookings: bookings.length })

      // Calculate stats
      const activeTutors = tutors.filter((t: any) => t.available).length
      const completedBookings = bookings.filter((b: any) => b.status === 'completed')
      const pendingBookings = bookings.filter((b: any) => b.status === 'pending')
      
      // Calculate revenue from completed bookings
      const totalRevenue = completedBookings.reduce((sum: number, b: any) => 
        sum + (b.totalPrice || 0), 0
      )

      // Calculate monthly trends (last 6 months)
      const monthlyData = calculateMonthlyTrends(bookings)

      setStats({
        totalUsers: tutors.length + parents.length,
        activeTutors,
        totalParents: parents.length,
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        pendingBookings: pendingBookings.length,
        revenue: totalRevenue,
        bookingsTrend: monthlyData.bookings,
        revenueTrend: monthlyData.revenue
      })
    } catch (error) {
      console.error('❌ Error loading admin dashboard data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const calculateMonthlyTrends = (bookings: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const last6Months = []

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        monthIndex: date.getMonth()
      })
    }

    // Calculate bookings and revenue per month
    const bookingsTrend = last6Months.map(({ month, year, monthIndex }) => {
      const monthBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.date)
        return bookingDate.getMonth() === monthIndex && 
               bookingDate.getFullYear() === year
      })
      return { month, bookings: monthBookings.length }
    })

    const revenueTrend = last6Months.map(({ month, year, monthIndex }) => {
      const monthBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.date)
        return bookingDate.getMonth() === monthIndex && 
               bookingDate.getFullYear() === year &&
               b.status === 'completed'
      })
      const revenue = monthBookings.reduce((sum: number, b: any) => 
        sum + (b.totalPrice || 0), 0
      )
      return { month, revenue }
    })

    return { bookings: bookingsTrend, revenue: revenueTrend }
  }

  if (isLoading || !user || isLoadingData) {
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
            value={stats.totalUsers.toLocaleString()}
            icon={<Users className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Active Tutors"
            value={stats.activeTutors.toString()}
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            icon={<Calendar className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Revenue"
            value={`₱${stats.revenue.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-primary" />}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ChartCard
            title="Bookings Trend"
            subtitle="Monthly bookings over the past 6 months"
            data={stats.bookingsTrend}
            type="line"
            dataKey="bookings"
            xAxisKey="month"
          />
          <ChartCard
            title="Revenue Trend"
            subtitle="Monthly revenue over the past 6 months"
            data={stats.revenueTrend}
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
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-semibold">Pending Bookings</p>
                  <p className="text-sm text-muted-foreground">{stats.pendingBookings} awaiting confirmation</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </AirbnbCard>
          </Link>
          <Link href="/admin/users">
            <AirbnbCard hoverable className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Total Parents</p>
                  <p className="text-sm text-muted-foreground">{stats.totalParents} registered parents</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </AirbnbCard>
          </Link>
          <Link href="/admin/analytics">
            <AirbnbCard hoverable className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold">Completed Sessions</p>
                  <p className="text-sm text-muted-foreground">{stats.completedBookings} sessions completed</p>
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
