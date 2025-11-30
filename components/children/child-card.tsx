"use client"

import { useState } from "react"
import { AirbnbCard } from "../ui/airbnb-card"
import { AirbnbButton } from "../ui/airbnb-button"
import { AirbnbModal } from "../ui/airbnb-modal"
import { AirbnbInput } from "../ui/airbnb-input"
import { useData } from "@/lib/context/data-context"
import { useNotification } from "@/lib/context/notification-context"
import { Edit2, GraduationCap, School } from "lucide-react"

interface ChildCardProps {
  child: {
    id: string
    name: string
    age: number
    grade: string
    school: string
    subjects: string[]
    notes?: string
    avatar: string
  }
}

export function ChildCard({ child }: ChildCardProps) {
  const { updateChild } = useData()
  const { showToast } = useNotification()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(child)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    updateChild(child.id, editData)
    setShowEditModal(false)
    setIsLoading(false)
    showToast({
      type: "success",
      title: "Profile Updated",
      message: `${child.name}'s profile has been updated.`,
    })
  }

  return (
    <>
      <AirbnbCard>
        <div className="flex items-start gap-4">
          <img
            src={child.avatar || "/placeholder.svg"}
            alt={child.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{child.name}</h3>
                <p className="text-sm text-muted-foreground">{child.age} years old</p>
              </div>
              <AirbnbButton
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(true)}
                leftIcon={<Edit2 className="h-4 w-4" />}
              >
                Edit
              </AirbnbButton>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {child.grade}
              </div>
              <div className="flex items-center gap-1.5">
                <School className="h-4 w-4" />
                {child.school}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {child.subjects.map((subject) => (
                <span key={subject} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                  {subject}
                </span>
              ))}
            </div>

            {child.notes && <p className="mt-4 text-sm text-muted-foreground">{child.notes}</p>}
          </div>
        </div>
      </AirbnbCard>

      {/* Edit Modal */}
      <AirbnbModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Child Profile" size="md">
        <div className="p-6 space-y-4">
          <AirbnbInput
            label="Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <AirbnbInput
              label="Age"
              type="number"
              value={editData.age}
              onChange={(e) => setEditData({ ...editData, age: Number.parseInt(e.target.value) })}
            />
            <AirbnbInput
              label="Grade"
              value={editData.grade}
              onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
            />
          </div>
          <AirbnbInput
            label="School"
            value={editData.school}
            onChange={(e) => setEditData({ ...editData, school: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={editData.notes || ""}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Any additional notes about your child..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <AirbnbButton variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </AirbnbButton>
            <AirbnbButton onClick={handleSave} isLoading={isLoading}>
              Save Changes
            </AirbnbButton>
          </div>
        </div>
      </AirbnbModal>
    </>
  )
}
