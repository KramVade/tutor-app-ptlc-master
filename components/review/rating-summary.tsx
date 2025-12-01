"use client"

import { Star } from "lucide-react"
import { AirbnbCard } from "../ui/airbnb-card"

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export function RatingSummary({
  averageRating,
  totalReviews,
  ratingDistribution
}: RatingSummaryProps) {
  if (totalReviews === 0) {
    return (
      <AirbnbCard>
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold mb-1">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            This tutor hasn't received any reviews
          </p>
        </div>
      </AirbnbCard>
    )
  }

  return (
    <AirbnbCard>
      <div className="flex items-start gap-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        {ratingDistribution && (
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution]
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

              return (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-warning text-warning" />
                  </div>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AirbnbCard>
  )
}
