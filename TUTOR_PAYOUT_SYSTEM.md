# Tutor Payout System

## Overview

The tutor payout system manages payments from PTLC to tutors. This is separate from parent payments - parents pay PTLC, and PTLC pays tutors.

## Two-Stage Payment Flow

```
┌─────────┐         ┌──────┐         ┌───────┐
│ Parent  │ ──────> │ PTLC │ ──────> │ Tutor │
└─────────┘         └──────┘         └───────┘
   Stage 1          Platform         Stage 2
   (Payment)        (10% Fee)        (Payout)
```

### Stage 1: Parent → PTLC
1. Session completed
2. Parent pays PTLC via GCash
3. Admin verifies payment
4. Payment status: `verified`

### Stage 2: PTLC → Tutor
1. Admin processes tutor payout
2. PTLC pays tutor (90% of payment)
3. Tutor payout status: `paid`
4. Tutor sees earnings

## Key Concepts

### Why Two Stages?

1. **Cash Flow Management**: PTLC collects payments first, then pays tutors
2. **Platform Fee**: PTLC keeps 10%, pays 90% to tutors
3. **Payment Control**: Admin controls when tutors are paid
4. **Accounting**: Clear separation of parent payments and tutor payouts

### Earnings vs Revenue

- **Revenue**: What parents pay PTLC (100%)
- **Platform Fee**: What PTLC keeps (10%)
- **Tutor Earnings**: What tutors receive (90%)

## Database Structure

### Payment Document (Extended)

```typescript
{
  // Parent payment info
  status: 'pending' | 'due' | 'paid' | 'verified' | 'cancelled'
  amount: number              // Total amount from parent
  platformFee: number         // 10% kept by PTLC
  tutorAmount: number         // 90% for tutor
  
  // Tutor payout info (NEW)
  tutorPayoutStatus: 'pending' | 'processing' | 'paid' | 'failed'
  tutorPayoutMethod: 'gcash' | 'bank_transfer' | 'cash'
  tutorPayoutReference: string
  tutorPayoutDate: string
  tutorPayoutNotes: string
}
```

## Admin Workflow

### Processing Individual Payout

1. Go to `/admin/tutor-payouts`
2. View list of tutors with pending payouts
3. Click "Pay Now" on a tutor
4. System marks all their payments as `paid`
5. Tutor receives notification
6. Tutor sees earnings updated

### Processing Batch Payout

1. Go to `/admin/tutor-payouts`
2. Select multiple tutors using checkboxes
3. Click "Pay Selected"
4. System processes all selected tutors
5. All tutors receive notifications
6. All earnings updated

### Payout Methods

- **GCash**: Send to tutor's GCash number
- **Bank Transfer**: Transfer to tutor's bank account
- **Cash**: Hand cash to tutor in person

## Tutor Experience

### Viewing Earnings

Tutors see earnings in two places:

#### Dashboard (`/tutor/dashboard`)
- "This Month" stat shows money received from PTLC this month
- Only counts `tutorPayoutStatus: 'paid'`

#### Earnings Page (`/tutor/earnings`)
- **Total Paid by PTLC**: All-time earnings received
- **This Month**: Current month's payouts
- **Pending from PTLC**: Verified by parent, awaiting PTLC payout
- **Awaiting Parent Payment**: Sessions completed, parent hasn't paid yet

### Payment History

Tutors see detailed payment history with:
- Session details
- Total amount (what parent paid)
- Platform fee (10%)
- Their earnings (90%)
- **Payout status** (most important!)
- **Payout date** (when PTLC paid them)

## API Functions

### Get Tutor's Paid Earnings

```typescript
import { getTutorPaidEarnings } from '@/firebase/tutor-payouts'

const paidEarnings = await getTutorPaidEarnings(tutorId)
// Returns only payments where tutorPayoutStatus === 'paid'
```

### Get Tutor's Pending Payouts

```typescript
import { getTutorPendingPayouts } from '@/firebase/tutor-payouts'

const pendingPayouts = await getTutorPendingPayouts(tutorId)
// Returns verified payments not yet paid by PTLC
```

### Get Earnings Summary

```typescript
import { getTutorEarningsSummary } from '@/firebase/tutor-payouts'

const summary = await getTutorEarningsSummary(tutorId)
// Returns: { totalPaid, totalPending, paidCount, pendingCount, ... }
```

### Process Payout (Admin)

```typescript
import { markPayoutAsPaid } from '@/firebase/tutor-payouts'

await markPayoutAsPaid(
  paymentId,
  'gcash',              // payment method
  '1234567890',         // reference number (optional)
  'Paid via GCash'      // notes (optional)
)
```

### Batch Process Payouts (Admin)

```typescript
import { batchProcessPayouts } from '@/firebase/tutor-payouts'

const result = await batchProcessPayouts(
  ['payment1', 'payment2', 'payment3'],
  'gcash',
  'Weekly payout batch'
)
// Returns: { success: [...], failed: [...] }
```

## Notifications

### Tutor Receives Notification When:
- PTLC processes their payout
- Notification type: `payment_received`
- Message: "You received ₱X from PTLC for your session with [student]"

## Example Scenarios

### Scenario 1: Single Session Payout

