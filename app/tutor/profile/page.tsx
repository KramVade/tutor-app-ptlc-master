"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbInput } from "@/components/ui/airbnb-input"
import { Camera, Plus, X } from "lucide-react"

export default function TutorProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { tutors, updateTutor } = useData()
  const { showToast } = useNotification()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const tutor = tutors[0] // Mock: use first tutor as current user's profile

  const [formData, setFormData] = useState({
    name: tutor?.name || "",
    bio: tutor?.bio || "",
    hourlyRate: tutor?.hourlyRate || 50,
    subjects: tutor?.subjects || [],
    location: tutor?.location || "",
    education: tutor?.education || "",
    experience: tutor?.experience || "",
  })

  const [newSubject, setNewSubject] = useState("")

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

  const handleSave = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      console.log('💾 Saving tutor profile to Firebase...')
      console.log('User ID:', user.id)
      console.log('Profile data:', formData)
      
      // Import Firebase service
      const { updateTutor: updateTutorInFirebase } = await import("@/firebase/tutors")
      
      // Update in Firebase using the user's ID
      await updateTutorInFirebase(user.id, {
        name: formData.name,
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
        subjects: formData.subjects,
        location: formData.location,
        education: formData.education,
        experience: formData.experience,
      })
      
      console.log('✅ Profile updated in Firebase')
      
      // Also update local data context (for UI consistency)
      updateTutor(tutor.id, formData)
      
      showToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been saved successfully.",
      })
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update your profile. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject],
      }))
      setNewSubject("")
    }
  }

  const removeSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }))
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <div className="space-y-6">
          {/* Profile Photo */}
          <AirbnbCard>
            <h2 className="text-xl font-bold mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={tutor.avatar || "/placeholder.svg"}
                  alt={tutor.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-card border border-border rounded-full shadow-sm hover:bg-secondary transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <AirbnbButton variant="outline" size="sm">
                  Upload New Photo
                </AirbnbButton>
                <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>
          </AirbnbCard>

          {/* Basic Info */}
          <AirbnbCard>
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <AirbnbInput
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <AirbnbInput
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full h-32 px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell parents about yourself, your teaching style, and experience..."
                />
              </div>
            </div>
          </AirbnbCard>

          {/* Education & Experience */}
          <AirbnbCard>
            <h2 className="text-xl font-bold mb-4">Education & Experience</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Education</label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Bachelor's in Mathematics, University of XYZ (2018-2022)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teaching Experience</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 5 years teaching high school mathematics, 2 years private tutoring"
                />
              </div>
            </div>
          </AirbnbCard>

          {/* Subjects & Rate */}
          <AirbnbCard>
            <h2 className="text-xl font-bold mb-4">Subjects & Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subjects You Teach</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.subjects.map((subject) => (
                    <span key={subject} className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                      {subject}
                      <button onClick={() => removeSubject(subject)} className="p-0.5 hover:bg-muted rounded-full">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <AirbnbInput
                    placeholder="Add a subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSubject()}
                  />
                  <AirbnbButton variant="outline" onClick={addSubject}>
                    <Plus className="h-5 w-5" />
                  </AirbnbButton>
                </div>
              </div>

              <AirbnbInput
                label="Hourly Rate (Php)"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseInt(e.target.value) })}
              />
            </div>
          </AirbnbCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <AirbnbButton onClick={handleSave} isLoading={isLoading} size="lg">
              Save Changes
            </AirbnbButton>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
