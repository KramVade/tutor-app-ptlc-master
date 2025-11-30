"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AvailabilityEditor } from "@/components/calendar/availability-editor"

export default function TutorSchedulePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { tutors, updateTutor } = useData()
  const router = useRouter()

  const tutor = tutors[0] // Mock: use first tutor

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user || !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleSaveAvailability = (availability: Record<string, string[]>) => {
    updateTutor(tutor.id, { availability })
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Manage Schedule</h1>
        <p className="text-muted-foreground mb-8">
          Set your weekly availability. Parents will only be able to book during these times.
        </p>

        <AvailabilityEditor availability={tutor.availability} onSave={handleSaveAvailability} />
      </div>
    </PageLayout>
  )
}
