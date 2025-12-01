"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { DataTable } from "@/components/admin/data-table"
import { StatsCard } from "@/components/admin/stats-card"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbModal } from "@/components/ui/airbnb-modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Star,
  User,
  FileText,
  Clock,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllReports, updateReportStatus, type Report } from "@/firebase/reports"

export default function AdminModerationPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      loadReports()
    }
  }, [user])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      const data = await getAllReports()
      setReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load reports",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setShowReportModal(true)
  }

  const handleResolveReport = async (id: string, action: "approve" | "dismiss") => {
    try {
      setIsUpdating(true)
      const status = action === "approve" ? "resolved" : "dismissed"
      const adminNotes = action === "approve" ? "Action taken by admin" : "Report dismissed by admin"
      
      await updateReportStatus(id, status, user.id, adminNotes)
      
      // Reload reports
      await loadReports()
      
      setShowReportModal(false)
      showToast({
        type: "success",
        title: action === "approve" ? "Report Resolved" : "Report Dismissed",
        message: action === "approve" ? "Appropriate action has been taken." : "The report has been dismissed.",
      })
    } catch (error) {
      console.error("Error updating report:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update report",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: Report["status"]) => {
    try {
      await updateReportStatus(id, status, user.id)
      await loadReports()
      showToast({
        type: "success",
        title: "Status Updated",
        message: `Report status changed to ${status}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update status",
      })
    }
  }

  const reportColumns = [
    {
      key: "id",
      label: "Report ID",
      render: (value: string) => <span className="font-mono text-sm">{value?.substring(0, 8) || "N/A"}</span>,
    },
    {
      key: "reportedUserType",
      label: "Type",
      render: (value: string) => (
        <span className="inline-flex items-center gap-1 capitalize">
          {value === "tutor" && <User className="h-4 w-4" />}
          {value === "parent" && <User className="h-4 w-4" />}
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "reportedUserName",
      label: "Reported User",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value || "Unknown"}</p>
          <p className="text-sm text-muted-foreground">{row.category?.replace(/_/g, " ") || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: string) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium capitalize",
            value === "high" && "bg-destructive/10 text-destructive",
            value === "urgent" && "bg-destructive/20 text-destructive font-bold",
            value === "medium" && "bg-warning/10 text-warning",
            value === "low" && "bg-muted text-muted-foreground",
          )}
        >
          {value || "medium"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
            value === "pending" && "bg-warning/10 text-warning",
            value === "under_review" && "bg-blue-100 text-blue-700",
            value === "resolved" && "bg-success/10 text-success",
            value === "dismissed" && "bg-muted text-muted-foreground",
          )}
        >
          {value === "pending" && <Clock className="h-3 w-3" />}
          {value === "under_review" && <Eye className="h-3 w-3" />}
          {value === "resolved" && <CheckCircle className="h-3 w-3" />}
          {value === "dismissed" && <XCircle className="h-3 w-3" />}
          {value?.replace("_", " ") || "pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  const pendingReports = reports.filter((r) => r.status === "pending").length
  const underReview = reports.filter((r) => r.status === "under_review").length
  const resolvedToday = reports.filter(
    (r) => r.status === "resolved" && new Date(r.createdAt).toDateString() === new Date().toDateString(),
  ).length
  const urgentReports = reports.filter((r) => r.priority === "urgent" && r.status === "pending").length

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Content Moderation</h1>
            <p className="text-muted-foreground mt-1">Review and manage reported content across the platform.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Pending Reports"
            value={pendingReports.toString()}
            icon={<Flag className="h-5 w-5" />}
          />
          <StatsCard
            title="Under Review"
            value={underReview.toString()}
            icon={<Eye className="h-5 w-5" />}
          />
          <StatsCard
            title="Urgent Reports"
            value={urgentReports.toString()}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatsCard
            title="Resolved Today"
            value={resolvedToday.toString()}
            icon={<Shield className="h-5 w-5" />}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports">
          <TabsList className="mb-6">
            <TabsTrigger value="reports">
              User Reports ({reports.filter((r) => r.status !== "resolved" && r.status !== "dismissed").length})
            </TabsTrigger>
            <TabsTrigger value="flagged">Flagged Content (0)</TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({reports.filter((r) => r.status === "resolved" || r.status === "dismissed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <AirbnbCard>
              <DataTable
                columns={reportColumns}
                data={reports.filter((r) => r.status !== "resolved" && r.status !== "dismissed")}
                searchPlaceholder="Search reports..."
                actions={(row) => (
                  <AirbnbButton variant="outline" size="sm" onClick={() => handleViewReport(row)}>
                    <Eye className="h-4 w-4 mr-1" /> Review
                  </AirbnbButton>
                )}
              />
            </AirbnbCard>
          </TabsContent>

          <TabsContent value="flagged">
            <AirbnbCard>
              <div className="p-8 text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Auto-flagged content detection coming soon</p>
                <p className="text-sm mt-2">This feature will automatically detect and flag potentially problematic content</p>
              </div>
            </AirbnbCard>
          </TabsContent>

          <TabsContent value="resolved">
            <AirbnbCard>
              <DataTable
                columns={[
                  ...reportColumns,
                  {
                    key: "adminNotes",
                    label: "Resolution",
                    render: (value: string) => <span className="text-sm text-muted-foreground">{value || "-"}</span>,
                  },
                  {
                    key: "resolvedAt",
                    label: "Resolved At",
                    render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
                  },
                ]}
                data={reports.filter((r) => r.status === "resolved" || r.status === "dismissed")}
                searchPlaceholder="Search resolved reports..."
              />
            </AirbnbCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Detail Modal */}
      <AirbnbModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Review Report" size="lg">
        {selectedReport && (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Report ID</label>
                <p className="font-mono text-sm">{selectedReport.id?.substring(0, 12) || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Category</label>
                <p className="capitalize">{selectedReport.category?.replace(/_/g, " ") || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Reported By</label>
                <p>{selectedReport.reporterName}</p>
                <p className="text-xs text-muted-foreground">{selectedReport.reporterEmail}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Priority</label>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    selectedReport.priority === "urgent" && "bg-destructive/20 text-destructive font-bold",
                    selectedReport.priority === "high" && "bg-destructive/10 text-destructive",
                    selectedReport.priority === "medium" && "bg-warning/10 text-warning",
                    selectedReport.priority === "low" && "bg-muted text-muted-foreground",
                  )}
                >
                  {selectedReport.priority}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Reported User</label>
              <p className="font-medium">{selectedReport.reportedUserName}</p>
              <p className="text-sm text-muted-foreground capitalize">Type: {selectedReport.reportedUserType}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <div className="mt-2 p-4 bg-secondary rounded-lg">
                <p className="text-sm">{selectedReport.description}</p>
              </div>
            </div>

            {selectedReport.bookingId && (
              <div>
                <label className="text-sm text-muted-foreground">Related Booking</label>
                <p className="font-mono text-sm">{selectedReport.bookingId}</p>
              </div>
            )}

            {selectedReport.adminNotes && (
              <div>
                <label className="text-sm text-muted-foreground">Admin Notes</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm">{selectedReport.adminNotes}</p>
                </div>
              </div>
            )}

            {selectedReport.status !== "resolved" && selectedReport.status !== "dismissed" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <AirbnbButton 
                  className="flex-1" 
                  onClick={() => handleResolveReport(selectedReport.id!, "approve")}
                  disabled={isUpdating}
                  isLoading={isUpdating}
                >
                  Take Action
                </AirbnbButton>
                <AirbnbButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleResolveReport(selectedReport.id!, "dismiss")}
                  disabled={isUpdating}
                >
                  Dismiss Report
                </AirbnbButton>
              </div>
            )}
          </div>
        )}
      </AirbnbModal>
    </PageLayout>
  )
}
