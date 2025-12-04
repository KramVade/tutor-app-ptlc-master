"use client"

import { useState } from "react"
import { AirbnbModal } from "../ui/airbnb-modal"
import { AirbnbButton } from "../ui/airbnb-button"
import { useNotification } from "@/lib/context/notification-context"
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { rescheduleBooking } from "@/firebase/bookings"

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id?: string
    childName: string
    subject: string
    date: string
    time: string
    duration: number
  }
  tutorAvailability?: Record<string, string[]>
}

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function RescheduleModal({ isOpen, onClose, booking, tutorAvailability }: RescheduleModalProps) {
  const { showToast } = useNotification()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [reason, setReason] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const getAvailableSlots = (date: Date) => {
    const dayName = days[date.getDay()]
    if (!tutorAvailability || !tutorAvailability[dayName]) {
      return ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    }
    return tutorAvailability[dayName] || []
  }

  const handleReschedule = async () => {
    if (!booking.id || !selectedDate || !selectedTime) return

    setIsLoading(true)
    try {
      const newDate = selectedDate.toISOString().split("T")[0]
      await rescheduleBooking(booking.id, newDate, selectedTime, reason)

      showToast({
        type: "success",
        title: "Session Rescheduled",
        message: `The session has been rescheduled to ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error("Error rescheduling booking:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to reschedule session",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AirbnbModal isOpen={isOpen} onClose={onClose} title="Reschedule Session" size="md">
      <div className="p-6 space-y-6">
        {/* Current Booking Info */}
        <div className="bg-secondary rounded-xl p-4 space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Current Schedule</h4>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{booking.time} · {booking.duration}h</span>
          </div>
          <p className="text-sm">
            <span className="text-muted-foreground">Student:</span> {booking.childName}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Subject:</span> {booking.subject}
          </p>
        </div>

        {/* Calendar */}
        <div>
          <h4 className="font-semibold mb-4">Select New Date</h4>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
              const slots = getAvailableSlots(date)
              const isAvailable = slots.length > 0 && date >= new Date()
              const isSelected = selectedDate?.toDateString() === date.toDateString()

              return (
                <button
                  key={i}
                  onClick={() => isAvailable && setSelectedDate(date)}
                  disabled={!isAvailable}
                  className={cn(
                    "aspect-square rounded-full flex items-center justify-center text-sm transition-all",
                    isAvailable ? "hover:bg-secondary cursor-pointer" : "text-muted-foreground/50 cursor-not-allowed",
                    isSelected && "bg-foreground text-background hover:bg-foreground"
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h4 className="font-semibold mb-3">Select New Time</h4>
            <div className="grid grid-cols-3 gap-2">
              {getAvailableSlots(selectedDate).map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "py-2 rounded-lg border text-sm font-medium transition-all",
                    selectedTime === time
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <h4 className="font-semibold mb-3">Reason for Rescheduling (Optional)</h4>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the parent know why you're rescheduling..."
            className="w-full h-24 p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border flex items-center justify-between">
        <AirbnbButton variant="outline" onClick={onClose}>
          Cancel
        </AirbnbButton>
        <AirbnbButton
          onClick={handleReschedule}
          isLoading={isLoading}
          disabled={!selectedDate || !selectedTime}
        >
          Reschedule Session
        </AirbnbButton>
      </div>
    </AirbnbModal>
  )
}
