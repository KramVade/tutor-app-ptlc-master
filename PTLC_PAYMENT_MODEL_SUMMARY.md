# PTLC Payment Model - Implementation Summary

## What Changed

Updated the payment system so that **tutor earnings come from PTLC**, not directly from parents. This implements a proper two-stage payment flow.

## Payment Flow

### Before (Direct)
```
Parent ──────────> Tutor
         (100%)
```

### After (Platform-Mediated)
```
Parent ────────> PTLC ────────> Tutor
      (100%)          (90%)
                 ↓
            Platform Fee
               (10%)
```

## Key Changes

### 1. New Payment Fields

Added to `Payment` interface in `firebase/payments.ts`:
```typescript
tutorPayoutStatus?: 'pending' | 'processing' | 'paid' | 'failed'
tutorPayoutMethod?: 'gcash' | 'bank_transfer' | 'cash'
tutorPayoutReference?: string
tutorPayoutDate?: string
tutorPayoutNotes?: string
```

### 2. New Module: `firebase/tutor-payouts.ts`

Functions for managing PTLC → Tutor payouts:
- `getTutorPaidEarnings()` - Get tutor's received earnings
- `getTutorPendingPayouts()` - Get verified but unpaid earnings
- `getTutorEarningsSummary()` - Complete earnings breakdown
- `markPayoutAsPaid()` - Process single payout
- `batchProcessPayouts()` - Process multiple payouts
- `getAllTutorsWithPendingPayouts()` - Admin view of pending payouts

### 3. Updated Tutor Earnings Page

`app/tutor/earnings/page.tsx` now shows:
- **Total Paid by PTLC**: Money actually received
- **Pending from PTLC**: Parent paid, awaiting PTLC payout
- **Payout Status Column**: Shows when PTLC paid tutor
- **Payout Date Column**: Shows exact payout date

### 4. Updated Tutor Dashboard

`app/tutor/dashboard/page.tsx` now:
- Calculates earnings from `tutorPayoutStatus === 'paid'`
- Shows only money received from PTLC
- Updates when PTLC processes payouts

### 5. New Admin Payout Page

`app/admin/tutor-payouts/page.tsx` provides:
- List of tutors with pending payouts
- Individual payout processing
- Batch payout processing
- Payout tracking and history

## How It Works

### For Parents
1. Book session with tutor
2. Complete session
3. Pay PTLC via GCash
4. Admin verifies payment
5. ✅ Done - parent's responsibility complete

### For Tutors
1. Complete session
2. Wait for parent to pay PTLC
3. Wait for PTLC to process payout
4. Receive notification when PTLC pays
5. ✅ See earnings updated

### For Admins
1. Verify parent payments (Stage 1)
2. Go to `/admin/tutor-payouts`
3. See list of tutors to pay
4. Process individual or batch payouts (Stage 2)
5. ✅ Tutors receive money and notifications

## Financial Breakdown

### Example: ₱1,000 Session

```
Parent pays PTLC:     ₱1,000 (100%)
├─ Platform Fee:      ₱100   (10%)  ← PTLC keeps
└─ Tutor Payout:      ₱900   (90%)  ← PTLC pays tutor
```

### Multiple Sessions Example

Tutor completes 5 sessions @ ₱1,000 each:
```
Total parent payments:  ₱5,000
Platform fees:          ₱500   (10%)
Tutor payout:           ₱4,500 (90%)
```

## Earnings Calculation

### Tutor Sees Earnings When:
- ✅ `tutorPayoutStatus === 'paid'`
- ❌ NOT when `status === 'verified'`

### Old Way (Wrong)
```typescript
// Counted when parent paid
const earnings = payments
  .filter(p => p.status === 'verified')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

### New Way (Correct)
```typescript
// Counts when PTLC pays tutor
const earnings = payments
  .filter(p => p.tutorPayoutStatus === 'paid')
  .reduce((sum, p) => sum + p.tutorAmount, 0)
```

## Status Tracking

### Two Separate Statuses

#### Parent Payment Status (`status`)
- `pending` - Session not completed
- `due` - Session done, parent needs to pay
- `paid` - Parent submitted payment
- `verified` - Admin verified parent payment ✅

#### Tutor Payout Status (`tutorPayoutStatus`)
- `null/pending` - Awaiting PTLC payout
- `processing` - PTLC processing payout
- `paid` - PTLC paid tutor ✅
- `failed` - Payout failed

## Files Created

1. `firebase/tutor-payouts.ts` - Payout management functions
2. `app/admin/tutor-payouts/page.tsx` - Admin payout interface
3. `TUTOR_PAYOUT_SYSTEM.md` - Complete documentation
4. `PTLC_PAYMENT_MODEL_SUMMARY.md` - This file

## Files Modified

1. `firebase/payments.ts` - Added payout fields
2. `app/tutor/earnings/page.tsx` - Updated to show PTLC payouts
3. `app/tutor/dashboard/page.tsx` - Updated earnings calculation
4. `DYNAMIC_EARNINGS_GUIDE.md` - Updated documentation

## Testing

### Test the Flow

1. **As Parent**: Pay for a session
2. **As Admin**: 
   - Verify parent payment at `/admin/payments`
   - Process tutor payout at `/admin/tutor-payouts`
3. **As Tutor**: 
   - Check earnings at `/tutor/earnings`
   - Verify payout status shows "Paid by PTLC"

### Verify Calculations

```bash
# Run test script (if created)
node scripts/test-tutor-payouts.js
```

## Benefits

### For PTLC (Platform)
- ✅ Control over cash flow
- ✅ Clear platform fee collection
- ✅ Flexible payout scheduling
- ✅ Better financial tracking

### For Tutors
- ✅ Clear visibility of earnings
- ✅ Know when they'll be paid
- ✅ Track payout history
- ✅ Receive notifications

### For Parents
- ✅ No change - still pay PTLC
- ✅ Don't need to coordinate with tutors
- ✅ Platform handles everything

## Important Notes

### Earnings = Money Received
Tutors only see earnings when PTLC has **actually paid them**, not when parents pay PTLC.

### Two-Stage Process
1. Parent → PTLC (payment verification)
2. PTLC → Tutor (payout processing)

Both stages must complete for tutor to see earnings.

### Admin Responsibility
Admins must regularly process tutor payouts at `/admin/tutor-payouts`.

### Platform Fee
10% platform fee is automatically calculated and deducted. Tutors always receive 90%.

## Next Steps

1. ✅ Test the complete flow
2. ✅ Verify earnings calculations
3. ✅ Train admins on payout processing
4. ✅ Communicate changes to tutors
5. ⏳ Consider automated payout scheduling
6. ⏳ Integrate with payment APIs

## Questions?

See detailed documentation:
- `TUTOR_PAYOUT_SYSTEM.md` - Complete payout system guide
- `DYNAMIC_EARNINGS_GUIDE.md` - Earnings calculation guide
- `PAYMENT_SYSTEM_GUIDE.md` - Overall payment system guide
