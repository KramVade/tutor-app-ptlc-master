"use client"

import Link from "next/link"
import { Star, MapPin, Clock, BadgeCheck } from "lucide-react"
import { AirbnbCard } from "../ui/airbnb-card"

interface TutorCardProps {
  tutor: {
    id: string
    name: string
    avatar: string
    subjects: string[]
    hourlyRate: number
    rating: number
    reviewCount: number
    location: string
    verified: boolean
    responseTime: string
    bio: string
  }
}

export function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Link href={`/parent/tutors/${tutor.id}`}>
      <AirbnbCard hoverable padding="none" className="overflow-hidden h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={tutor.avatar || "/placeholder.svg"}
            alt={tutor.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {tutor.verified && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{tutor.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="text-sm font-medium">{tutor.rating}</span>
                <span className="text-sm text-muted-foreground">({tutor.reviewCount})</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-semibold text-foreground">₱{tutor.hourlyRate}</span>
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{tutor.bio}</p>

          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {tutor.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {tutor.responseTime}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tutor.subjects.slice(0, 3).map((subject) => (
              <span
                key={subject}
                className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
              >
                {subject}
              </span>
            ))}
            {tutor.subjects.length > 3 && (
              <span className="px-2.5 py-1 text-xs text-muted-foreground">+{tutor.subjects.length - 3} more</span>
            )}
          </div>
        </div>
      </AirbnbCard>
    </Link>
  )
}
