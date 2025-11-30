"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { BookingModal } from "@/components/booking/booking-modal"
import {
  Star,
  MapPin,
  Clock,
  BadgeCheck,
  MessageCircle,
  Calendar,
  GraduationCap,
  Globe,
  ChevronLeft,
  Heart,
} from "lucide-react"
import Link from "next/link"

export default function TutorDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { reviews } = useData()
  const router = useRouter()
  const params = useParams()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [tutor, setTutor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const tutorReviews = reviews.filter((r) => r.tutorId === params.id)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "parent")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (params.id) {
      loadTutor()
    }
  }, [params.id])

  const loadTutor = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Loading tutor from Firebase...', params.id)
      
      const { getTutorById } = await import("@/firebase/tutors")
      const tutorData = await getTutorById(params.id as string)
      
      if (tutorData) {
        // Add default values for optional fields
        const tutorWithDefaults = {
          ...tutorData,
          subjects: tutorData.subjects || [],
          education: tutorData.education || [],
          languages: tutorData.languages || [],
          documents: tutorData.documents || [],
          responseTime: tutorData.responseTime || "within 24 hours",
          totalSessions: tutorData.totalSessions || 0,
          reviewCount: tutorData.reviewCount || 0,
          verified: tutorData.verified || false,
          bio: tutorData.bio || "No bio available",
          experience: tutorData.experience || "",
        }
        
        console.log('✅ Loaded tutor:', tutorWithDefaults)
        setTutor(tutorWithDefaults)
      } else {
        setTutor(null)
      }
    } catch (error) {
      console.error('❌ Error loading tutor:', error)
      setTutor(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessageTutor = async () => {
    if (!user || !tutor) return
    
    try {
      console.log('💬 Starting conversation with tutor...')
      
      const { getOrCreateConversation } = await import("@/firebase/messages")
      
      const conversationId = await getOrCreateConversation(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'parent' | 'tutor' | 'admin',
          avatar: user.avatar
        },
        {
          id: tutor.id,
          name: tutor.name,
          email: tutor.email || '',
          role: 'tutor' as const,
          avatar: tutor.avatar
        }
      )
      
      console.log('✅ Conversation created/found:', conversationId)
      
      // Navigate to messages page with conversation selected
      router.push(`/parent/messages?conversation=${conversationId}`)
    } catch (error) {
      console.error('❌ Error starting conversation:', error)
    }
  }

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!tutor) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Tutor not found</h1>
          <Link href="/parent/tutors">
            <AirbnbButton>Back to Tutors</AirbnbButton>
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/parent/tutors"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to tutors
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={tutor.avatar || "/placeholder.svg"}
                alt={tutor.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-bold">{tutor.name}</h1>
                      {tutor.verified && <BadgeCheck className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-foreground text-foreground" />
                        <span className="font-semibold text-foreground">{tutor.rating}</span>
                        <span>({tutor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {tutor.location}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(tutor.subjects || []).map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm">
                  {tutor.responseTime && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Responds {tutor.responseTime}
                    </div>
                  )}
                  {tutor.totalSessions !== undefined && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {tutor.totalSessions} sessions
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <AirbnbCard>
              <h2 className="text-xl font-bold mb-4">About {tutor.name.split(" ")[0]}</h2>
              <p className="text-muted-foreground leading-relaxed">{tutor.bio}</p>
            </AirbnbCard>

            {/* Education & Experience */}
            {(tutor.education || tutor.experience) && (
              <AirbnbCard>
                <h2 className="text-xl font-bold mb-4">Education & Experience</h2>
                <div className="space-y-4">
                  {(tutor.education || []).map((edu, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="p-2 bg-secondary rounded-lg">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.school} · {edu.year}
                        </p>
                      </div>
                    </div>
                  ))}
                  {tutor.experience && (
                    <div className="flex items-start gap-4 pt-4 border-t border-border">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Experience</p>
                        <p className="text-sm text-muted-foreground">{tutor.experience}</p>
                      </div>
                    </div>
                  )}
                </div>
              </AirbnbCard>
            )}

            {/* Languages */}
            {tutor.languages && tutor.languages.length > 0 && (
              <AirbnbCard>
                <h2 className="text-xl font-bold mb-4">Languages</h2>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span>{tutor.languages.join(", ")}</span>
                </div>
              </AirbnbCard>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <div className="space-y-4">
                {tutorReviews.map((review) => (
                  <AirbnbCard key={review.id}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold">{review.parentName.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{review.parentName}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-foreground text-foreground" />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-3 text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </AirbnbCard>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AirbnbCard className="shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-bold">₱{tutor.hourlyRate}</span>
                  <span className="text-muted-foreground">/ hour</span>
                </div>

                <AirbnbButton className="w-full mb-4" size="lg" onClick={() => setShowBookingModal(true)}>
                  Book a Session
                </AirbnbButton>

                <AirbnbButton
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleMessageTutor}
                  leftIcon={<MessageCircle className="h-5 w-5" />}
                >
                  Message
                </AirbnbButton>

                {tutor.documents && tutor.documents.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-semibold mb-4">Verification</h3>
                    <div className="space-y-3">
                      {tutor.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <BadgeCheck
                            className={`h-5 w-5 ${doc.status === "verified" ? "text-success" : "text-warning"}`}
                          />
                          <span className="text-sm">{doc.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                              doc.status === "verified" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AirbnbCard>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} tutor={tutor} />
    </PageLayout>
  )
}
