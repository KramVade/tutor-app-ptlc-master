"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { BookingCard } from "@/components/booking/booking-card"
import { Calendar, Clock, BookOpen, Users, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

export default function ParentDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "parent")) {
      router.push("/login")
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
      
      // Load bookings and children from Firebase
      const [{ getBookingsByParentId }, { getChildrenByParentId }] = await Promise.all([
        import("@/firebase/bookings"),
        import("@/firebase/children")
      ])
      
      const [bookingsData, childrenData] = await Promise.all([
        getBookingsByParentId(user.id),
        getChildrenByParentId(user.id)
      ])
      
      setBookings(bookingsData)
      setChildren(childrenData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setBookings([])
      setChildren([])
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

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").slice(0, 3)

  const stats = [
    { label: "Upcoming Sessions", value: upcomingBookings.length, icon: Calendar },
    { label: "Children", value: children.length, icon: Users },
    { label: "Total Sessions", value: bookings.filter((b) => b.status === "completed").length, icon: BookOpen },
    {
      label: "Hours Learned",
      value: Math.round(bookings.filter((b) => b.status === "completed").reduce((acc, b) => acc + b.duration, 0) / 60),
      icon: Clock,
    },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your children's learning.</p>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upcoming Sessions</h2>
              <Link href="/parent/bookings">
                <AirbnbButton variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </AirbnbButton>
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <AirbnbCard className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground mb-4">Book a session with a tutor to get started.</p>
                <Link href="/parent/tutors">
                  <AirbnbButton>Find a Tutor</AirbnbButton>
                </Link>
              </AirbnbCard>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          {/* Children */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Children</h2>
              <Link href="/parent/children">
                <AirbnbButton variant="ghost" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Manage
                </AirbnbButton>
              </Link>
            </div>

            <div className="space-y-4">
              {children.length === 0 ? (
                <AirbnbCard className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No children registered yet</p>
                </AirbnbCard>
              ) : (
                children.map((child) => (
                  <AirbnbCard key={child.id} hoverable>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{child.name}</p>
                        <p className="text-sm text-muted-foreground">{child.gradeLevel || child.grade}</p>
                      </div>
                    </div>
                  </AirbnbCard>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/parent/tutors" className="block">
                  <AirbnbCard hoverable className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Find a Tutor</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </AirbnbCard>
                </Link>
                <Link href="/parent/children" className="block">
                  <AirbnbCard hoverable className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Manage Children</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </AirbnbCard>
                </Link>
                <Link href="/parent/messages" className="block">
                  <AirbnbCard hoverable className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Messages</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </AirbnbCard>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
