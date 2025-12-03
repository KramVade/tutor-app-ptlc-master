"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { BookingCard } from "@/components/booking/booking-card"
import { Calendar, DollarSign, Users, ArrowRight, Clock, Star } from "lucide-react"
import Link from "next/link"

export default function TutorDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [earnings, setEarnings] = useState({
    thisMonth: 0,
    sessionsThisMonth: 0
  })
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    } else if (!isLoading && user && user.role === "tutor") {
      // Check if tutor is pending approval
      const isPending = localStorage.getItem("ptlcDigitalCoach_pendingApproval")
      if (isPending === "true") {
        router.push("/tutor/pending-approval")
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setIsLoadingData(true)
      
      // Load bookings from Firebase
      const { getBookingsByTutorId } = await import("@/firebase/bookings")
      const bookingsData = await getBookingsByTutorId(user.id)
      
      setBookings(bookingsData)
      
      // Calculate earnings from PTLC payouts (not just verified payments)
      const { getPaymentsByTutorId } = await import("@/firebase/payments")
      const paymentsData = await getPaymentsByTutorId(user.id)
      
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      // Get payments that PTLC has actually paid to tutor this month
      const thisMonthPaid = paymentsData.filter((p: any) => {
        if (p.tutorPayoutStatus !== 'paid') return false
        const payoutDate = new Date(p.tutorPayoutDate || p.createdAt)
        return payoutDate.getMonth() === currentMonth && 
               payoutDate.getFullYear() === currentYear
      })
      
      // Calculate actual earnings (money received from PTLC)
      const monthlyEarnings = thisMonthPaid.reduce((sum: number, p: any) => sum + (p.tutorAmount || 0), 0)
      
      setEarnings({
        thisMonth: monthlyEarnings,
        sessionsThisMonth: thisMonthPaid.length
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setBookings([])
      setEarnings({ thisMonth: 0, sessionsThisMonth: 0 })
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isLoading || !user || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed")

  const stats = [
    { label: "This Month", value: `₱${earnings.thisMonth}`, icon: DollarSign, change: 12, trend: "up" as const },
    { label: "Pending Requests", value: pendingBookings.length, icon: Clock },
    { label: "Upcoming Sessions", value: upcomingBookings.length, icon: Calendar },
    { label: "Total Sessions", value: earnings.sessionsThisMonth, icon: Users },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your tutoring business.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <AirbnbCard key={i}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </AirbnbCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pending Requests</h2>
              <Link href="/tutor/bookings">
                <AirbnbButton variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </AirbnbButton>
              </Link>
            </div>

            {pendingBookings.length === 0 ? (
              <AirbnbCard className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">New booking requests will appear here.</p>
              </AirbnbCard>
            ) : (
              <div className="space-y-4">
                {pendingBookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="tutor" />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upcoming Sessions</h2>
              <Link href="/tutor/bookings">
                <AirbnbButton variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </AirbnbButton>
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <AirbnbCard className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground">Confirmed sessions will appear here.</p>
              </AirbnbCard>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="tutor" showActions={false} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/tutor/schedule">
              <AirbnbCard hoverable className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Manage Schedule</p>
                  <p className="text-sm text-muted-foreground">Update availability</p>
                </div>
              </AirbnbCard>
            </Link>
            <Link href="/tutor/profile">
              <AirbnbCard hoverable className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Edit Profile</p>
                  <p className="text-sm text-muted-foreground">Update your info</p>
                </div>
              </AirbnbCard>
            </Link>
            <Link href="/tutor/reviews">
              <AirbnbCard hoverable className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl">
                  <Star className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-semibold">Your Reviews</p>
                  <p className="text-sm text-muted-foreground">See parent feedback</p>
                </div>
              </AirbnbCard>
            </Link>
            <Link href="/tutor/earnings">
              <AirbnbCard hoverable className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">View Earnings</p>
                  <p className="text-sm text-muted-foreground">Track your income</p>
                </div>
              </AirbnbCard>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
