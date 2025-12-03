# Payment Flow Update

## Updated Payment Flow

The payment system has been updated to reflect a more logical flow where parents pay AFTER the session is completed, not before.

### New Payment Statuses

1. **pending** - Session is scheduled, payment will be required after completion
2. **due** - Session completed, payment is now required
3. **paid** - Parent has submitted payment proof, awaiting verification
4. **verified** - Payment has been verified by tutor/admin
5. **cancelled** - Payment cancelled

### Updated Flow

```
1. Parent books a session
   ↓
2. Tutor confirms booking
   ↓
3. System creates payment record (status: "pending")
   ↓ [Session scheduled, no payment required yet]
   ↓
4. Session takes place
   ↓
5. Tutor marks booking as "completed"
   ↓
6. System automatically changes payment status to "due"
   ↓
7. Parent receives notification: "Payment Due"
   ↓
8. Parent goes to Payments page and sees "Payment Due"
   ↓
9. Parent clicks "Pay Now"
   ↓
10. Modal shows GCash QR code and instructions
    ↓
11. Parent pays via GCash app
    ↓
12. Parent enters reference number + uploads screenshot
    ↓
13. Payment status changes to "paid"
    ↓
14. Tutor/Admin verifies payment
    ↓
15. Payment status changes to "verified"
```

## Key Changes

### 1. Payment Creation (Booking Confirmed)
- Status: **pending**
- Meaning: Session is scheduled, payment will be required later
- Parent sees: "Scheduled" badge
- Action: None required yet

### 2. Session Completion (Booking Completed)
- Status: **pending** → **due**
- Meaning: Session finished, parent must pay now
- Parent sees: "Payment Due" badge with "Pay Now" button
- Notification: "Payment of ₱X is now due for your session with [Tutor]"

### 3. Payment Submission
- Status: **due** → **paid**
- Meaning: Parent submitted payment proof
- Parent sees: "Awaiting Verification" badge
- Action: Wait for verification

### 4. Payment Verification
- Status: **paid** → **verified**
- Meaning: Payment confirmed
- Parent sees: "Payment Verified" badge
- Action: Complete

## UI Updates

### Parent Payments Page

**Stats Dashboard:**
- Scheduled: Count of pending payments (sessions not yet completed)
- Payment Due: Count of due payments (sessions completed, payment required)
- Awaiting Verification: Count of paid payments
- Verified: Count of verified payments

**Filter Tabs:**
- All
- Scheduled (pending)
- Due (payment required)
- Paid (awaiting verification)
- Verified

**Payment Cards:**
- Pending: Shows "Scheduled" badge, no action button
- Due: Shows "Payment Due" badge with "Pay Now" button
- Paid: Shows "Awaiting Verification" badge
- Verified: Shows "Payment Verified" badge

### Payment Modal

**New Feature:**
- Green notice box: "Session Completed - Your tutoring session has been completed. Please proceed with the payment."
- Emphasizes that payment is for a completed session

## Database Changes

### Payment Interface
```typescript
status: 'pending' | 'due' | 'paid' | 'verified' | 'cancelled'
```

### New Functions

**`markPaymentAsDue(bookingId: string)`**
- Called when booking status changes to "completed"
- Changes payment status from "pending" to "due"
- Creates notification for parent

**`getDuePaymentsCount(parentId: string)`**
- Returns count of payments with "due" status
- Used for stats dashboard

## Booking Integration

### When Tutor Marks Session as Completed

File: `firebase/bookings.ts` → `updateBookingStatus()`

```typescript
if (status === 'completed') {
  // Mark payment as due
  await markPaymentAsDue(bookingId);
  
  // Notify parent
  await createBookingNotification(
    booking.parentId,
    'session_completed',
    { tutorName, date, time }
  );
}
```

## Benefits of This Flow

1. **Trust Building**: Parents pay after receiving the service
2. **Fair System**: Payment only required after session completion
3. **Clear Status**: Easy to see which sessions are scheduled vs. which need payment
4. **Better UX**: Parents aren't prompted to pay for future sessions
5. **Logical Flow**: Matches real-world tutoring payment practices

## Testing Checklist

- [ ] Create booking as parent
- [ ] Confirm booking as tutor (payment status: pending)
- [ ] Verify payment shows as "Scheduled" in parent payments page
- [ ] Mark booking as "completed" as tutor
- [ ] Verify payment status changes to "due"
- [ ] Verify parent receives "Payment Due" notification
- [ ] Check parent payments page shows "Payment Due" badge
- [ ] Click "Pay Now" button
- [ ] Verify modal shows "Session Completed" notice
- [ ] Submit payment with reference number
- [ ] Verify status changes to "paid"
- [ ] Verify payment as tutor/admin
- [ ] Verify status changes to "verified"

## Migration Notes

If you have existing payments in the database:
- Existing "pending" payments for completed sessions should be manually updated to "due"
- Or run a migration script to update them automatically

## Future Enhancements

1. **Auto-complete**: Automatically mark sessions as completed based on date/time
2. **Payment Reminders**: Send reminders for overdue payments
3. **Grace Period**: Allow X days grace period before marking as overdue
4. **Late Fees**: Optional late fees for overdue payments
5. **Payment Plans**: Allow installment payments for expensive sessions
