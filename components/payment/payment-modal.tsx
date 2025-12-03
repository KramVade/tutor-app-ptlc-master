"use client"

import { useState } from "react"
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { AirbnbButton } from "../ui/airbnb-button"
import { useNotification } from "@/lib/context/notification-context"
import { submitPaymentProof, type Payment } from "@/firebase/payments"
import Image from "next/image"

interface PaymentModalProps {
  payment: Payment
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ payment, onClose, onSuccess }: PaymentModalProps) {
  const { showToast } = useNotification()
  const [referenceNumber, setReferenceNumber] = useState("")
  const [screenshot, setScreenshot] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // GCash details (you should store this in environment variables)
  const GCASH_NUMBER = process.env.NEXT_PUBLIC_GCASH_NUMBER || "09123456789"
  const GCASH_NAME = process.env.NEXT_PUBLIC_GCASH_NAME || "PTLC Digital Coach"

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast({
          type: "error",
          title: "File Too Large",
          message: "Please upload an image smaller than 5MB"
        })
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!referenceNumber.trim()) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please enter the GCash reference number"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await submitPaymentProof(payment.id!, referenceNumber, screenshot)
      
      showToast({
        type: "success",
        title: "Payment Submitted",
        message: "Your payment is being verified. You'll be notified once confirmed."
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error submitting payment:", error)
      showToast({
        type: "error",
        title: "Submission Failed",
        message: "Failed to submit payment. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <div>
            <h2 className="text-2xl font-bold">Pay with GCash</h2>
            <p className="text-muted-foreground mt-1">
              {payment.status === 'due' ? 'Complete your payment' : 'Pay early for your session'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Details */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session with:</span>
                <span className="font-medium">{payment.tutorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-medium">{payment.childName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">{payment.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">
                  {new Date(payment.sessionDate).toLocaleDateString()} at {payment.sessionTime}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-semibold text-lg">Total Amount:</span>
                <span className="font-bold text-2xl text-primary">₱{payment.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Notice */}
          {payment.status === 'due' ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-700">Session Completed</p>
                <p className="text-sm text-green-600 mt-1">
                  Your tutoring session has been completed. Please proceed with the payment.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-700">Early Payment</p>
                <p className="text-sm text-blue-600 mt-1">
                  You're paying in advance for your scheduled session on {new Date(payment.sessionDate).toLocaleDateString()} at {payment.sessionTime}. 
                  This helps secure your booking and shows commitment to your tutor.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-secondary/50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Payment Instructions
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Open your GCash app and select "Send Money"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Scan the QR code below or send to: <strong>{GCASH_NUMBER}</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Enter the exact amount: <strong>₱{payment.amount}</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Complete the transaction and save the reference number</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">5.</span>
                <span>Enter the reference number below and upload a screenshot (optional)</span>
              </li>
            </ol>
          </div>

          {/* GCash QR Code */}
          <div className="bg-white rounded-xl p-6 text-center border-2 border-dashed border-border">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">GCash QR Code</h3>
            <div className="flex flex-col items-center gap-4">
              {/* Actual QR Code Image */}
              <div className="relative w-64 h-64 bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                <Image
                  src="/images/myqr_1764778708237.jpg"
                  alt="GCash QR Code"
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>
              <div className="text-sm text-gray-600">
                <p className="text-gray-600 font-medium mb-1">Scan to Pay</p>
                <p className="font-medium">Send to: {GCASH_NUMBER}</p>
                <p>Account Name: {GCASH_NAME}</p>
                <p className="text-xs text-gray-500 mt-2">Amount: ₱{payment.amount}</p>
              </div>
            </div>
          </div>

          {/* Reference Number Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              GCash Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter 13-digit reference number"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={13}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find this in your GCash transaction history
            </p>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Screenshot (Optional)
            </label>
            {screenshot ? (
              <div className="relative">
                <img 
                  src={screenshot} 
                  alt="Payment screenshot" 
                  className="w-full h-48 object-contain rounded-xl border border-border bg-secondary/50"
                />
                <button
                  onClick={() => setScreenshot("")}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <AirbnbButton
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </AirbnbButton>
            <AirbnbButton
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!referenceNumber.trim()}
              className="flex-1"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit Payment
            </AirbnbButton>
          </div>
        </div>
      </div>
    </div>
  )
}
