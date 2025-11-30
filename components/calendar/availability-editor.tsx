"use client"

import { useState } from "react"
import { AirbnbCard } from "../ui/airbnb-card"
import { AirbnbButton } from "../ui/airbnb-button"
import { useNotification } from "@/lib/context/notification-context"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

interface AvailabilityEditorProps {
  availability: Record<string, string[]>
  onSave: (availability: Record<string, string[]>) => void
}

export function AvailabilityEditor({ availability, onSave }: AvailabilityEditorProps) {
  const { showToast } = useNotification()
  const [localAvailability, setLocalAvailability] = useState(availability)
  const [isLoading, setIsLoading] = useState(false)

  const toggleSlot = (day: string, time: string) => {
    setLocalAvailability((prev) => {
      const daySlots = prev[day] || []
      if (daySlots.includes(time)) {
        return { ...prev, [day]: daySlots.filter((t) => t !== time) }
      } else {
        return { ...prev, [day]: [...daySlots, time].sort() }
      }
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave(localAvailability)
    setIsLoading(false)
    showToast({
      type: "success",
      title: "Availability Updated",
      message: "Your schedule has been saved successfully.",
    })
  }

  return (
    <AirbnbCard>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Weekly Availability</h3>
          <p className="text-sm text-muted-foreground mt-1">Click on time slots to toggle availability</p>
        </div>
        <AirbnbButton onClick={handleSave} isLoading={isLoading}>
          Save Changes
        </AirbnbButton>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time
            </div>
            {days.map((day) => (
              <div key={day.key} className="text-center text-sm font-medium">
                {day.label}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-2">
                <div className="flex items-center text-sm text-muted-foreground">{time}</div>
                {days.map((day) => {
                  const isAvailable = (localAvailability[day.key] || []).includes(time)
                  return (
                    <button
                      key={`${day.key}-${time}`}
                      onClick={() => toggleSlot(day.key, time)}
                      className={cn(
                        "h-10 rounded-lg border transition-all",
                        isAvailable
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border hover:border-primary/50",
                      )}
                    >
                      {isAvailable && <span className="text-xs">✓</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AirbnbCard>
  )
}
