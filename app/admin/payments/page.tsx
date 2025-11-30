"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { DataTable } from "@/components/admin/data-table"
import { StatsCard } from "@/components/admin/stats-card"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mockInvoices = [
  {
    id: "INV-001",
    parent: "John Thompson",
    tutor: "Sarah Johnson",
    amount: 195,
    sessions: 3,
    date: "2024-01-15",
    status: "paid",
    dueDate: "2024-01-20",
  },
  {
    id: "INV-002",
    parent: "Maria Garcia",
    tutor: "Michael Chen",
    amount: 150,
    sessions: 2,
    date: "2024-01-14",
    status: "pending",
    dueDate: "2024-01-21",
  },
  {
    id: "INV-003",
    parent: "David Lee",
    tutor: "Emily Rodriguez",
    amount: 275,
    sessions: 5,
    date: "2024-01-12",
    status: "paid",
    dueDate: "2024-01-19",
  },
  {
    id: "INV-004",
    parent: "Sarah Wilson",
    tutor: "Jessica Williams",
    amount: 140,
    sessions: 2,
    date: "2024-01-10",
    status: "overdue",
    dueDate: "2024-01-15",
  },
  {
    id: "INV-005",
    parent: "Robert Brown",
    tutor: "David Kim",
    amount: 320,
    sessions: 4,
    date: "2024-01-08",
    status: "paid",
    dueDate: "2024-01-15",
  },
]

const mockPayouts = [
  {
    id: "PAY-001",
    tutor: "Sarah Johnson",
    amount: 1250,
    sessions: 19,
    period: "Jan 1-15, 2024",
    status: "completed",
    date: "2024-01-16",
  },
  {
    id: "PAY-002",
    tutor: "Michael Chen",
    amount: 980,
    sessions: 13,
    period: "Jan 1-15, 2024",
    status: "processing",
    date: "2024-01-16",
  },
  {
    id: "PAY-003",
    tutor: "Emily Rodriguez",
    amount: 1680,
    sessions: 28,
    period: "Jan 1-15, 2024",
    status: "completed",
    date: "2024-01-16",
  },
  {
    id: "PAY-004",
    tutor: "Jessica Williams",
    amount: 890,
    sessions: 12,
    period: "Jan 1-15, 2024",
    status: "pending",
    date: "2024-01-16",
  },
]

const mockTransactions = [
  {
    id: "TXN-001",
    type: "payment",
    from: "John Thompson",
    to: "PTLC Digital Coach",
    amount: 65,
    fee: 6.5,
    date: "2024-01-15T14:30:00Z",
    status: "completed",
  },
  {
    id: "TXN-002",
    type: "payout",
    from: "PTLC Digital Coach",
    to: "Sarah Johnson",
    amount: 58.5,
    fee: 0,
    date: "2024-01-15T15:00:00Z",
    status: "completed",
  },
  {
    id: "TXN-003",
    type: "refund",
    from: "PTLC Digital Coach",
    to: "Maria Garcia",
    amount: 75,
    fee: -7.5,
    date: "2024-01-14T10:15:00Z",
    status: "completed",
  },
  {
    id: "TXN-004",
    type: "payment",
    from: "David Lee",
    to: "PTLC Digital Coach",
    amount: 112.5,
    fee: 11.25,
    date: "2024-01-13T09:45:00Z",
    status: "completed",
  },
  {
    id: "TXN-005",
    type: "payment",
    from: "Sarah Wilson",
    to: "PTLC Digital Coach",
    amount: 70,
    fee: 7,
    date: "2024-01-12T16:20:00Z",
    status: "failed",
  },
]