1. Parent books session for ₱1,000
2. Session completed
3. Parent pays PTLC ₱1,000 via GCash
4. Admin verifies payment → `status: 'verified'`
5. Admin processes tutor payout → `tutorPayoutStatus: 'paid'`
6. Tutor receives ₱900 (90%)
7. PTLC keeps ₱100 (10%)

### Scenario 2: Multiple Sessions Batch Payout

1. Tutor completes 5 sessions this week
2. All parents pay PTLC
3. Admin verifies all 5 payments
4. Admin selects tutor for batch payout
5. All 5 payments marked as `tutorPayoutStatus: 'paid'`
6. Tutor receives total of all 5 sessions (90% each)

### Scenario 3: Pending Payout

1. Parent pays PTLC → `status: 'verified'`
2. Tutor sees "Pending from PTLC" in earnings page
3. Tutor knows parent paid, waiting for PTLC payout
4. Admin processes payout later
5. Tutor sees earnings updated

## Financial Tracking

### For PTLC (Platform)

**Revenue**: All verified parent payments
```typescript
const revenue = payments
  .filter(p => p.status === 'verified')
  .reduce((sum, p) => sum + p.amount, 0)
```

**Platform Fees Collected**:
```typescript
const fees = payments
  .filter(p => p.status === 'verified')
  .reduce((sum, p) => sum + p.platformFee, 0)
```

**Owed to Tutors** (Liability):
```typescript
const owed = payments
  .filter(p => p.status === 'verified' && p.tutorPayoutStatus !== 'paid')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

**Paid to Tutors**:
```typescript
const paid = payments
  .filter(p => p.tutorPayoutStatus === 'paid')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

### For Tutors

**Earnings Received**:
```typescript
const earnings = payments
  .filter(p => p.tutorPayoutStatus === 'paid')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

**Pending from PTLC**:
```typescript
const pending = payments
  .filter(p => p.status === 'verified' && p.tutorPayoutStatus !== 'paid')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

## Security & Permissions

### Firestore Rules

```javascript
// Only admins can update tutor payout status
match /payments/{paymentId} {
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['tutorPayoutStatus', 'tutorPayoutMethod', 'tutorPayoutReference', 
                'tutorPayoutDate', 'tutorPayoutNotes', 'updatedAt']);
}
```

## Payout Schedule

### Monthly Payout Period
- **When**: First week of each month (1st-7th)
- **What**: Process all verified payments from the previous month
- **Why**: Consistent schedule helps tutors plan their finances

### Schedule Indicators
- **Green Banner**: During payout week (1st-7th) with pending payouts
- **Blue Banner**: Outside payout week with pending payouts
- **Next Payout Date**: Automatically calculated and displayed

## Best Practices

### For Admins

1. **Monthly Schedule**: Process payouts during the first week of each month (1st-7th)
2. **Batch Processing**: Use batch payouts for efficiency
3. **Record Keeping**: Always add notes when processing payouts
4. **Verification**: Double-check amounts before paying
5. **Communication**: Notify tutors of payout schedule

### For Development

1. **Always check tutorPayoutStatus**: Don't just check payment status
2. **Use helper functions**: Use `getTutorPaidEarnings()` instead of manual filtering
3. **Handle null values**: `tutorPayoutStatus` may be null for old payments
4. **Test both stages**: Test parent payment AND tutor payout flows

## Migration Notes

### Existing Payments

Old payments don't have `tutorPayoutStatus`. Handle this:

```typescript
// Treat null/undefined as 'pending'
const isPaid = payment.tutorPayoutStatus === 'paid'
const isPending = !payment.tutorPayoutStatus || 
                  payment.tutorPayoutStatus === 'pending'
```

### Updating Old Payments

Run migration script to mark old verified payments:

```javascript
// Mark all old verified payments as paid (if already paid to tutors)
const oldPayments = await getAllPayments()
for (const payment of oldPayments) {
  if (payment.status === 'verified' && !payment.tutorPayoutStatus) {
    await markPayoutAsPaid(payment.id, 'gcash', undefined, 'Migrated from old system')
  }
}
```

## Troubleshooting

### Tutor Not Seeing Earnings

**Problem**: Tutor completed sessions but sees ₱0 earnings

**Solution**: Check if PTLC has processed payout
1. Go to `/admin/tutor-payouts`
2. Find tutor in pending list
3. Process payout
4. Tutor will see earnings

### Parent Paid But Tutor Not Paid

**Problem**: Parent payment verified but tutor not paid

**Solution**: This is normal! Two-stage process:
1. Parent pays PTLC (Stage 1) ✅
2. PTLC pays tutor (Stage 2) ⏳ ← Admin needs to do this

### Earnings Don't Match

**Problem**: Tutor expects ₱1,000 but sees ₱900

**Solution**: Platform fee (10%)
- Parent pays: ₱1,000
- Platform fee: ₱100 (10%)
- Tutor receives: ₱900 (90%)

## Future Enhancements

1. **Automated Payouts**: Schedule automatic weekly payouts
2. **Payout Requests**: Tutors can request early payout
3. **Minimum Threshold**: Only payout when balance reaches ₱X
4. **Payment Integration**: Integrate with GCash API for automatic transfers
5. **Payout History**: Detailed payout history and receipts
6. **Tax Documents**: Generate tax forms for tutors
