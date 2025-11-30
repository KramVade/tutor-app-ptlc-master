"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { DataTable } from "@/components/admin/data-table"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserX, UserCheck, Users, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const mockParents = [
  {
    id: "p1",
    name: "John Thompson",
    email: "john@email.com",
    children: 2,
    bookings: 15,
    status: "active",
    joined: "2023-06-15",
  },
  {
    id: "p2",
    name: "Maria Garcia",
    email: "maria@email.com",
    children: 1,
    bookings: 8,
    status: "active",
    joined: "2023-08-20",
  },
  {
    id: "p3",
    name: "David Lee",
    email: "david@email.com",
    children: 3,
    bookings: 22,
    status: "suspended",
    joined: "2023-04-10",
  },
  {
    id: "p4",
    name: "Sarah Wilson",
    email: "sarah@email.com",
    children: 1,
    bookings: 5,
    status: "active",
    joined: "2023-11-01",
  },
]

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [parents, setParents] = useState(mockParents)

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

  const toggleStatus = (id: string) => {
    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === "active" ? "suspended" : "active"
          showToast({
            type: newStatus === "active" ? "success" : "warning",
            title: `User ${newStatus === "active" ? "Restored" : "Suspended"}`,
            message: `${p.name} has been ${newStatus === "active" ? "restored" : "suspended"}.`,
          })
          return { ...p, status: newStatus }
        }
        return p
      }),
    )
  }

  const parentColumns = [
    {
      key: "name",
      label: "Name",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "children", label: "Children" },
    { key: "bookings", label: "Bookings" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            value === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {value}
        </span>
      ),
    },
    {
      key: "joined",
      label: "Joined",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        <Tabs defaultValue="parents">
          <TabsList className="mb-6">
            <TabsTrigger value="parents">
              <Users className="h-4 w-4 mr-2" />
              Parents ({parents.length})
            </TabsTrigger>
            <TabsTrigger value="tutors">
              <GraduationCap className="h-4 w-4 mr-2" />
              Tutors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parents">
            <DataTable
              columns={parentColumns}
              data={parents}
              searchPlaceholder="Search parents..."
              actions={(row) => (
                <AirbnbButton
                  variant={row.status === "active" ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => toggleStatus(row.id)}
                >
                  {row.status === "active" ? (
                    <>
                      <UserX className="h-4 w-4 mr-1" /> Suspend
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" /> Restore
                    </>
                  )}
                </AirbnbButton>
              )}
            />
          </TabsContent>

          <TabsContent value="tutors">
            <p className="text-center py-8 text-muted-foreground">
              Tutor management is available in the Tutors section.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
