"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { PaymentModal } from "@/components/payment/payment-modal"
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  BookOpen,
  AlertCircle
} from "lucide-react"
import { getPaymentsByParentId, type Payment } from "@/firebase/payments"
import { format, parseISO } from "date-fns"

export default function ParentPaymentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'due' | 'paid' | 'verified'>('all')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "parent")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === "parent") {
      loadPayments()
    }
  }, [user])

  const loadPayments = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      console.log('💳 Loading payments for parent:', user.id)
      const data = await getPaymentsByParentId(user.id)
      console.log('✅ Payments loaded:', data.length, data)
      setPayments(data)
    } catch (error: any) {
      console.error("❌ Error loading payments:", error)
      setError(error.message || "Failed to load payments")
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

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    return payment.status === filter
  })

  const pendingCount = payments.filter(p => p.status === 'pending').length
  const dueCount = payments.filter(p => p.status === 'due').length
  const paidCount = payments.filter(p => p.status === 'paid').length
  const verifiedCount = payments.filter(p => p.status === 'verified').length

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />
      case 'due':
        return <AlertCircle className="h-5 w-5 text-warning" />
      case 'paid':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return 'Scheduled - Can Pay Early'
      case 'due':
        return 'Payment Due'
      case 'paid':
        return 'Awaiting Verification'
      case 'verified':
        return 'Payment Verified'
      case 'cancelled':
        return 'Cancelled'
    }
  }

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'due':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'paid':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'verified':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your session payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <AirbnbCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Can Pay Early</p>
              </div>
            </div>
          </AirbnbCard>

          <AirbnbCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueCount}</p>
                <p className="text-sm text-muted-foreground">Payment Due</p>
              </div>
            </div>
          </AirbnbCard>

          <AirbnbCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paidCount}</p>
                <p className="text-sm text-muted-foreground">Awaiting Verification</p>
              </div>
            </div>
          </AirbnbCard>

          <AirbnbCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </AirbnbCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <AirbnbButton
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({payments.length})
          </AirbnbButton>
          <AirbnbButton
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Can Pay Early ({pendingCount})
          </AirbnbButton>
          <AirbnbButton
            variant={filter === 'due' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('due')}
          >
            Due ({dueCount})
          </AirbnbButton>
          <AirbnbButton
            variant={filter === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('paid')}
          >
            Paid ({paidCount})
          </AirbnbButton>
          <AirbnbButton
            variant={filter === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('verified')}
          >
            Verified ({verifiedCount})
          </AirbnbButton>
        </div>

        {/* Error Message */}
        {error && (
          <AirbnbCard className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Payments</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Check the browser console (F12) for more details.
                </p>
              </div>
            </div>
          </AirbnbCard>
        )}

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <AirbnbCard>
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Payments</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You don't have any payments yet"
                  : `No ${filter} payments found`
                }
              </p>
              {filter === 'all' && payments.length === 0 && !error && (
                <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="font-medium mb-2">To see payments here:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Book a session with a tutor</li>
                    <li>2. Wait for tutor to confirm</li>
                    <li>3. Payment record will appear</li>
                    <li>4. Pay early or wait until after session</li>
                  </ol>
                </div>
              )}
            </div>
          </AirbnbCard>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <AirbnbCard key={payment.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{payment.tutorName}</h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {getStatusText(payment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{payment.childName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{payment.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(parseISO(payment.sessionDate), "MMM d, yyyy")} at {payment.sessionTime}
                            </span>
                          </div>
                        </div>

                        {payment.gcashReferenceNumber && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Ref: {payment.gcashReferenceNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₱{payment.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(payment.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>

                    {(payment.status === 'due' || payment.status === 'pending') && (
                      <AirbnbButton
                        onClick={() => setSelectedPayment(payment)}
                        size="sm"
                        variant={payment.status === 'due' ? 'default' : 'outline'}
                      >
                        {payment.status === 'due' ? 'Pay Now' : 'Pay Early'}
                      </AirbnbButton>
                    )}
                  </div>
                </div>
              </AirbnbCard>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onSuccess={loadPayments}
        />
      )}
    </PageLayout>
  )
}
