"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { Calendar, ChevronLeft, ChevronRight, Clock, User, BookOpen, X } from "lucide-react"
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const handleDateClick = (day: Date) => {
    const dayBookings = getBookingsForDay(day)
    if (dayBookings.length > 0) {
      setSelectedDate(day)
    }
  }

  const closeModal = () => {
    setSelectedDate(null)
  }

  const selectedDateBookings = selectedDate ? getBookingsForDay(selectedDate) : []

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
            const hasBookings = dayBookings.length > 0

            return (
              <AirbnbCard 
                key={index} 
                className={`${isToday ? "border-2 border-primary" : ""} ${hasBookings ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
                onClick={() => hasBookings && handleDateClick(day)}
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{format(day, "EEE")}</p>
                  <p className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </p>
                  <p className="text-xs text-muted-foreground">{format(day, "MMM")}</p>
                </div>

                <div className="space-y-2">
                  {dayBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No sessions</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-primary">
                          {dayBookings.length} {dayBookings.length === 1 ? 'Session' : 'Sessions'}
                        </span>
                        <span className="text-xs text-muted-foreground">Click to view</span>
                      </div>
                      {dayBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-2 rounded-lg border-l-4 ${
                            booking.status === 'confirmed' 
                              ? 'bg-primary/5 border-primary' 
                              : 'bg-warning/5 border-warning'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <p className="font-semibold text-xs">{booking.time}</p>
                          </div>
                          <p className="font-medium text-xs truncate">{booking.childName}</p>
                          <p className="text-xs text-muted-foreground truncate">{booking.subject}</p>
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          +{dayBookings.length - 2} more
                        </p>
                      )}
                    </>
                  )}
                </div>
              </AirbnbCard>
            )
          })}
        </div>

        {/* Day Details Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedDateBookings.length} {selectedDateBookings.length === 1 ? 'session' : 'sessions'} scheduled
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <div className="space-y-4">
                  {selectedDateBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-6 rounded-xl border-2 ${
                        booking.status === 'confirmed' 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-warning/5 border-warning/20'
                      }`}
                    >
                      {/* Time */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-background rounded-lg">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{booking.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.duration} hour {booking.duration === 1 ? 'session' : 'sessions'}
                          </p>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="flex items-start gap-3 mb-4 p-4 bg-background rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{booking.childName}</p>
                          {booking.childGrade && (
                            <p className="text-sm text-muted-foreground">Grade {booking.childGrade}</p>
                          )}
                          {booking.childAge && (
                            <p className="text-sm text-muted-foreground">{booking.childAge} years old</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="flex items-center gap-3 mb-4 p-4 bg-background rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Subject</p>
                          <p className="font-semibold">{booking.subject}</p>
                        </div>
                      </div>

                      {/* Parent Info */}
                      <div className="p-4 bg-background rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Parent</p>
                        <p className="font-medium">{booking.parentName}</p>
                        <p className="text-sm text-muted-foreground">{booking.parentEmail}</p>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="p-4 bg-background rounded-lg mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {booking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary">₱{booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
