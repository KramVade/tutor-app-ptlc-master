# Payment Migration Guide

## Issue
The payments page shows "No Payments" because payment records weren't automatically created for bookings that were confirmed before the payment system was implemented.

## Solution
Run the migration script to create payment records for existing confirmed bookings.

## Steps

### 1. Check Current State
First, let's see what bookings and payments you have:

```bash
node scripts/test-payments.js
```

This will show:
- All bookings and their status
- All payments
- Which confirmed bookings don't have payment records

### 2. Run Migration Script
Create payment records for confirmed bookings:

```bash
node scripts/create-payments-for-bookings.js
```

This script will:
- Find all confirmed bookings
- Check which ones don't have payment records
- Create payment records with "pending" status
- Skip bookings that already have payments

### 3. Verify
After running the migration:

1. Refresh the parent payments page
2. You should now see payments with "Scheduled" status
3. Check the browser console for logs showing payments loaded

### 4. Test the Flow

**Test marking a session as completed:**

1. Go to tutor bookings page
2. Find a confirmed booking
3. Mark it as "completed"
4. Check parent payments page
5. Payment status should change from "Scheduled" to "Payment Due"
6. "Pay Now" button should appear

## Alternative: Manual Testing

If you don't have any bookings yet, create a test flow:

### As Parent:
1. Go to "Find Tutors"
2. Book a session with a tutor
3. Fill in all details and submit

### As Tutor:
1. Go to "Bookings"
2. Find the pending booking
3. Click "Confirm" to accept it
4. Payment record is automatically created

### Check Payments:
1. Log in as parent
2. Go to "Payments" page
3. You should see the payment with "Scheduled" status

### Complete Session:
1. Log in as tutor
2. Go to "Bookings"
3. Find the confirmed booking
4. Mark it as "Completed"

### Pay:
1. Log in as parent
2. Go to "Payments" page
3. Payment should now show "Payment Due"
4. Click "Pay Now"
5. Enter GCash reference number
6. Submit payment

## Troubleshooting

### No bookings showing in test script
- Make sure you have created at least one booking
- Check that the booking status is "confirmed"
- Verify Firebase connection is working

### Script errors
- Make sure you have `.env.local` file with Firebase config
- Run `npm install` to ensure all dependencies are installed
- Check that Firebase credentials are correct

### Payments still not showing
1. Open browser console (F12)
2. Go to parent payments page
3. Look for console logs:
   - "💳 Loading payments for parent: [id]"
   - "✅ Payments loaded: [count]"
4. If count is 0, check Firestore directly:
   - Go to Firebase Console
   - Open Firestore Database
   - Check "payments" collection
   - Verify parentId matches your user ID

### Firestore permission errors
Make sure your `firestore.rules` includes:

```
match /payments/{paymentId} {
  allow read: if isSignedIn() && 
    (resource.data.parentId == request.auth.uid || 
     resource.data.tutorId == request.auth.uid);
  allow create: if isSignedIn();
  allow update: if isSignedIn() && 
    (resource.data.parentId == request.auth.uid || 
     resource.data.tutorId == request.auth.uid);
}
```

## Expected Results

After migration, you should see:

### Parent Payments Page:
- Stats showing count of scheduled payments
- List of payments with "Scheduled" badge
- Each payment showing:
  - Tutor name
  - Child name
  - Subject
  - Date and time
  - Amount
  - "Payment after session" note

### After Completing a Session:
- Payment status changes to "Payment Due"
- "Pay Now" button appears
- Parent receives notification

## Notes

- The migration script is safe to run multiple times
- It will skip bookings that already have payments
- All new confirmed bookings will automatically get payment records
- No manual intervention needed for future bookings
