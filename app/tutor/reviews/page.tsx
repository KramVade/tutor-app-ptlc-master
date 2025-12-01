"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { ReviewList } from "@/components/review/review-list"
import { RatingSummary } from "@/components/review/rating-summary"
import { Star, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function TutorReviewsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [ratingStats, setRatingStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === "tutor") {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      console.log('📝 Loading reviews for tutor...')

      const { getReviewsByTutorId, getTutorReviewStats } = await import("@/firebase/reviews")

      const [reviewsData, stats] = await Promise.all([
        getReviewsByTutorId(user.id),
        getTutorReviewStats(user.id)
      ])

      console.log('✅ Loaded reviews:', reviewsData.length)
      setReviews(reviewsData)
      setRatingStats(stats)
    } catch (error) {
      console.error('❌ Error loading reviews:', error)
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

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard Link */}
        <Link
          href="/tutor/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Reviews</h1>
          <p className="text-muted-foreground mt-1">
            See what parents are saying about your tutoring
          </p>
        </div>

        {/* Rating Summary */}
        {ratingStats && (
          <div className="mb-8">
            <RatingSummary
              averageRating={ratingStats.averageRating}
              totalReviews={ratingStats.totalReviews}
              ratingDistribution={ratingStats.ratingDistribution}
            />
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <AirbnbCard>
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Reviews from parents will appear here after they rate your sessions
              </p>
            </div>
          </AirbnbCard>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">
              All Reviews ({reviews.length})
            </h2>
            <ReviewList reviews={reviews} />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
