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
  Send,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllPayments, verifyPayment, type Payment } from "@/firebase/payments"
import {
  getAllTutorsWithPendingPayouts,
  markPayoutAsPaid,
  batchProcessPayouts
} from "@/firebase/tutor-payouts"
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
  const [activeTab, setActiveTab] = useState('parent-payments')
  
  // Tutor payout states
  const [tutors, setTutors] = useState<any[]>([])
  const [tutorPaidPayments, setTutorPaidPayments] = useState<Payment[]>([])
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedTutors, setSelectedTutors] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentTutor, setCurrentTutor] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank_transfer' | 'cash'>('gcash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')

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
      
      // Load tutor payouts data
      const tutorData = await getAllTutorsWithPendingPayouts()
      setTutors(tutorData)
      
      const paid = data.filter(p => p.tutorPayoutStatus === 'paid')
      setTutorPaidPayments(paid)
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

  // Tutor payout functions
  const openPaymentModal = (tutor: any) => {
    setCurrentTutor(tutor)
    setPaymentMethod('gcash')
    setReferenceNumber('')
    setNotes('')
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setCurrentTutor(null)
    setReferenceNumber('')
    setNotes('')
  }

  const handlePayTutor = async () => {
    if (!currentTutor) return
    
    try {
      setProcessing(currentTutor.tutorId)
      
      for (const paymentId of currentTutor.payments.map((p: any) => p.id)) {
        await markPayoutAsPaid(
          paymentId, 
          paymentMethod, 
          referenceNumber || undefined, 
          notes || `Paid via ${paymentMethod}`
        )
      }
      
      showToast({
        type: "success",
        title: "Payout Processed",
        message: `Paid ₱${currentTutor.totalAmount.toLocaleString()} to ${currentTutor.tutorName}`
      })
      
      closePaymentModal()
      await loadPayments()
      setSelectedTutors(new Set())
    } catch (error) {
      console.error('Error processing payout:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to process payout"
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleBatchPayout = async () => {
    if (selectedTutors.size === 0) {
      showToast({
        type: "error",
        title: "No Selection",
        message: "Please select tutors to pay"
      })
      return
    }

    try {
      setProcessing('batch')
      
      const paymentIds: string[] = []
      tutors.forEach(tutor => {
        if (selectedTutors.has(tutor.tutorId)) {
          tutor.payments.forEach((p: any) => paymentIds.push(p.id))
        }
      })
      
      const result = await batchProcessPayouts(paymentIds, 'gcash', 'Batch payout by admin')
      
      showToast({
        type: "success",
        title: "Batch Payout Complete",
        message: `Paid ${result.success.length} tutors successfully`
      })
      
      await loadPayments()
      setSelectedTutors(new Set())
    } catch (error) {
      console.error('Error processing batch payout:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to process batch payout"
      })
    } finally {
      setProcessing(null)
    }
  }

  const toggleTutorSelection = (tutorId: string) => {
    const newSelection = new Set(selectedTutors)
    if (newSelection.has(tutorId)) {
      newSelection.delete(tutorId)
    } else {
      newSelection.add(tutorId)
    }
    setSelectedTutors(newSelection)
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
  
  // Tutor payout stats
  const totalPendingAmount = tutors.reduce((sum, t) => sum + t.totalAmount, 0)
  const totalTutors = tutors.length
  const totalPayouts = tutors.reduce((sum, t) => sum + t.paymentCount, 0)
  const selectedAmount = tutors
    .filter(t => selectedTutors.has(t.tutorId))
    .reduce((sum, t) => sum + t.totalAmount, 0)
  
  // Check if we're in the first week of the month (payout period)
  const now = new Date()
  const dayOfMonth = now.getDate()
  const isPayoutWeek = dayOfMonth >= 1 && dayOfMonth <= 7
  const nextPayoutDate = dayOfMonth > 7 
    ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
    : new Date(now.getFullYear(), now.getMonth(), 1)

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground mt-1">Monitor parent payments and process tutor payouts</p>
          </div>
          <div className="flex gap-2">
            <AirbnbButton variant="outline" onClick={loadPayments}>
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </AirbnbButton>
            {activeTab === 'tutor-payouts' && selectedTutors.size > 0 && (
              <AirbnbButton 
                onClick={handleBatchPayout}
                disabled={processing === 'batch'}
              >
                <Send className="h-4 w-4 mr-2" />
                Pay Selected ({selectedTutors.size})
              </AirbnbButton>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="parent-payments">Parent Payments</TabsTrigger>
            <TabsTrigger value="tutor-payouts">Tutor Payouts</TabsTrigger>
          </TabsList>

          {/* Parent Payments Tab */}
          <TabsContent value="parent-payments">
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

            <AirbnbCard>
              <p className="text-center text-muted-foreground py-12">
                Parent payment verification interface - {payments.length} total payments
              </p>
            </AirbnbCard>
          </TabsContent>

          {/* Tutor Payouts Tab */}
          <TabsContent value="tutor-payouts">
            {/* Payout Schedule Banner */}
            {isPayoutWeek && totalTutors > 0 ? (
              <AirbnbCard className="mb-6 bg-green-50 border-green-200">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Payout Week - Action Required</h3>
                    <p className="text-sm text-green-800">
                      It's the first week of the month! You have <strong>{totalTutors} tutor{totalTutors !== 1 ? 's' : ''}</strong> awaiting payment totaling <strong>₱{totalPendingAmount.toLocaleString()}</strong>. 
                      Please process payouts this week.
                    </p>
                  </div>
                </div>
              </AirbnbCard>
            ) : totalTutors > 0 ? (
              <AirbnbCard className="mb-6 bg-blue-50 border-blue-200">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Pending Payouts</h3>
                    <p className="text-sm text-blue-800">
                      You have <strong>{totalTutors} tutor{totalTutors !== 1 ? 's' : ''}</strong> awaiting payment totaling <strong>₱{totalPendingAmount.toLocaleString()}</strong>. 
                      Next payout period: <strong>{nextPayoutDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> (1st-7th of the month).
                    </p>
                  </div>
                </div>
              </AirbnbCard>
            ) : null}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Total Pending"
                value={`₱${totalPendingAmount.toLocaleString()}`}
                icon={<DollarSign className="h-5 w-5" />}
              />
              <StatsCard
                title="Tutors Awaiting Payment"
                value={totalTutors}
                icon={<Users className="h-5 w-5" />}
              />
              <StatsCard
                title="Pending Payments"
                value={totalPayouts}
                icon={<Clock className="h-5 w-5" />}
              />
              <StatsCard
                title="Selected Amount"
                value={`₱${selectedAmount.toLocaleString()}`}
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </div>

            <Tabs defaultValue="pending" className="mb-6">
              <TabsList>
                <TabsTrigger value="pending">Pending Payouts</TabsTrigger>
                <TabsTrigger value="history">Payout History</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <AirbnbCard>
                  <h2 className="text-xl font-bold mb-4">Pending Tutor Payouts</h2>
                  
                  {tutors.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">All Caught Up!</h3>
                      <p className="text-muted-foreground">No pending tutor payouts at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tutors.map((tutor) => (
                        <div key={tutor.tutorId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedTutors.has(tutor.tutorId)}
                                onChange={() => toggleTutorSelection(tutor.tutorId)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{tutor.tutorName}</h3>
                                <p className="text-sm text-muted-foreground">{tutor.tutorEmail}</p>
                                <div className="mt-2 flex gap-4 text-sm">
                                  <span className="text-muted-foreground">
                                    {tutor.paymentCount} payment{tutor.paymentCount !== 1 ? 's' : ''}
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    ₱{tutor.totalAmount.toLocaleString()}
                                  </span>
                                </div>
                                
                                <div className="mt-3 space-y-1">
                                  {tutor.payments.map((payment: any) => (
                                    <div key={payment.id} className="text-xs text-muted-foreground flex justify-between">
                                      <span>
                                        {payment.childName} - {payment.subject} ({new Date(payment.sessionDate).toLocaleDateString()})
                                      </span>
                                      <span className="font-medium">₱{payment.tutorAmount.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <AirbnbButton
                              size="sm"
                              onClick={() => openPaymentModal(tutor)}
                              disabled={processing === tutor.tutorId}
                            >
                              {processing === tutor.tutorId ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Pay Now
                                </>
                              )}
                            </AirbnbButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AirbnbCard>
              </TabsContent>

              <TabsContent value="history">
                <AirbnbCard>
                  <h2 className="text-xl font-bold mb-4">Payout History</h2>
                  
                  {tutorPaidPayments.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Payout History</h3>
                      <p className="text-muted-foreground">Completed payouts will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Date Paid</th>
                            <th className="text-left py-3 px-4">Tutor</th>
                            <th className="text-left py-3 px-4">Session</th>
                            <th className="text-right py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Method</th>
                            <th className="text-left py-3 px-4">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tutorPaidPayments.map((payment) => (
                            <tr key={payment.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">
                                {payment.tutorPayoutDate 
                                  ? new Date(payment.tutorPayoutDate).toLocaleDateString()
                                  : '-'
                                }
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium">{payment.tutorName}</p>
                                  <p className="text-xs text-muted-foreground">{payment.tutorEmail}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-sm">{payment.childName}</p>
                                  <p className="text-xs text-muted-foreground">{payment.subject}</p>
                                </div>
                              </td>
                              <td className="text-right py-3 px-4 font-semibold text-green-600">
                                ₱{payment.tutorAmount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 capitalize">
                                {payment.tutorPayoutMethod?.replace('_', ' ') || '-'}
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {payment.tutorPayoutReference || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </AirbnbCard>
              </TabsContent>
            </Tabs>

            <AirbnbCard className="mt-6 bg-yellow-50 border-yellow-200">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Payout Process & Schedule</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• <strong>Payout Schedule:</strong> Process payouts during the first week of each month (1st-7th)</li>
                    <li>• Parents pay PTLC for tutoring sessions</li>
                    <li>• After verification, payments appear here for tutor payout</li>
                    <li>• Process individual or batch payouts to tutors</li>
                    <li>• Tutors receive 90% of session amount (10% platform fee)</li>
                    <li>• Tutors are notified when payment is processed</li>
                  </ul>
                </div>
              </div>
            </AirbnbCard>
          </TabsContent>
        </Tabs>

        {/* Payment Modal */}
        {showPaymentModal && currentTutor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <AirbnbCard className="max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Process Payout</h2>
              
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{currentTutor.tutorName}</p>
                  <p className="text-sm text-muted-foreground">{currentTutor.tutorEmail}</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    ₱{currentTutor.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentTutor.paymentCount} payment{currentTutor.paymentCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="gcash">GCash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g., GCash ref: 1234567890"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this payout..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <AirbnbButton
                    variant="outline"
                    onClick={closePaymentModal}
                    disabled={processing === currentTutor.tutorId}
                    className="flex-1"
                  >
                    Cancel
                  </AirbnbButton>
                  <AirbnbButton
                    onClick={handlePayTutor}
                    disabled={processing === currentTutor.tutorId}
                    className="flex-1"
                  >
                    {processing === currentTutor.tutorId ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </AirbnbButton>
                </div>
              </div>
            </AirbnbCard>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
