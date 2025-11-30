"use client"

import { useState, useEffect } from "react"
import { AirbnbModal } from "../ui/airbnb-modal"
import { AirbnbButton } from "../ui/airbnb-button"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  tutor: {
    id: string
    name: string
    email?: string
    hourlyRate: number
    subjects: string[]
    availability?: Record<string, string[]>
  }
}

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function BookingModal({ isOpen, onClose, tutor }: BookingModalProps) {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [step, setStep] = useState(1)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      loadChildren()
    }
  }, [isOpen, user])

  const loadChildren = async () => {
    if (!user) return
    
    try {
      setIsLoadingChildren(true)
      const { getChildrenByParentId } = await import("@/firebase/children")
      const childrenData = await getChildrenByParentId(user.id)
      setChildren(childrenData)
    } catch (error) {
      console.error('Error loading children:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load children",
      })
    } finally {
      setIsLoadingChildren(false)
    }
  }

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
    // Return default time slots if tutor doesn't have availability set
    if (!tutor.availability || !tutor.availability[dayName]) {
      return ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    }
    return tutor.availability[dayName] || []
  }

  const handleBooking = async () => {
    if (!user || !selectedChild) return
    
    setIsLoading(true)

    try {
      console.log('📅 Creating booking in Firebase...')
      
      const { addBooking } = await import("@/firebase/bookings")
      
      const bookingData = {
        parentId: user.id,
        parentEmail: user.email,
        parentName: user.name,
        tutorId: tutor.id,
        tutorEmail: tutor.email || '',
        tutorName: tutor.name,
        childId: selectedChild.id,
        childName: selectedChild.name,
        childAge: selectedChild.age,
        childGrade: selectedChild.gradeLevel,
        subject: selectedSubject,
        date: selectedDate?.toISOString().split("T")[0] || '',
        time: selectedTime,
        duration,
        hourlyRate: tutor.hourlyRate,
        totalPrice: (tutor.hourlyRate * duration) / 60,
        status: 'pending' as const,
        notes,
        createdAt: new Date().toISOString(),
      }

      const bookingId = await addBooking(bookingData)
      
      console.log('✅ Booking created with ID:', bookingId)

      showToast({
        type: "success",
        title: "Booking Confirmed!",
        message: `Your session with ${tutor.name} has been booked for ${selectedChild.name}.`,
      })
      
      onClose()

      // Reset state
      setStep(1)
      setSelectedChild(null)
      setSelectedSubject("")
      setSelectedDate(null)
      setSelectedTime("")
      setNotes("")
    } catch (error) {
      console.error('❌ Error creating booking:', error)
      showToast({
        type: "error",
        title: "Booking Failed",
        message: "Failed to create booking. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Select Child</h3>
              {isLoadingChildren ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No children registered yet.</p>
                  <p className="text-sm text-muted-foreground">Please register a child first to book a session.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                        selectedChild?.id === child.id
                          ? "border-foreground bg-secondary"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">{child.name.charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-muted-foreground">{child.gradeLevel} • Age {child.age}</p>
                      </div>
                      {selectedChild?.id === child.id && <Check className="h-5 w-5 ml-auto text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-4">Select Subject</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                      selectedSubject === subject
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
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
                      isSelected && "bg-foreground text-background hover:bg-foreground",
                    )}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Available Times</h4>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableSlots(selectedDate).map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-2 rounded-lg border text-sm font-medium transition-all",
                        selectedTime === time
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Session Duration</h3>
              <div className="flex gap-2">
                {[30, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={cn(
                      "flex-1 py-3 rounded-lg border text-sm font-medium transition-all",
                      duration === mins
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Notes for Tutor (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics or areas you'd like to focus on?"
                className="w-full h-32 p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <h4 className="font-semibold">Booking Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Child</span>
                <span>{selectedChild?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subject</span>
                <span>{selectedSubject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{selectedDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>{duration} minutes</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>₱{((tutor.hourlyRate * duration) / 60).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedChild && selectedSubject
      case 2:
        return selectedDate && selectedTime
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <AirbnbModal isOpen={isOpen} onClose={onClose} title="Book a Session" size="md">
      {/* Progress */}
      <div className="flex items-center px-6 pt-4">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {i < 2 && (
              <div className={cn("flex-1 h-0.5 mx-2 transition-colors", step > s ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {renderStep()}

      {/* Footer */}
      <div className="p-6 border-t border-border flex items-center justify-between">
        {step > 1 ? (
          <AirbnbButton variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </AirbnbButton>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <AirbnbButton onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Continue
          </AirbnbButton>
        ) : (
          <AirbnbButton onClick={handleBooking} isLoading={isLoading}>
            Confirm Booking
          </AirbnbButton>
        )}
      </div>
    </AirbnbModal>
  )
}
