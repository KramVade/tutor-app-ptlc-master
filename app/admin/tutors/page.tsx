"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { DataTable } from "@/components/admin/data-table"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbModal } from "@/components/ui/airbnb-modal"
import { BadgeCheck, X, Eye, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminTutorsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { tutors, updateTutor } = useData()
  const { showToast } = useNotification()
  const router = useRouter()
  const [selectedTutor, setSelectedTutor] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleVerify = (tutorId: string) => {
    updateTutor(tutorId, { verified: true })
    showToast({
      type: "success",
      title: "Tutor Verified",
      message: "The tutor has been verified successfully.",
    })
    setShowModal(false)
  }

  const handleReject = (tutorId: string) => {
    showToast({
      type: "info",
      title: "Verification Rejected",
      message: "The tutor verification has been rejected.",
    })
    setShowModal(false)
  }

  const columns = [
    {
      key: "name",
      label: "Tutor",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar || "/placeholder.svg"} alt={value} className="h-10 w-10 rounded-full object-cover" />
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
          {value.slice(0, 2).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-secondary text-xs rounded-full">
              {s}
            </span>
          ))}
          {value.length > 2 && <span className="text-xs text-muted-foreground">+{value.length - 2}</span>}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: number) => <span className="font-medium">{value} ⭐</span>,
    },
    {
      key: "verified",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            value ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
          )}
        >
          {value ? "Verified" : "Pending"}
        </span>
      ),
    },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Tutor Management</h1>

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

        {/* Tutor Detail Modal */}
        <AirbnbModal isOpen={showModal} onClose={() => setShowModal(false)} title="Tutor Details" size="lg">
          {selectedTutor && (
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={selectedTutor.avatar || "/placeholder.svg"}
                  alt={selectedTutor.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedTutor.name}</h3>
                  <p className="text-muted-foreground">{selectedTutor.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTutor.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        selectedTutor.verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
                      )}
                    >
                      {selectedTutor.verified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Documents</h4>
                  <div className="space-y-2">
                    {selectedTutor.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span>{doc.name}</span>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            doc.status === "verified" ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
                          )}
                        >
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!selectedTutor.verified && (
                <div className="flex gap-3">
                  <AirbnbButton
                    className="flex-1"
                    onClick={() => handleVerify(selectedTutor.id)}
                    leftIcon={<BadgeCheck className="h-5 w-5" />}
                  >
                    Approve
                  </AirbnbButton>
                  <AirbnbButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleReject(selectedTutor.id)}
                    leftIcon={<X className="h-5 w-5" />}
                  >
                    Reject
                  </AirbnbButton>
                </div>
              )}
            </div>
          )}
        </AirbnbModal>
      </div>
    </PageLayout>
  )
}
