"use client"

import { useState } from "react"
import { AirbnbCard } from "../ui/airbnb-card"
import { AirbnbButton } from "../ui/airbnb-button"
import { AirbnbModal } from "../ui/airbnb-modal"
import { useNotification } from "@/lib/context/notification-context"
import { Calendar, Clock, MessageCircle, X, Check, User, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateBookingStatus } from "@/firebase/bookings"

interface BookingCardProps {
  booking: {
    id?: string
    tutorId: string
    tutorName: string
    childId: string
    childName: string
    childGrade?: string
    parentName: string
    subject: string
    date: string
    time: string
    duration: number
    status: string
    price?: number
    totalPrice?: number
    notes?: string
  }
  showActions?: boolean
  role?: "parent" | "tutor"
}

export function BookingCard({ booking, showActions = true, role = "parent" }: BookingCardProps) {
  const { showToast } = useNotification()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const statusColors = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-success/10 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  }

  const handleCancel = async () => {
    if (!booking.id) return
    
    try {
      setIsLoading(true)
      await updateBookingStatus(booking.id, "cancelled")
      setShowCancelModal(false)
      showToast({
        type: "info",
        title: "Booking Cancelled",
        message: "Your booking has been cancelled successfully.",
      })
      // Reload page to refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to cancel booking",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!booking.id) return
    
    try {
      setIsLoading(true)
      await updateBookingStatus(booking.id, "confirmed")
      showToast({
        type: "success",
        title: "Booking Approved",
        message: "The session has been confirmed.",
      })
      // Reload page to refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error approving booking:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to approve booking",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!booking.id) return
    
    try {
      setIsLoading(true)
      await updateBookingStatus(booking.id, "cancelled")
      showToast({
        type: "info",
        title: "Booking Declined",
        message: "The booking request has been declined.",
      })
      // Reload page to refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error declining booking:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to decline booking",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AirbnbCard className="relative">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">
                  {role === "parent" ? booking.tutorName : booking.childName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{booking.subject}</p>
                </div>
                {role === "tutor" && booking.childGrade && (
                  <p className="text-xs text-muted-foreground mt-1">Grade {booking.childGrade}</p>
                )}
                {role === "tutor" && (
                  <p className="text-xs text-muted-foreground mt-1">Parent: {booking.parentName}</p>
                )}
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium capitalize",
                  statusColors[booking.status as keyof typeof statusColors],
                )}
              >
                {booking.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(booking.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {booking.time} · {booking.duration}h
              </div>
            </div>

            {booking.notes && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{booking.notes}</p>}

            {showActions && booking.status !== "cancelled" && booking.status !== "completed" && (
              <div className="flex items-center gap-2 mt-4">
                {role === "parent" && (
                  <>
                    <AirbnbButton variant="outline" size="sm" leftIcon={<MessageCircle className="h-4 w-4" />}>
                      Message
                    </AirbnbButton>
                    {booking.status === "pending" && (
                      <AirbnbButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        className="text-destructive"
                      >
                        Cancel
                      </AirbnbButton>
                    )}
                  </>
                )}
                {role === "tutor" && booking.status === "pending" && (
                  <>
                    <AirbnbButton
                      size="sm"
                      onClick={handleApprove}
                      isLoading={isLoading}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      Approve
                    </AirbnbButton>
                    <AirbnbButton
                      variant="outline"
                      size="sm"
                      onClick={handleDecline}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      Decline
                    </AirbnbButton>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="font-semibold">₱{(booking.totalPrice || booking.price || 0).toFixed(2)}</p>
          </div>
        </div>
      </AirbnbCard>

      {/* Cancel Modal */}
      <AirbnbModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Booking" size="sm">
        <div className="p-6">
          <p className="text-muted-foreground">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-6">
            <AirbnbButton variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)}>
              Keep Booking
            </AirbnbButton>
            <AirbnbButton variant="destructive" className="flex-1" onClick={handleCancel} isLoading={isLoading}>
              Cancel Booking
            </AirbnbButton>
          </div>
        </div>
      </AirbnbModal>
    </>
  )
}
