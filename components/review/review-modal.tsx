"use client"

import { useState } from "react"
import { AirbnbModal } from "../ui/airbnb-modal"
import { AirbnbButton } from "../ui/airbnb-button"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  tutorId: string
  tutorName: string
  bookingId?: string
  onReviewSubmitted?: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  bookingId,
  onReviewSubmitted
}: ReviewModalProps) {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'You must be logged in to submit a review'
      })
      return
    }

    if (rating === 0) {
      showToast({
        type: 'error',
        title: 'Missing Rating',
        message: 'Please select a rating'
      })
      return
    }

    if (!comment.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Comment',
        message: 'Please write a review comment'
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const { addReview } = await import('@/firebase/reviews')
      
      await addReview({
        tutorId,
        tutorName,
        parentId: user.id,
        parentName: user.name,
        rating,
        comment: comment.trim(),
        bookingId,
        createdAt: new Date().toISOString()
      })
      
      showToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for your feedback!'
      })
      
      // Reset form
      setRating(0)
      setComment('')
      
      // Call callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
      
      onClose()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to submit review. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setComment('')
      onClose()
    }
  }

  return (
    <AirbnbModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Review ${tutorName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium">
                  {rating} out of 5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Review <span className="text-destructive">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this tutor..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Review Guidelines:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Be honest and constructive</li>
              <li>• Focus on your experience</li>
              <li>• Avoid personal attacks</li>
              <li>• Keep it relevant to the tutoring session</li>
            </ul>
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
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
          >
            Submit Review
          </AirbnbButton>
        </div>
      </form>
    </AirbnbModal>
  )
}
