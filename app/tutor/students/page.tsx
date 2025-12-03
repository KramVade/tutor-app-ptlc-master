"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbModal } from "@/components/ui/airbnb-modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Users, Check, X, Clock, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function TutorStudentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === "tutor") {
      loadChildren()
    }
  }, [user])

  const loadChildren = async () => {
    try {
      setIsLoading(true)
      console.log('👶 Loading children profiles...')

      const { getAllChildren } = await import("@/firebase/children")
      const childrenData = await getAllChildren()

      console.log('✅ Loaded children:', childrenData.length)
      setChildren(childrenData)
    } catch (error) {
      console.error('❌ Error loading children:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load student profiles"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (childId: string) => {
    if (!user) return

    try {
      setIsUpdating(true)
      const { confirmChild } = await import("@/firebase/children")

      await confirmChild(childId, user.id, user.name)

      // Update local state
      setChildren(prev => prev.map(c =>
        c.id === childId
          ? {
              ...c,
              status: 'confirmed',
              confirmedBy: user.id,
              confirmedByName: user.name,
              confirmedAt: new Date().toISOString()
            }
          : c
      ))

      setShowModal(false)

      showToast({
        type: "success",
        title: "Profile Confirmed",
        message: "Student profile has been confirmed"
      })
    } catch (error) {
      console.error('Error confirming child:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to confirm profile"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async (childId: string) => {
    if (!user) return

    try {
      setIsUpdating(true)
      const { rejectChild } = await import("@/firebase/children")

      await rejectChild(childId, user.id, user.name, rejectionReason)

      // Update local state
      setChildren(prev => prev.map(c =>
        c.id === childId
          ? {
              ...c,
              status: 'rejected',
              rejectedBy: user.id,
              rejectedByName: user.name,
              rejectedAt: new Date().toISOString(),
              rejectionReason
            }
          : c
      ))

      setShowModal(false)
      setRejectionReason('')

      showToast({
        type: "info",
        title: "Profile Rejected",
        message: "Parent has been notified to update the profile"
      })
    } catch (error) {
      console.error('Error rejecting child:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to reject profile"
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

  const pendingChildren = children.filter(c => c.status === 'pending')
  const confirmedChildren = children.filter(c => c.status === 'confirmed')
  const rejectedChildren = children.filter(c => c.status === 'rejected')

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard */}
        <Link
          href="/tutor/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Profiles</h1>
          <p className="text-muted-foreground mt-1">
            Review and confirm student profiles before sessions
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending ({pendingChildren.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              <Check className="h-4 w-4 mr-2" />
              Confirmed ({confirmedChildren.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <X className="h-4 w-4 mr-2" />
              Rejected ({rejectedChildren.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingChildren.length === 0 ? (
              <AirbnbCard>
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending profiles</p>
                </div>
              </AirbnbCard>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingChildren.map((child) => (
                  <AirbnbCard key={child.id} hoverable onClick={() => {
                    setSelectedChild(child)
                    setShowModal(true)
                  }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {child.age} years • {child.gradeLevel}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Parent: {child.parentEmail}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                        Pending
                      </span>
                    </div>
                  </AirbnbCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmed">
            {confirmedChildren.length === 0 ? (
              <AirbnbCard>
                <div className="text-center py-12">
                  <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No confirmed profiles</p>
                </div>
              </AirbnbCard>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {confirmedChildren.map((child) => (
                  <AirbnbCard key={child.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {child.age} years • {child.gradeLevel}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Confirmed {new Date(child.confirmedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                        Confirmed
                      </span>
                    </div>
                  </AirbnbCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedChildren.length === 0 ? (
              <AirbnbCard>
                <div className="text-center py-12">
                  <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rejected profiles</p>
                </div>
              </AirbnbCard>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {rejectedChildren.map((child) => (
                  <AirbnbCard key={child.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {child.age} years • {child.gradeLevel}
                          </p>
                          {child.rejectionReason && (
                            <p className="text-xs text-destructive mt-1">
                              Reason: {child.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                        Rejected
                      </span>
                    </div>
                  </AirbnbCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Child Detail Modal */}
        <AirbnbModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setRejectionReason('')
          }}
          title="Student Profile"
          size="md"
        >
          {selectedChild && (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedChild.name}</h3>
                    <p className="text-muted-foreground">
                      {selectedChild.age} years old • {selectedChild.gender}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade Level:</span>
                    <span className="font-medium">{selectedChild.gradeLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parent:</span>
                    <span className="font-medium">{selectedChild.parentEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="font-medium">
                      {new Date(selectedChild.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        selectedChild.status === 'confirmed' && "bg-success/10 text-success",
                        selectedChild.status === 'pending' && "bg-warning/10 text-warning",
                        selectedChild.status === 'rejected' && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {selectedChild.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedChild.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Rejection Reason (optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason if rejecting..."
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <AirbnbButton
                      className="flex-1"
                      onClick={() => handleConfirm(selectedChild.id)}
                      disabled={isUpdating}
                      isLoading={isUpdating}
                      leftIcon={<Check className="h-5 w-5" />}
                    >
                      Confirm Profile
                    </AirbnbButton>
                    <AirbnbButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleReject(selectedChild.id)}
                      disabled={isUpdating}
                      leftIcon={<X className="h-5 w-5" />}
                    >
                      Request Update
                    </AirbnbButton>
                  </div>
                </>
              )}

              {selectedChild.status === 'confirmed' && (
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-sm text-success">
                    ✓ Confirmed by you on {new Date(selectedChild.confirmedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedChild.status === 'rejected' && (
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive mb-2">
                    Rejected on {new Date(selectedChild.rejectedAt).toLocaleDateString()}
                  </p>
                  {selectedChild.rejectionReason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {selectedChild.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </AirbnbModal>
      </div>
    </PageLayout>
  )
}
