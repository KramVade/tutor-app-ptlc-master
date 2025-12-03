# Dynamic Earnings System

## Overview

The tutor earnings system calculates earnings dynamically based on actual payouts from PTLC (the platform). Tutors only see earnings when PTLC has paid them, not when parents pay PTLC.

## How It Works

### Payment Flow (Two-Stage)

#### Stage 1: Parent → PTLC
1. **Booking Created** → Payment record created with status `pending`
2. **Session Completed** → Payment status changes to `due`
3. **Parent Submits Payment** → Payment status changes to `paid` (awaiting verification)
4. **Admin Verifies** → Payment status changes to `verified`

#### Stage 2: PTLC → Tutor
5. **Admin Processes Payout** → `tutorPayoutStatus` changes to `processing`
6. **PTLC Pays Tutor** → `tutorPayoutStatus` changes to `paid`
7. **Earnings Updated** → Tutor's earnings are automatically updated

### Earnings Calculation

```
Total Payment Amount: ₱1,000
Platform Fee (10%): ₱100
Tutor Earnings (90%): ₱900
```

- Platform takes a 10% fee from each payment
- Tutors receive 90% of the total payment amount
- Only **verified** payments count toward tutor earnings

## Features

### For Tutors

#### Dashboard (`/tutor/dashboard`)
- Shows **This Month** earnings from PTLC payouts
- Displays total paid sessions count
- Real-time updates as PTLC processes payouts

#### Earnings Page (`/tutor/earnings`)
- **Total Paid by PTLC**: All-time earnings actually received from PTLC
- **This Month**: Current month's payouts from PTLC
- **Pending from PTLC**: Parent paid, awaiting PTLC payout
- **Awaiting Parent Payment**: Completed sessions waiting for parent payment
- **Payment History Table**: Detailed breakdown of all payments with:
  - Session date
  - Student name
  - Subject
  - Total amount
  - Platform fee
  - Tutor earnings
  - Payout status
  - Payout date

### For Admins

#### Admin Payments Page (`/admin/payments`)
- **Total Revenue**: Sum of all verified payments from parents
- **Platform Fees**: Total 10% fees collected
- **Tutor Earnings**: Total amount owed to tutors (90%)
- **Pending Verification**: Payments awaiting admin verification
- Payment verification interface

#### Admin Tutor Payouts Page (`/admin/tutor-payouts`)
- **Total Pending**: Amount owed to all tutors
- **Tutors Awaiting Payment**: Number of tutors to pay
- **Pending Payments**: Number of sessions to pay out
- **Selected Amount**: Amount selected for batch payout
- Individual and batch payout processing
- Tutor payout history

## API Functions

### Firebase Functions

#### `getPaymentsByTutorId(tutorId)`
Fetches all payments for a specific tutor.

```javascript
import { getPaymentsByTutorId } from '@/firebase/payments'

const payments = await getPaymentsByTutorId(user.id)
```

#### `getEarningsFromPayments(tutorId)`
Calculates total earnings from verified payments.

```javascript
import { getEarningsFromPayments } from '@/firebase/earnings'

const { totalEarnings, verifiedPayments, payments } = await getEarningsFromPayments(tutorId)
```

#### `getMonthlyEarningsFromPayments(tutorId, month, year)`
Calculates earnings for a specific month.

```javascript
import { getMonthlyEarningsFromPayments } from '@/firebase/earnings'

const now = new Date()
const { monthlyEarnings, sessionsCount, payments } = await getMonthlyEarningsFromPayments(
  tutorId,
  now.getMonth(),
  now.getFullYear()
)
```

## Payment Statuses

### Parent Payment Status
| Status | Description |
|--------|-------------|
| `pending` | Session not yet completed |
| `due` | Session completed, payment due from parent |
| `paid` | Parent submitted payment proof |
| `verified` | Payment verified by admin |
| `cancelled` | Payment cancelled |

### Tutor Payout Status
| Status | Description | Counts Toward Tutor Earnings |
|--------|-------------|------------------------------|
| `null/pending` | Awaiting PTLC payout | ❌ No |
| `processing` | PTLC is processing payout | ❌ No |
| `paid` | PTLC has paid tutor | ✅ Yes |
| `failed` | Payout failed | ❌ No |

## Testing

Run the dynamic earnings test script:

```bash
node scripts/test-dynamic-earnings.js
```

This script will:
- Show all payments in the system
- Calculate earnings for each tutor
- Display platform statistics
- Verify the 10% platform fee calculation
- Show payment status breakdown

## Benefits

### Real-Time Accuracy
- Earnings update immediately when payments are verified
- No manual calculation needed
- Accurate historical data

### Transparency
- Clear breakdown of total amount vs. tutor earnings
- Platform fee clearly displayed
- Payment status tracking

### Scalability
- Works with any number of tutors and payments
- Efficient Firestore queries
- No hardcoded values

## Migration Notes

### Before (Static)
```javascript
// Calculated from bookings
const monthlyEarnings = bookings
  .filter(b => b.status === 'completed')
  .reduce((sum, b) => sum + b.totalPrice, 0)
```

### After (Dynamic)
```javascript
// Calculated from verified payments
const monthlyEarnings = payments
  .filter(p => p.status === 'verified')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

## Key Differences

1. **Source**: Payments collection instead of bookings
2. **Status**: Only `verified` payments count
3. **Amount**: Uses `tutorAmount` (90%) instead of `totalPrice` (100%)
4. **Real-time**: Updates as payments are verified, not when sessions complete

## Future Enhancements

- Export earnings reports (CSV/PDF)
- Monthly earnings charts and graphs
- Earnings projections based on upcoming sessions
- Automatic payout integration
- Tax documentation generation
