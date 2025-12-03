"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { Clock, CheckCircle, Mail, Phone } from "lucide-react"

export default function PendingApprovalPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <AirbnbCard className="text-center p-8 md:p-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Account Pending Approval</h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for signing up as a tutor! Your account is currently under review by our admin team.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                What happens next?
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <span>Our admin team will review your profile and credentials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <span>We may contact you for additional information or verification</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <span>Once approved, you'll receive an email notification</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">4.</span>
                  <span>You can then log in and start accepting tutoring sessions</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">Approval Timeline</h3>
              <p className="text-sm text-blue-800">
                Most applications are reviewed within <strong>24-48 hours</strong>. 
                We'll notify you via email once your account status changes.
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Questions about your application?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@ptlcdigitalcoach.com" 
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  support@ptlcdigitalcoach.com
                </a>
                <a 
                  href="tel:+1234567890" 
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  (123) 456-7890
                </a>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-8 text-sm text-muted-foreground hover:text-foreground underline"
            >
              Log out
            </button>
          </AirbnbCard>
        </div>
      </div>
    </PageLayout>
  )
}
