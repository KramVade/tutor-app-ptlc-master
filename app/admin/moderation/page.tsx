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

const mockReportsData = [
  {
    id: "REP-001",
    type: "review",
    reportedBy: "John Thompson",
    reportedItem: "Review by Anonymous User",
    content: "This review contains inappropriate language and false claims about the tutor.",
    reason: "Inappropriate content",
    status: "pending",
    priority: "high",
    date: "2024-01-15T10:30:00Z",
  },
  {
    id: "REP-002",
    type: "profile",
    reportedBy: "Maria Garcia",
    reportedItem: "Tutor: Robert Martinez",
    content: "This tutor's profile contains misleading information about their qualifications.",
    reason: "Misleading information",
    status: "under_review",
    priority: "medium",
    date: "2024-01-14T14:20:00Z",
  },
  {
    id: "REP-003",
    type: "message",
    reportedBy: "Sarah Johnson",
    reportedItem: "Message from Parent Account",
    content: "Received spam messages promoting external tutoring services.",
    reason: "Spam",
    status: "pending",
    priority: "low",
    date: "2024-01-13T09:15:00Z",
  },
  {
    id: "REP-004",
    type: "review",
    reportedBy: "Michael Chen",
    reportedItem: "Review by David Lee",
    content: "This review was posted by someone who never had a session with me.",
    reason: "Fake review",
    status: "resolved",
    priority: "high",
    date: "2024-01-12T16:45:00Z",
    resolution: "Review removed",
  },
  {
    id: "REP-005",
    type: "profile",
    reportedBy: "Emily Rodriguez",
    reportedItem: "Parent: Anonymous User",
    content: "This account has been creating multiple bookings and cancelling them.",
    reason: "Abuse of service",
    status: "resolved",
    priority: "high",
    date: "2024-01-10T11:30:00Z",
    resolution: "Account suspended",
  },
]

const mockFlaggedContent = [
  {
    id: "FLAG-001",
    type: "review",
    content: "Terrible experience! The tutor was completely incompetent and a waste of money!!!",
    author: "Anonymous Parent",
    target: "Sarah Johnson",
    reason: "Auto-flagged: Potential harassment",
    date: "2024-01-15T08:00:00Z",
  },
  {
    id: "FLAG-002",
    type: "message",
    content: "Hey, I can offer you tutoring outside the platform for cheaper rates. Contact me at...",
    author: "Unknown User",
    target: "Multiple parents",
    reason: "Auto-flagged: External solicitation",
    date: "2024-01-14T15:30:00Z",
  },
  {
    id: "FLAG-003",
    type: "bio",
    content: "Professional tutor with 20 years experience. PhD from Harvard. Best rates guaranteed!",
    author: "Robert Martinez",
    target: "Profile",
    reason: "Auto-flagged: Unverified claims",
    date: "2024-01-13T12:00:00Z",
  },
]

