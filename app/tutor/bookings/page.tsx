"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { PageLayout } from "@/components/layout/page-layout"
import { BookingCard } from "@/components/booking/booking-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Clock, Calendar, CheckCircle } from "lucide-react"

export default function TutorBookingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { bookings } = useData()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed")
  const completedBookings = bookings.filter((b) => b.status === "completed")

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Bookings</h1>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No pending requests</h3>
                <p className="text-muted-foreground">New booking requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="tutor" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {confirmedBookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground">Confirmed sessions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="tutor" showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedBookings.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No completed sessions</h3>
                <p className="text-muted-foreground">Completed sessions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="tutor" showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
