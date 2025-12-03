# Earnings System Update - Summary

## What Changed

Tutor earnings are now **dynamic** and calculated from verified payments in real-time, instead of being static or calculated from bookings.

## Files Modified

### 1. Created: `app/tutor/earnings/page.tsx`
New dedicated earnings page for tutors showing:
- Total verified earnings
- This month's earnings
- Pending verification amounts
- Awaiting payment amounts
- Detailed payment history table

### 2. Updated: `app/tutor/dashboard/page.tsx`
Dashboard now calculates earnings from verified payments:
- Uses `getPaymentsByTutorId()` instead of bookings
- Shows `tutorAmount` (90%) instead of `totalPrice` (100%)
- Only counts `verified` payments

### 3. Updated: `firebase/earnings.js`
Added new utility functions:
- `getEarningsFromPayments(tutorId)` - Get total earnings from verified payments
- `getMonthlyEarningsFromPayments(tutorId, month, year)` - Get monthly earnings

### 4. Created: `scripts/test-dynamic-earnings.js`
Test script to verify dynamic earnings calculation

### 5. Created: `DYNAMIC_EARNINGS_GUIDE.md`
Complete documentation of the dynamic earnings system

## Key Features

✅ **Real-time earnings** - Updates as payments are verified
✅ **Platform fee handling** - Automatic 10% platform fee deduction
✅ **Payment status tracking** - Clear visibility of payment pipeline
✅ **Historical data** - Complete payment history with breakdown
✅ **Accurate calculations** - Based on actual verified payments

## How to Test

1. Navigate to `/tutor/earnings` as a tutor
2. View earnings breakdown by status
3. Check payment history table
4. Run test script: `node scripts/test-dynamic-earnings.js`

## Payment Flow

```
Booking → Pending → Session Complete → Due → Parent Pays → Paid → Admin Verifies → Verified ✅
                                                                                        ↓
                                                                              Earnings Updated
```

## Earnings Calculation

```
Payment Amount: ₱1,000
Platform Fee (10%): ₱100
Tutor Earnings (90%): ₱900 ← This is what tutors see
```

Only **verified** payments count toward tutor earnings!