export default function AdminModerationPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [reports, setReports] = useState(mockReportsData)
  const [flaggedContent, setFlaggedContent] = useState(mockFlaggedContent)
  const [selectedReport, setSelectedReport] = useState<(typeof mockReportsData)[0] | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

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

  const handleViewReport = (report: (typeof mockReportsData)[0]) => {
    setSelectedReport(report)
    setShowReportModal(true)
  }

  const handleResolveReport = (id: string, action: "approve" | "dismiss") => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: "resolved",
            resolution: action === "approve" ? "Action taken" : "Report dismissed",
          }
        }
        return r
      }),
    )
    setShowReportModal(false)
    showToast({
      type: "success",
      title: action === "approve" ? "Report Resolved" : "Report Dismissed",
      message: action === "approve" ? "Appropriate action has been taken." : "The report has been dismissed.",
    })
  }

  const handleRemoveContent = (id: string) => {
    setFlaggedContent((prev) => prev.filter((c) => c.id !== id))
    showToast({
      type: "success",
      title: "Content Removed",
      message: "The flagged content has been removed from the platform.",
    })
  }

  const handleApproveContent = (id: string) => {
    setFlaggedContent((prev) => prev.filter((c) => c.id !== id))
    showToast({
      type: "success",
      title: "Content Approved",
      message: "The content has been approved and will remain visible.",
    })
  }

  const reportColumns = [
    {
      key: "id",
      label: "Report ID",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span className="inline-flex items-center gap-1 capitalize">
          {value === "review" && <Star className="h-4 w-4" />}
          {value === "profile" && <User className="h-4 w-4" />}
          {value === "message" && <MessageSquare className="h-4 w-4" />}
          {value}
        </span>
      ),
    },
    {
      key: "reportedItem",
      label: "Reported Item",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-muted-foreground">{row.reason}</p>
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
            value === "medium" && "bg-warning/10 text-warning",
            value === "low" && "bg-muted text-muted-foreground",
          )}
        >
          {value}
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
          )}
        >
          {value === "pending" && <Clock className="h-3 w-3" />}
          {value === "under_review" && <Eye className="h-3 w-3" />}
          {value === "resolved" && <CheckCircle className="h-3 w-3" />}
          {value.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  const flaggedColumns = [
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span className="inline-flex items-center gap-1 capitalize">
          {value === "review" && <Star className="h-4 w-4" />}
          {value === "message" && <MessageSquare className="h-4 w-4" />}
          {value === "bio" && <FileText className="h-4 w-4" />}
          {value}
        </span>
      ),
    },
    {
      key: "content",
      label: "Content",
      render: (value: string) => <p className="text-sm line-clamp-2 max-w-md">{value}</p>,
    },
    {
      key: "author",
      label: "Author",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-muted-foreground">→ {row.target}</p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (value: string) => (
        <span className="text-sm text-warning flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {value}
        </span>
      ),
    },
  ]

  const pendingReports = reports.filter((r) => r.status === "pending").length
  const underReview = reports.filter((r) => r.status === "under_review").length
  const resolvedToday = reports.filter(
    (r) => r.status === "resolved" && new Date(r.date).toDateString() === new Date().toDateString(),
  ).length

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
            subtitle="Requires action"
            icon={<Flag className="h-5 w-5" />}
          />
          <StatsCard
            title="Under Review"
            value={underReview.toString()}
            subtitle="Being investigated"
            icon={<Eye className="h-5 w-5" />}
          />
          <StatsCard
            title="Flagged Content"
            value={flaggedContent.length.toString()}
            subtitle="Auto-detected"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatsCard
            title="Resolved Today"
            value={resolvedToday.toString()}
            subtitle="Completed"
            icon={<Shield className="h-5 w-5" />}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports">
          <TabsList className="mb-6">
            <TabsTrigger value="reports">
              User Reports ({reports.filter((r) => r.status !== "resolved").length})
            </TabsTrigger>
            <TabsTrigger value="flagged">Flagged Content ({flaggedContent.length})</TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({reports.filter((r) => r.status === "resolved").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <AirbnbCard>
              <DataTable
                columns={reportColumns}
                data={reports.filter((r) => r.status !== "resolved")}
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
              <DataTable
                columns={flaggedColumns}
                data={flaggedContent}
                searchPlaceholder="Search flagged content..."
                actions={(row) => (
                  <div className="flex gap-2">
                    <AirbnbButton
                      variant="ghost"
                      size="sm"
                      className="text-success hover:text-success"
                      onClick={() => handleApproveContent(row.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </AirbnbButton>
                    <AirbnbButton
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveContent(row.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </AirbnbButton>
                  </div>
                )}
              />
            </AirbnbCard>
          </TabsContent>

          <TabsContent value="resolved">
            <AirbnbCard>
              <DataTable
                columns={[
                  ...reportColumns,
                  {
                    key: "resolution",
                    label: "Resolution",
                    render: (value: string) => <span className="text-sm text-muted-foreground">{value || "-"}</span>,
                  },
                ]}
                data={reports.filter((r) => r.status === "resolved")}
                searchPlaceholder="Search resolved reports..."
              />
            </AirbnbCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Detail Modal */}
      <AirbnbModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Review Report" size="lg">
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Report ID</label>
                <p className="font-mono">{selectedReport.id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <p className="capitalize">{selectedReport.type}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Reported By</label>
                <p>{selectedReport.reportedBy}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Priority</label>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
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
              <label className="text-sm text-muted-foreground">Reported Item</label>
              <p className="font-medium">{selectedReport.reportedItem}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Reason</label>
              <p>{selectedReport.reason}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <div className="mt-2 p-4 bg-secondary rounded-lg">
                <p className="text-sm">{selectedReport.content}</p>
              </div>
            </div>

            {selectedReport.status !== "resolved" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <AirbnbButton className="flex-1" onClick={() => handleResolveReport(selectedReport.id, "approve")}>
                  Take Action
                </AirbnbButton>
                <AirbnbButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleResolveReport(selectedReport.id, "dismiss")}
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
