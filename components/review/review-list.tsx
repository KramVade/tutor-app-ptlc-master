"use client"

import { Star } from "lucide-react"
import { AirbnbCard } from "../ui/airbnb-card"

interface Review {
  id: string
  parentName: string
  rating: number
  comment: string
  createdAt: string
}

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to review this tutor
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <AirbnbCard key={review.id}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-primary">
                {review.parentName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold">{review.parentName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          </div>
        </AirbnbCard>
      ))}
    </div>
  )
}
