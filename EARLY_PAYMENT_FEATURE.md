# Early Payment Feature

## Overview
Parents can now pay for their tutoring sessions in advance, before the session is completed. This provides flexibility and shows commitment to the tutor.

## Payment Options

### Option 1: Pay Early (Recommended)
- **When**: Immediately after booking is confirmed
- **Status**: "Scheduled - Can Pay Early"
- **Button**: "Pay Early" (outline style)
- **Benefits**:
  - Secures your booking
  - Shows commitment to tutor
  - One less thing to worry about after session
  - Tutor knows payment is handled

### Option 2: Pay After Session
- **When**: After session is completed
- **Status**: "Payment Due"
- **Button**: "Pay Now" (primary style)
- **Benefits**:
  - Pay only after receiving service
  - Ensures session quality before payment

## Payment Flow

### Early Payment Flow
```
1. Parent books session
   ↓
2. Tutor confirms booking
   ↓
3. Payment record created (status: "pending")
   ↓
4. Parent sees "Can Pay Early" badge
   ↓
5. Parent clicks "Pay Early" button
   ↓
6. Payment modal opens with "Early Payment" notice
   ↓
7. Parent pays via GCash
   ↓
8. Payment status: "paid" (awaiting verification)
   ↓
9. Session takes place
   ↓
10. Tutor/Admin verifies payment
    ↓
11. Payment status: "verified"
```

### Standard Payment Flow (After Session)
```
1. Parent books session
   ↓
2. Tutor confirms booking
   ↓
3. Payment record created (status: "pending")
   ↓
4. Session takes place
   ↓
5. Tutor marks as "completed"
   ↓
6. Payment status: "due"
   ↓
7. Parent sees "Payment Due" badge
   ↓
8. Parent clicks "Pay Now" button
   ↓
9. Payment modal opens with "Session Completed" notice
   ↓
10. Parent pays via GCash
    ↓
11. Payment status: "paid"
    ↓
12. Tutor/Admin verifies payment
    ↓
13. Payment status: "verified"
```

## UI Changes

### Payment Status Badges

**Pending (Can Pay Early)**
- Color: Blue
- Text: "Scheduled - Can Pay Early"
- Button: "Pay Early" (outline)
- Icon: Calendar

**Due (Must Pay)**
- Color: Orange/Warning
- Text: "Payment Due"
- Button: "Pay Now" (primary)
- Icon: Alert Circle

**Paid**
- Color: Purple
- Text: "Awaiting Verification"
- Icon: Clock

**Verified**
- Color: Green
- Text: "Payment Verified"
- Icon: Check Circle

### Stats Dashboard

1. **Can Pay Early** (Blue)
   - Count of pending payments
   - Sessions scheduled, payment optional

2. **Payment Due** (Orange)
   - Count of due payments
   - Sessions completed, payment required

3. **Awaiting Verification** (Purple)
   - Count of paid payments
   - Payment submitted, waiting for confirmation

4. **Verified** (Green)
   - Count of verified payments
   - Payment confirmed and complete

### Payment Modal

**For Early Payment (status: pending)**
- Header: "Pay early for your session"
- Notice: Blue box with "Early Payment" message
- Shows scheduled session date and time
- Explains benefits of early payment

**For Payment After Session (status: due)**
- Header: "Complete your payment"
- Notice: Green box with "Session Completed" message
- Confirms session has been completed
- Standard payment flow

## Benefits

### For Parents
- **Flexibility**: Choose when to pay
- **Convenience**: Pay when it's convenient
- **Peace of Mind**: Payment handled before session
- **No Rush**: Don't need to pay immediately after session

### For Tutors
- **Security**: Early payment shows commitment
- **Cash Flow**: Receive payments earlier
- **Less Chasing**: Fewer payment reminders needed
- **Trust Building**: Parents who pay early are serious

### For Platform
- **Better UX**: More flexible payment options
- **Higher Conversion**: Parents can pay when ready
- **Reduced Friction**: No forced payment timing
- **Professional**: Matches industry standards

## User Experience

### Parent Dashboard
- Clear indication of which payments can be paid early
- Distinct visual difference between "can pay" and "must pay"
- Easy access to payment modal from any status

### Payment Process
1. Click "Pay Early" or "Pay Now"
2. See appropriate notice (early vs. after session)
3. Follow same GCash payment steps
4. Submit reference number
5. Wait for verification

### Notifications
- Booking confirmed: "You can pay early or after the session"
- Session completed: "Payment is now due"
- Payment submitted: "Payment is being verified"
- Payment verified: "Payment confirmed"

## Technical Implementation

### Status Transitions

**Pending → Paid (Early Payment)**
```typescript
// Parent pays before session
submitPaymentProof(paymentId, referenceNumber, screenshot)
// Status: pending → paid
```

**Pending → Due → Paid (Standard Flow)**
```typescript
// Session completed
markPaymentAsDue(bookingId)
// Status: pending → due

// Parent pays after session
submitPaymentProof(paymentId, referenceNumber, screenshot)
// Status: due → paid
```

**Paid → Verified**
```typescript
// Admin/Tutor verifies
verifyPayment(paymentId, verifiedBy)
// Status: paid → verified
```

### Button Logic
```typescript
// Show pay button for both pending and due
{(payment.status === 'due' || payment.status === 'pending') && (
  <AirbnbButton
    onClick={() => setSelectedPayment(payment)}
    variant={payment.status === 'due' ? 'default' : 'outline'}
  >
    {payment.status === 'due' ? 'Pay Now' : 'Pay Early'}
  </AirbnbButton>
)}
```

## Best Practices

### For Parents
1. **Pay Early If**:
   - You want to secure your booking
   - You have funds available now
   - You want to show commitment
   - You prefer to handle it now

2. **Pay After If**:
   - You prefer to pay after receiving service
   - You want to ensure session quality first
   - You need to wait for funds

### For Tutors
- Don't pressure parents to pay early
- Both payment options are valid
- Focus on delivering quality sessions
- Verify payments promptly

## Future Enhancements

1. **Early Payment Discount**
   - Offer 5% discount for early payment
   - Incentivize advance payments

2. **Payment Reminders**
   - Gentle reminder for pending payments
   - Urgent reminder for due payments

3. **Auto-Payment**
   - Save payment method
   - Auto-charge after session completion

4. **Payment Plans**
   - Split payment into installments
   - For expensive or long-term sessions

5. **Refund Policy**
   - Handle cancellations
   - Refund early payments if needed

## Testing Checklist

- [ ] Create booking and confirm it
- [ ] Verify payment shows as "Can Pay Early"
- [ ] Click "Pay Early" button
- [ ] Verify modal shows "Early Payment" notice
- [ ] Submit payment with reference number
- [ ] Verify status changes to "paid"
- [ ] Complete the session
- [ ] Verify payment stays as "paid" (not "due")
- [ ] Verify payment as admin/tutor
- [ ] Verify status changes to "verified"

## Support

If parents have questions about early payment:
1. Explain both options are available
2. No penalty for waiting until after session
3. Early payment is optional but appreciated
4. Payment is secure either way
