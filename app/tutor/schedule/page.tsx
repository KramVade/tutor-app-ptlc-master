"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { Calendar, ChevronLeft, ChevronRight, Clock, User, BookOpen } from "lucide-react"
import { getBookingsByTutorId, type Booking } from "@/firebase/bookings"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function TutorSchedulePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === "tutor") {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const data = await getBookingsByTutorId(user.id)
      // Only show confirmed and pending bookings
      const activeBookings = data.filter(b => b.status === 'confirmed' || b.status === 'pending')
      setBookings(activeBookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load schedule",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => {
      try {
        const bookingDate = parseISO(booking.date)
        return isSameDay(bookingDate, day)
      } catch {
        return false
      }
    }).sort((a, b) => a.time.localeCompare(b.time))
  }

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground mt-1">View your weekly schedule with student details</p>
        </div>

        {/* Week Navigation */}
        <AirbnbCard className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AirbnbButton variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </AirbnbButton>
              <div className="text-center">
                <p className="font-semibold text-lg">
                  {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
                </p>
              </div>
              <AirbnbButton variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </AirbnbButton>
            </div>
            <AirbnbButton variant="outline" onClick={goToToday}>
              Today
            </AirbnbButton>
          </div>
        </AirbnbCard>

        {/* Weekly Calendar View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayBookings = getBookingsForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <AirbnbCard 
                key={index} 
                className={isToday ? "border-2 border-primary" : ""}
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{format(day, "EEE")}</p>
                  <p className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </p>
                </div>

                <div className="space-y-2">
                  {dayBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No sessions</p>
                    </div>
                  ) : (
                    dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          booking.status === 'confirmed' 
                            ? 'bg-primary/5 border-primary' 
                            : 'bg-warning/5 border-warning'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{booking.time}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.duration}h session
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{booking.childName}</p>
                            {booking.childGrade && (
                              <p className="text-xs text-muted-foreground">Grade {booking.childGrade}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{booking.subject}</p>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-warning font-medium">Pending Confirmation</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </AirbnbCard>
            )
          })}
        </div>

        {/* Time Slot View */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Time Slot View</h2>
          <AirbnbCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Time</th>
                    {weekDays.map((day, index) => (
                      <th key={index} className="text-center p-3 font-semibold min-w-[120px]">
                        <div>{format(day, "EEE")}</div>
                        <div className="text-sm font-normal text-muted-foreground">
                          {format(day, "MMM d")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-b border-border hover:bg-secondary/50">
                      <td className="p-3 font-medium text-sm">{time}</td>
                      {weekDays.map((day, dayIndex) => {
                        const dayBookings = getBookingsForDay(day)
                        const timeBooking = dayBookings.find(b => b.time === time)

                        return (
                          <td key={dayIndex} className="p-2">
                            {timeBooking ? (
                              <div
                                className={`p-2 rounded text-xs ${
                                  timeBooking.status === 'confirmed'
                                    ? 'bg-primary/10 border border-primary/20'
                                    : 'bg-warning/10 border border-warning/20'
                                }`}
                              >
                                <p className="font-semibold truncate">{timeBooking.childName}</p>
                                <p className="text-muted-foreground truncate">{timeBooking.subject}</p>
                              </div>
                            ) : (
                              <div className="h-12" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AirbnbCard>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/10 border border-primary/20 rounded" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning/10 border border-warning/20 rounded" />
            <span>Pending</span>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
