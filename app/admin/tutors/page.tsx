"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { DataTable } from "@/components/admin/data-table"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbModal } from "@/components/ui/airbnb-modal"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { BadgeCheck, X, Eye, FileText, Mail, Phone, MapPin, DollarSign, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminTutorsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [tutors, setTutors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTutor, setSelectedTutor] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      loadTutors()
    }
  }, [user])

  const loadTutors = async () => {
    try {
      setIsLoading(true)
      console.log('📚 Loading tutors...')
      
      const { getAllTutors } = await import("@/firebase/tutors")
      const tutorsData = await getAllTutors()
      
      console.log('✅ Loaded tutors:', tutorsData.length)
      setTutors(tutorsData)
    } catch (error) {
      console.error('❌ Error loading tutors:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load tutors"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAvailability = async (tutorId: string, currentStatus: boolean) => {
    try {
      setIsUpdating(true)
      const { updateTutor } = await import("@/firebase/tutors")
      
      await updateTutor(tutorId, { available: !currentStatus })
      
      // Update local state
      setTutors(prev => prev.map(t => 
        t.id === tutorId ? { ...t, available: !currentStatus } : t
      ))
      
      if (selectedTutor?.id === tutorId) {
        setSelectedTutor({ ...selectedTutor, available: !currentStatus })
      }
      
      showToast({
        type: "success",
        title: "Status Updated",
        message: `Tutor is now ${!currentStatus ? 'available' : 'unavailable'}`
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update tutor status"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTutor = async (tutorId: string) => {
    if (!confirm('Are you sure you want to delete this tutor? This action cannot be undone.')) {
      return
    }

    try {
      setIsUpdating(true)
      const { deleteTutor } = await import("@/firebase/tutors")
      
      await deleteTutor(tutorId)
      
      // Update local state
      setTutors(prev => prev.filter(t => t.id !== tutorId))
      setShowModal(false)
      
      showToast({
        type: "success",
        title: "Tutor Deleted",
        message: "Tutor has been removed from the system"
      })
    } catch (error) {
      console.error('Error deleting tutor:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete tutor"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const columns = [
    {
      key: "name",
      label: "Tutor",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            <>
              {value.slice(0, 2).map((s) => (
                <span key={s} className="px-2 py-0.5 bg-secondary text-xs rounded-full">
                  {s}
                </span>
              ))}
              {value.length > 2 && (
                <span className="text-xs text-muted-foreground">+{value.length - 2}</span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No subjects</span>
          )}
        </div>
      ),
    },
    {
      key: "hourlyRate",
      label: "Rate",
      render: (value: number) => <span className="font-medium">₱{value || 0}/hr</span>,
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-medium">{value || 0}</span>
        </div>
      ),
    },
    {
      key: "available",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          {value ? "Available" : "Unavailable"}
        </span>
      ),
    },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tutor Management</h1>
            <p className="text-muted-foreground mt-1">
              {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <AirbnbButton onClick={loadTutors}>
            Refresh
          </AirbnbButton>
        </div>

        {tutors.length === 0 ? (
          <AirbnbCard>
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tutors found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tutors will appear here once they register
              </p>
            </div>
          </AirbnbCard>
        ) : (
          <DataTable
            columns={columns}
            data={tutors}
            searchPlaceholder="Search tutors..."
            actions={(row) => (
              <div className="flex items-center gap-2">
                <AirbnbButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTutor(row)
                    setShowModal(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </AirbnbButton>
              </div>
            )}
          />
        )}

        {/* Tutor Detail Modal */}
        <AirbnbModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title="Tutor Details" 
          size="lg"
        >
          {selectedTutor && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {selectedTutor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedTutor.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedTutor.email}
                    </div>
                    {selectedTutor.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedTutor.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        selectedTutor.available 
                          ? "bg-success/10 text-success" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {selectedTutor.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                {/* Bio */}
                {selectedTutor.bio && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{selectedTutor.bio}</p>
                  </div>
                )}

                {/* Subjects */}
                <div>
                  <h4 className="font-semibold mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.subjects && selectedTutor.subjects.length > 0 ? (
                      selectedTutor.subjects.map((subject: string) => (
                        <span key={subject} className="px-3 py-1 bg-secondary rounded-full text-sm">
                          {subject}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No subjects listed</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <AirbnbCard>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <p className="text-2xl font-bold">₱{selectedTutor.hourlyRate || 0}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                    </div>
                  </AirbnbCard>
                  <AirbnbCard>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <p className="text-2xl font-bold">{selectedTutor.rating || 0}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </AirbnbCard>
                  <AirbnbCard>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedTutor.totalSessions || 0}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                  </AirbnbCard>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <AirbnbButton
                  className="flex-1"
                  variant={selectedTutor.available ? "outline" : "primary"}
                  onClick={() => handleToggleAvailability(selectedTutor.id, selectedTutor.available)}
                  disabled={isUpdating}
                  isLoading={isUpdating}
                >
                  {selectedTutor.available ? "Mark Unavailable" : "Mark Available"}
                </AirbnbButton>
                <AirbnbButton
                  variant="destructive"
                  onClick={() => handleDeleteTutor(selectedTutor.id)}
                  disabled={isUpdating}
                  leftIcon={<X className="h-5 w-5" />}
                >
                  Delete
                </AirbnbButton>
              </div>
            </div>
          )}
        </AirbnbModal>
      </div>
    </PageLayout>
  )
}