export default function AdminPaymentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [invoices] = useState(mockInvoices)
  const [payouts] = useState(mockPayouts)
  const [transactions] = useState(mockTransactions)

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

  const invoiceColumns = [
    {
      key: "id",
      label: "Invoice",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "parent",
      label: "Parent",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-muted-foreground">{row.sessions} sessions</p>
        </div>
      ),
    },
    { key: "tutor", label: "Tutor" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => <span className="font-semibold">${value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            value === "paid" && "bg-success/10 text-success",
            value === "pending" && "bg-warning/10 text-warning",
            value === "overdue" && "bg-destructive/10 text-destructive",
          )}
        >
          {value === "paid" && <CheckCircle className="h-3 w-3" />}
          {value === "pending" && <Clock className="h-3 w-3" />}
          {value === "overdue" && <XCircle className="h-3 w-3" />}
          {value}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  const payoutColumns = [
    {
      key: "id",
      label: "Payout ID",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "tutor",
      label: "Tutor",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-muted-foreground">{row.sessions} sessions</p>
        </div>
      ),
    },
    { key: "period", label: "Period" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => <span className="font-semibold">${value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            value === "completed" && "bg-success/10 text-success",
            value === "processing" && "bg-blue-100 text-blue-700",
            value === "pending" && "bg-warning/10 text-warning",
          )}
        >
          {value}
        </span>
      ),
    },
  ]

  const transactionColumns = [
    {
      key: "id",
      label: "Transaction",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
            value === "payment" && "bg-success/10 text-success",
            value === "payout" && "bg-blue-100 text-blue-700",
            value === "refund" && "bg-warning/10 text-warning",
          )}
        >
          {value === "payment" && <ArrowDownRight className="h-3 w-3" />}
          {value === "payout" && <ArrowUpRight className="h-3 w-3" />}
          {value === "refund" && <ArrowUpRight className="h-3 w-3" />}
          {value}
        </span>
      ),
    },
    {
      key: "from",
      label: "From/To",
      render: (value: string, row: any) => (
        <div className="text-sm">
          <p>{value}</p>
          <p className="text-muted-foreground">→ {row.to}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => <span className="font-semibold">${value}</span>,
    },
    {
      key: "fee",
      label: "Fee",
      render: (value: number) => (
        <span className={cn(value < 0 ? "text-success" : "text-muted-foreground")}>
          {value < 0 ? "-" : ""}${Math.abs(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            value === "completed" && "bg-success/10 text-success",
            value === "failed" && "bg-destructive/10 text-destructive",
          )}
        >
          {value}
        </span>
      ),
    },
  ]

  const totalRevenue = transactions
    .filter((t) => t.type === "payment" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalFees = transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.fee, 0)

  const pendingPayouts = payouts.filter((p) => p.status !== "completed").reduce((sum, p) => sum + p.amount, 0)

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <AirbnbButton variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export Report
          </AirbnbButton>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change="+12.5%"
            trend="up"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Platform Fees"
            value={`$${totalFees.toFixed(2)}`}
            change="+8.2%"
            trend="up"
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatsCard
            title="Pending Payouts"
            value={`$${pendingPayouts.toLocaleString()}`}
            subtitle="3 tutors"
            icon={<Clock className="h-5 w-5" />}
          />
          <StatsCard
            title="Success Rate"
            value="98.5%"
            change="+0.3%"
            trend="up"
            icon={<CheckCircle className="h-5 w-5" />}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList className="mb-6">
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="payouts">Tutor Payouts ({payouts.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <AirbnbCard>
              <DataTable
                columns={invoiceColumns}
                data={invoices}
                searchPlaceholder="Search invoices..."
                actions={(row) => (
                  <AirbnbButton variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </AirbnbButton>
                )}
              />
            </AirbnbCard>
          </TabsContent>

          <TabsContent value="payouts">
            <AirbnbCard>
              <DataTable
                columns={payoutColumns}
                data={payouts}
                searchPlaceholder="Search payouts..."
                actions={(row) =>
                  row.status === "pending" ? (
                    <AirbnbButton size="sm">Process</AirbnbButton>
                  ) : (
                    <AirbnbButton variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </AirbnbButton>
                  )
                }
              />
            </AirbnbCard>
          </TabsContent>

          <TabsContent value="transactions">
            <AirbnbCard>
              <DataTable columns={transactionColumns} data={transactions} searchPlaceholder="Search transactions..." />
            </AirbnbCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
