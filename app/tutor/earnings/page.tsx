"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { getPaymentsByTutorId, Payment } from "@/firebase/payments"
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock } from "lucide-react"

export default function TutorEarningsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadEarnings()
    }
  }, [user])

  const loadEarnings = async () => {
    if (!user) return
    
    try {
      setIsLoadingData(true)
      // Get all payments for this tutor (including payout status)
      const paymentsData = await getPaymentsByTutorId(user.id)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error loading earnings:', error)
      setPayments([])
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isLoading || !user || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Calculate earnings based on PTLC payouts
  // Only count as "earned" when PTLC has actually paid the tutor
  const paidByPTLC = payments.filter(p => p.tutorPayoutStatus === 'paid')
  const pendingPayout = payments.filter(p => 
    p.status === 'verified' && 
    (!p.tutorPayoutStatus || p.tutorPayoutStatus === 'pending' || p.tutorPayoutStatus === 'processing')
  )
  const awaitingParentPayment = payments.filter(p => p.status === 'paid')
  const duePayments = payments.filter(p => p.status === 'due')
  
  const totalEarnings = paidByPTLC.reduce((sum, p) => sum + p.tutorAmount, 0)
  const pendingFromPTLC = pendingPayout.reduce((sum, p) => sum + p.tutorAmount, 0)
  const awaitingVerification = awaitingParentPayment.reduce((sum, p) => sum + p.tutorAmount, 0)
  const expectedEarnings = duePayments.reduce((sum, p) => sum + p.tutorAmount, 0)
  
  // This month earnings (only count when PTLC has paid)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const thisMonthPaid = paidByPTLC.filter(p => {
    const payoutDate = new Date(p.tutorPayoutDate || p.createdAt)
    return payoutDate.getMonth() === currentMonth && payoutDate.getFullYear() === currentYear
  })
  
  const thisMonthEarnings = thisMonthPaid.reduce((sum, p) => sum + p.tutorAmount, 0)

  const stats = [
    { 
      label: "Total Paid by PTLC", 
      value: `₱${totalEarnings.toLocaleString()}`, 
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Money you've received"
    },
    { 
      label: "This Month", 
      value: `₱${thisMonthEarnings.toLocaleString()}`, 
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Paid this month"
    },
    { 
      label: "Pending from PTLC", 
      value: `₱${pendingFromPTLC.toLocaleString()}`, 
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Parent paid, awaiting PTLC payout"
    },
    { 
      label: "Awaiting Parent Payment", 
      value: `₱${(awaitingVerification + expectedEarnings).toLocaleString()}`, 
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Sessions completed"
    },
  ]

  const getPayoutStatusBadge = (payment: Payment) => {
    // Show payout status (what matters to tutor)
    if (payment.tutorPayoutStatus === 'paid') {
      return { label: 'Paid by PTLC', className: 'bg-green-100 text-green-700' }
    }
    if (payment.status === 'verified' && (!payment.tutorPayoutStatus || payment.tutorPayoutStatus === 'pending')) {
      return { label: 'Pending PTLC Payout', className: 'bg-purple-100 text-purple-700' }
    }
    if (payment.tutorPayoutStatus === 'processing') {
      return { label: 'Processing Payout', className: 'bg-blue-100 text-blue-700' }
    }
    if (payment.status === 'paid') {
      return { label: 'Parent Paid - Awaiting Verification', className: 'bg-yellow-100 text-yellow-700' }
    }
    if (payment.status === 'due') {
      return { label: 'Awaiting Parent Payment', className: 'bg-orange-100 text-orange-700' }
    }
    if (payment.status === 'cancelled') {
      return { label: 'Cancelled', className: 'bg-red-100 text-red-700' }
    }
    return { label: 'Pending', className: 'bg-gray-100 text-gray-700' }
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Earnings</h1>
          <p className="text-muted-foreground mt-1">Track your income from tutoring sessions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <AirbnbCard key={i}>
              <div className="flex items-center gap-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </AirbnbCard>
          ))}
        </div>

        {/* Payment History */}
        <AirbnbCard>
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground">Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Subject</th>
                    <th className="text-right py-3 px-4">Total Amount</th>
                    <th className="text-right py-3 px-4">Platform Fee (10%)</th>
                    <th className="text-right py-3 px-4">Your Earnings</th>
                    <th className="text-center py-3 px-4">Payout Status</th>
                    <th className="text-left py-3 px-4">Payout Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const badge = getPayoutStatusBadge(payment)
                    return (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(payment.sessionDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{payment.childName}</td>
                        <td className="py-3 px-4">{payment.subject}</td>
                        <td className="text-right py-3 px-4">₱{payment.amount.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          ₱{payment.platformFee.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₱{payment.tutorAmount.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {payment.tutorPayoutDate 
                            ? new Date(payment.tutorPayoutDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AirbnbCard>

        {/* Info Card */}
        <AirbnbCard className="mt-6 bg-blue-50 border-blue-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How Earnings Work</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Parents pay PTLC directly for tutoring sessions</li>
                <li>• Platform fee is 10% of the total session amount</li>
                <li>• You receive 90% of each session payment</li>
                <li>• PTLC processes payouts after parent payment is verified</li>
                <li>• Earnings are counted only when PTLC pays you</li>
                <li>• Track your payout status in real-time</li>
              </ul>
            </div>
          </div>
        </AirbnbCard>
      </div>
    </PageLayout>
  )
}
