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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllPayments, verifyPayment, type Payment } from "@/firebase/payments"
import { format, parseISO } from "date-fns"

// Disable static generation
export const dynamic = 'force-dynamic'

export default function AdminPaymentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      loadPayments()
    }
  }, [user])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      console.log('💳 Loading all payments...')
      const data = await getAllPayments()
      console.log('✅ Payments loaded:', data.length)
      setPayments(data)
    } catch (error) {
      console.error('❌ Error loading payments:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load payments"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPayment = async (paymentId: string) => {
    if (!user) return
    
    try {
      setVerifying(paymentId)
      await verifyPayment(paymentId, user.id)
      
      showToast({
        type: "success",
        title: "Payment Verified",
        message: "Payment has been verified successfully"
      })
      
      await loadPayments()
    } catch (error) {
      console.error('Error verifying payment:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to verify payment"
      })
    } finally {
      setVerifying(null)
    }
  }

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const duePayments = payments.filter(p => p.status === 'due')
  const paidPayments = payments.filter(p => p.status === 'paid')
  const verifiedPayments = payments.filter(p => p.status === 'verified')

  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0)
  const platformFees = verifiedPayments.reduce((sum, p) => sum + p.platformFee, 0)
  const tutorEarnings = verifiedPayments.reduce((sum, p) => sum + p.tutorAmount, 0)
  const pendingAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground mt-1">Monitor and verify all payments</p>
          </div>
          <AirbnbButton variant="outline" onClick={loadPayments}>
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </AirbnbButton>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`₱${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Platform Fees"
            value={`₱${platformFees.toLocaleString()}`}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatsCard
            title="Pending Verification"
            value={`₱${pendingAmount.toLocaleString()}`}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatsCard
            title="Tutor Earnings"
            value={`₱${tutorEarnings.toLocaleString()}`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
        </div>

        <p className="text-center text-muted-foreground py-12">
          Payment management interface - {payments.length} total payments
        </p>
      </div>
    </PageLayout>
  )
}
