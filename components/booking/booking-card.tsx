"use client"

import { useState } from "react"
import { AirbnbCard } from "../ui/airbnb-card"
import { AirbnbButton } from "../ui/airbnb-button"
import { AirbnbModal } from "../ui/airbnb-modal"
import { useData } from "@/lib/context/data-context"
import { useNotification } from "@/lib/context/notification-context"
import { Calendar, Clock, MessageCircle, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingCardProps {
  booking: {
    id: string
    tutorId: string
    childId: string
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
  const { tutors, children, updateBooking } = useData()
  const { showToast } = useNotification()
  const [showMenu, setShowMenu] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tutor = tutors.find((t) => t.id === booking.tutorId)
  const child = children.find((c) => c.id === booking.childId)

  const statusColors = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-success/10 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  }

  const handleCancel = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    updateBooking(booking.id, { status: "cancelled" })
    setShowCancelModal(false)
    setIsLoading(false)
    showToast({
      type: "info",
      title: "Booking Cancelled",
      message: "Your booking has been cancelled successfully.",
    })
  }

  const handleApprove = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    updateBooking(booking.id, { status: "confirmed" })
    setIsLoading(false)
    showToast({
      type: "success",
      title: "Booking Approved",
      message: "The session has been confirmed.",
    })
  }

  const handleDecline = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    updateBooking(booking.id, { status: "cancelled" })
    setIsLoading(false)
    showToast({
      type: "info",
      title: "Booking Declined",
      message: "The booking request has been declined.",
    })
  }

  return (
    <>
      <AirbnbCard className="relative">
        <div className="flex items-start gap-4">
          {role === "parent" && tutor && (
            <img
              src={tutor.avatar || "/placeholder.svg"}
              alt={tutor.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          )}
          {role === "tutor" && child && (
            <img
              src={child.avatar || "/placeholder.svg"}
              alt={child.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{role === "parent" ? tutor?.name : child?.name}</h3>
                <p className="text-sm text-muted-foreground">{booking.subject}</p>
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
                {booking.time} · {booking.duration} min
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
