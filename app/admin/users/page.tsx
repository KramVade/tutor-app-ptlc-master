"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { DataTable } from "@/components/admin/data-table"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbModal } from "@/components/ui/airbnb-modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Users, GraduationCap, Eye, Mail, Phone, Calendar, X, Baby } from "lucide-react"
import { cn } from "@/lib/utils"

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [parents, setParents] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAllUsers()
    }
  }, [user])

  const loadAllUsers = async () => {
    try {
      setIsLoading(true)
      console.log('👥 Loading all users...')
      
      const [
        { getAllParents },
        { getAllTutors },
        { getAllChildren }
      ] = await Promise.all([
        import("@/firebase/parents"),
        import("@/firebase/tutors"),
        import("@/firebase/children")
      ])

      const [parentsData, tutorsData, childrenData] = await Promise.all([
        getAllParents(),
        getAllTutors(),
        getAllChildren()
      ])

      console.log('✅ Loaded:', { 
        parents: parentsData.length, 
        tutors: tutorsData.length,
        children: childrenData.length 
      })
      
      setParents(parentsData)
      setTutors(tutorsData)
      setChildren(childrenData)
    } catch (error) {
      console.error('❌ Error loading users:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load users"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteParent = async (parentId: string) => {
    if (!confirm('Are you sure you want to delete this parent? This action cannot be undone.')) {
      return
    }

    try {
      setIsUpdating(true)
      const { deleteParent } = await import("@/firebase/parents")
      
      await deleteParent(parentId)
      
      setParents(prev => prev.filter(p => p.id !== parentId))
      setShowModal(false)
      
      showToast({
        type: "success",
        title: "Parent Deleted",
        message: "Parent has been removed from the system"
      })
    } catch (error) {
      console.error('Error deleting parent:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete parent"
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

  const parentColumns = [
    {
      key: "name",
      label: "Parent",
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
      key: "phone",
      label: "Phone",
      render: (value: string) => value || <span className="text-muted-foreground">-</span>,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  const tutorColumns = [
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
            <span className="text-xs text-muted-foreground">None</span>
          )}
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
            value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          )}
        >
          {value ? "Available" : "Unavailable"}
        </span>
      ),
    },
  ]

  // Get children count for each parent
  const getChildrenCount = (parentId: string) => {
    return children.filter(c => c.parentId === parentId).length
  }

  // Get parent's children
  const getParentChildren = (parentId: string) => {
    return children.filter(c => c.parentId === parentId)
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              {parents.length + tutors.length} total users
            </p>
          </div>
          <AirbnbButton onClick={loadAllUsers}>
            Refresh
          </AirbnbButton>
        </div>

        <Tabs defaultValue="parents">
          <TabsList className="mb-6">
            <TabsTrigger value="parents">
              <Users className="h-4 w-4 mr-2" />
              Parents ({parents.length})
            </TabsTrigger>
            <TabsTrigger value="tutors">
              <GraduationCap className="h-4 w-4 mr-2" />
              Tutors ({tutors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parents">
            {parents.length === 0 ? (
              <AirbnbCard>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No parents found</p>
                </div>
              </AirbnbCard>
            ) : (
              <DataTable
                columns={parentColumns}
                data={parents}
                searchPlaceholder="Search parents..."
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <AirbnbButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser({ ...row, type: 'parent' })
                        setShowModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </AirbnbButton>
                  </div>
                )}
              />
            )}
          </TabsContent>

          <TabsContent value="tutors">
            {tutors.length === 0 ? (
              <AirbnbCard>
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tutors found</p>
                </div>
              </AirbnbCard>
            ) : (
              <DataTable
                columns={tutorColumns}
                data={tutors}
                searchPlaceholder="Search tutors..."
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <AirbnbButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser({ ...row, type: 'tutor' })
                        setShowModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </AirbnbButton>
                  </div>
                )}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* User Detail Modal */}
        <AirbnbModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title={`${selectedUser?.type === 'parent' ? 'Parent' : 'Tutor'} Details`}
          size="lg"
        >
          {selectedUser && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedUser.email}
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedUser.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent-specific info */}
              {selectedUser.type === 'parent' && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Children ({getChildrenCount(selectedUser.id)})
                  </h4>
                  {getParentChildren(selectedUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getParentChildren(selectedUser.id).map((child: any) => (
                        <AirbnbCard key={child.id}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {child.age} years old • {child.gradeLevel}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground capitalize">
                              {child.gender}
                            </span>
                          </div>
                        </AirbnbCard>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No children registered</p>
                  )}
                </div>
              )}

              {/* Tutor-specific info */}
              {selectedUser.type === 'tutor' && (
                <div className="space-y-4 mb-6">
                  {selectedUser.bio && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.subjects && selectedUser.subjects.length > 0 ? (
                        selectedUser.subjects.map((subject: string) => (
                          <span key={subject} className="px-3 py-1 bg-secondary rounded-full text-sm">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No subjects listed</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AirbnbCard>
                      <div className="text-center">
                        <p className="text-2xl font-bold">₱{selectedUser.hourlyRate || 0}</p>
                        <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      </div>
                    </AirbnbCard>
                    <AirbnbCard>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedUser.rating || 0} ⭐</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </AirbnbCard>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <AirbnbButton
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (selectedUser.type === 'parent') {
                      handleDeleteParent(selectedUser.id)
                    } else {
                      handleDeleteTutor(selectedUser.id)
                    }
                  }}
                  disabled={isUpdating}
                  isLoading={isUpdating}
                  leftIcon={<X className="h-5 w-5" />}
                >
                  Delete User
                </AirbnbButton>
              </div>
            </div>
          )}
        </AirbnbModal>
      </div>
    </PageLayout>
  )
}
