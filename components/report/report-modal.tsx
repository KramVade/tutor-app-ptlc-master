"use client"

import { useState } from "react"
import { AirbnbModal } from "../ui/airbnb-modal"
import { AirbnbButton } from "../ui/airbnb-button"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { AlertTriangle } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  reportedUserType: 'tutor' | 'parent'
  bookingId?: string
}

const REPORT_CATEGORIES = [
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'unprofessional', label: 'Unprofessional Conduct' },
  { value: 'fraud', label: 'Fraud or Scam' },
  { value: 'other', label: 'Other' },
]

export function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  reportedUserType,
  bookingId
}: ReportModalProps) {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'You must be logged in to submit a report'
      })
      return
    }

    if (!formData.category || !formData.description.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Information',
        message: 'Please select a category and provide a description'
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const { addReport } = await import('@/firebase/reports')
      
      await addReport({
        reporterId: user.id,
        reporterName: user.name,
        reporterEmail: user.email,
        reportedUserId,
        reportedUserName,
        reportedUserType,
        category: formData.category as any,
        description: formData.description,
        status: 'pending',
        priority: 'medium',
        bookingId,
        createdAt: new Date().toISOString()
      })
      
      showToast({
        type: 'success',
        title: 'Report Submitted',
        message: 'Your report has been submitted and will be reviewed by our team'
      })
      
      // Reset form
      setFormData({ category: '', description: '' })
      onClose()
    } catch (error) {
      console.error('Error submitting report:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit report. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ category: '', description: '' })
      onClose()
    }
  }

  return (
    <AirbnbModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Abuse"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-warning mb-1">Important</p>
              <p className="text-muted-foreground">
                False reports may result in account suspension. Please only report genuine concerns.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-4">
            You are reporting: <span className="font-semibold text-foreground">{reportedUserName}</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a category</option>
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about the incident..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include specific details, dates, and any relevant information
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <AirbnbButton
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </AirbnbButton>
          <AirbnbButton
            type="submit"
            variant="destructive"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Report
          </AirbnbButton>
        </div>
      </form>
    </AirbnbModal>
  )
}
