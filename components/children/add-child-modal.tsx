"use client"

import type React from "react"

import { useState } from "react"
import { AirbnbModal } from "@/components/ui/airbnb-modal"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbInput } from "@/components/ui/airbnb-input"
import { useNotification } from "@/lib/context/notification-context"
import { User, School, BookOpen, FileText } from "lucide-react"

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (child: any) => void
}

const gradeOptions = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
]

const subjectOptions = [
  "Mathematics",
  "English",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Spanish",
  "French",
  "Computer Science",
  "Art",
  "Music",
]

export function AddChildModal({ isOpen, onClose, onAdd }: AddChildModalProps) {
  const { showToast } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    grade: "",
    school: "",
    subjects: [] as string[],
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.age || !formData.grade) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields.",
      })
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    onAdd({
      ...formData,
      age: Number.parseInt(formData.age),
      avatar: `/placeholder.svg?height=100&width=100&query=child student ${formData.name}`,
    })

    showToast({
      type: "success",
      title: "Child Added",
      message: `${formData.name} has been added to your account.`,
    })

    setFormData({
      name: "",
      age: "",
      grade: "",
      school: "",
      subjects: [],
      notes: "",
    })
    setIsLoading(false)
    onClose()
  }

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  return (
    <AirbnbModal isOpen={isOpen} onClose={onClose} title="Add a Child" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AirbnbInput
          label="Child's Name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          leftIcon={<User className="h-5 w-5" />}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <AirbnbInput
            label="Age"
            type="number"
            placeholder="Age"
            min={4}
            max={18}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Grade Level</label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-card"
              required
            >
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AirbnbInput
          label="School (Optional)"
          placeholder="Enter school name"
          value={formData.school}
          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
          leftIcon={<School className="h-5 w-5" />}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            <BookOpen className="h-4 w-4 inline mr-2" />
            Subjects Needing Help
          </label>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => toggleSubject(subject)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.subjects.includes(subject)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="h-4 w-4 inline mr-2" />
            Additional Notes (Optional)
          </label>
          <textarea
            placeholder="Any special considerations, learning style preferences, or goals..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-card resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <AirbnbButton type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </AirbnbButton>
          <AirbnbButton type="submit" isLoading={isLoading} className="flex-1">
            Add Child
          </AirbnbButton>
        </div>
      </form>
    </AirbnbModal>
  )
}
