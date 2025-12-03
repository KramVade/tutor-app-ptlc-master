# Payment System Guide

## Overview
The payment system integrates GCash payments for tutoring sessions. When a tutor confirms a booking, a payment record is automatically created, and parents are prompted to pay via GCash.

## Payment Flow

### 1. Booking Confirmation
- Tutor confirms a booking request
- System automatically creates a payment record with status "pending"
- Parent receives notification about confirmed booking and pending payment

### 2. Payment Creation
When a booking is confirmed, the system:
- Creates a payment record in Firestore
- Calculates platform fee (10% of total)
- Calculates tutor amount (90% of total)
- Sets initial status as "pending"

### 3. Parent Payment Process
Parents can pay through the Payments page:
1. View all pending payments
2. Click "Pay Now" on a pending payment
3. Modal opens with:
   - Payment details (tutor, student, subject, date, time, amount)
   - GCash QR code
   - Payment instructions
   - Reference number input field
   - Optional screenshot upload

4. Parent completes payment in GCash app
5. Parent enters reference number and uploads screenshot
6. Payment status changes to "paid" (awaiting verification)

### 4. Payment Verification
- Admin or tutor can verify payments
- Once verified, payment status changes to "verified"
- Tutor earnings are recorded

## Database Structure

### Payment Document
```typescript
{
  id: string
  bookingId: string
  parentId: string
  parentEmail: string
  parentName: string
  tutorId: string
  tutorEmail: string
  tutorName: string
  childName: string
  subject: string
  sessionDate: string
  sessionTime: string
  amount: number              // Total amount
  platformFee: number         // 10% of total
  tutorAmount: number         // 90% of total
  status: 'pending' | 'paid' | 'verified' | 'cancelled'
  paymentMethod: 'gcash' | 'cash'
  gcashReferenceNumber?: string
  gcashScreenshot?: string
  paymentDate?: string
  verifiedBy?: string
  verifiedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

## Payment Statuses

1. **pending**: Payment required, parent needs to pay
2. **paid**: Parent submitted payment proof, awaiting verification
3. **verified**: Payment confirmed by admin/tutor
4. **cancelled**: Payment cancelled

## Setup Instructions

### 1. Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_GCASH_NUMBER=09123456789
NEXT_PUBLIC_GCASH_NAME=PTLC Digital Coach
```

### 2. GCash QR Code
To generate a proper GCash QR code:
- Use GCash's QR code generator
- Save the QR code image
- Place it in `/public/gcash-qr.png`
- Update the PaymentModal component to display the actual QR code

### 3. Firestore Rules
Add to `firestore.rules`:
```
// Payments collection
match /payments/{paymentId} {
  // Parents can read their own payments
  allow read: if request.auth != null && 
    (resource.data.parentId == request.auth.uid ||
     resource.data.tutorId == request.auth.uid ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  
  // System creates payments (via Cloud Functions or secure backend)
  allow create: if request.auth != null;
  
  // Parents can update their own payments (submit proof)
  allow update: if request.auth != null && 
    (resource.data.parentId == request.auth.uid ||
     resource.data.tutorId == request.auth.uid ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}
```

### 4. Firestore Indexes
Create composite indexes:
```
Collection: payments
Fields: parentId (Ascending), createdAt (Descending)

Collection: payments
Fields: tutorId (Ascending), createdAt (Descending)

Collection: payments
Fields: parentId (Ascending), status (Ascending)

Collection: payments
Fields: bookingId (Ascending)
```

## Features

### Parent Features
- View all payments (pending, paid, verified)
- Filter payments by status
- Pay via GCash with QR code
- Upload payment screenshot
- Track payment status

### Tutor Features
- View incoming payments
- Verify payments
- Track earnings

### Admin Features
- View all payments
- Verify payments
- Manage payment disputes
- Generate payment reports

## Payment Modal Features

1. **Payment Details Display**
   - Tutor name
   - Student name
   - Subject
   - Session date and time
   - Total amount

2. **GCash Instructions**
   - Step-by-step payment guide
   - QR code display
   - GCash number and account name

3. **Payment Proof Submission**
   - Reference number input (required)
   - Screenshot upload (optional)
   - File size validation (max 5MB)
   - Image preview

4. **User Feedback**
   - Loading states
   - Success/error notifications
   - Form validation

## Integration Points

### 1. Booking Confirmation
File: `firebase/bookings.ts`
- `updateBookingStatus()` creates payment when status is "confirmed"

### 2. Payment Module
File: `firebase/payments.ts`
- `createPaymentForBooking()` - Creates payment record
- `submitPaymentProof()` - Parent submits payment
- `verifyPayment()` - Admin/tutor verifies payment
- `getPaymentsByParentId()` - Get parent's payments
- `getPaymentsByTutorId()` - Get tutor's payments

### 3. Parent Payments Page
File: `app/parent/payments/page.tsx`
- Lists all payments
- Filter by status
- Pay button for pending payments

### 4. Payment Modal
File: `components/payment/payment-modal.tsx`
- GCash payment interface
- Reference number input
- Screenshot upload

## Future Enhancements

1. **Automated QR Code Generation**
   - Generate dynamic QR codes with amount
   - Use GCash API for QR generation

2. **Payment Gateway Integration**
   - Integrate with GCash API
   - Automatic payment verification
   - Real-time payment status updates

3. **Payment Reminders**
   - Email/SMS reminders for pending payments
   - Notification before session date

4. **Payment History**
   - Detailed payment history
   - Export to PDF/CSV
   - Payment receipts

5. **Refund System**
   - Handle cancellations
   - Process refunds
   - Track refund status

6. **Multiple Payment Methods**
   - Add PayMaya support
   - Bank transfer option
   - Cash payment tracking

## Testing

### Test Payment Flow
1. Create a booking as parent
2. Confirm booking as tutor
3. Check that payment record is created
4. Go to parent payments page
5. Click "Pay Now"
6. Enter test reference number
7. Upload screenshot
8. Submit payment
9. Verify status changes to "paid"

### Test Data
```javascript
// Test GCash reference number format
const testRef = "1234567890123" // 13 digits
```

## Troubleshooting

### Payment Not Created
- Check booking status is "confirmed"
- Check console for errors
- Verify Firebase permissions

### QR Code Not Showing
- Check environment variables
- Verify QR code image path
- Check image file exists

### Screenshot Upload Fails
- Check file size (max 5MB)
- Verify file format (PNG, JPG)
- Check browser console for errors

### Payment Status Not Updating
- Check Firestore rules
- Verify user permissions
- Check network connection

## Security Considerations

1. **Payment Verification**
   - Always verify payments manually
   - Check reference numbers in GCash
   - Validate screenshots

2. **Data Protection**
   - Store payment data securely
   - Encrypt sensitive information
   - Follow PCI compliance guidelines

3. **Fraud Prevention**
   - Validate reference numbers
   - Check for duplicate payments
   - Monitor suspicious activity

4. **Access Control**
   - Restrict payment verification to admin/tutor
   - Protect payment data
   - Audit payment changes
