# Tutor Session Management - Quick Reference

## ✅ Completed Features

### 1. Reschedule Sessions
Tutors can change the date and time of scheduled sessions.

**Where:**
- Tutor Bookings page → Click "Reschedule"
- Tutor Schedule page → Session details → Click "Reschedule Session"

**How:**
1. Click reschedule button
2. Select new date from calendar
3. Select new time from available slots
4. Add optional reason
5. Confirm

**Result:**
- Booking updated with new date/time
- Parent receives notification with reason
- Schedule automatically updates

---

### 2. Mark Sessions Complete
Tutors can mark confirmed sessions as completed.

**Where:**
- Tutor Bookings page → Upcoming tab → Click "Mark Complete"
- Tutor Schedule page → Session details → Click "Mark Complete"

**How:**
1. Click "Mark Complete" button
2. Review session details in modal
3. Confirm completion

**Result:**
- Booking status → "completed"
- Payment marked as due
- Parent receives notification
- Session moves to completed tab
- Tutor earnings updated

---

## Button Visibility

| Booking Status | Reschedule | Mark Complete | Approve/Decline |
|---------------|------------|---------------|-----------------|
| Pending       | ✅ Yes     | ❌ No         | ✅ Yes          |
| Confirmed     | ✅ Yes     | ✅ Yes        | ❌ No           |
| Completed     | ❌ No      | ❌ No         | ❌ No           |
| Cancelled     | ❌ No      | ❌ No         | ❌ No           |

---

## User Flows

### Reschedule Flow
```
Tutor clicks "Reschedule"
    ↓
Modal shows current booking
    ↓
Select new date
    ↓
Select new time
    ↓
Add reason (optional)
    ↓
Click "Reschedule Session"
    ↓
Booking updated
    ↓
Parent notified
    ↓
Success message
```

### Mark Complete Flow
```
Tutor clicks "Mark Complete"
    ↓
Modal shows session details
    ↓
Click "Mark Complete"
    ↓
Status → completed
    ↓
Payment → due
    ↓
Parent notified
    ↓
Earnings updated
    ↓
Success message
```

---

## Files Modified

### Core Files
- `firebase/bookings.ts` - Added reschedule & completion logic
- `firebase/notifications.ts` - Extended notification types
- `components/booking/booking-card.tsx` - Added buttons & modals
- `app/tutor/schedule/page.tsx` - Integrated features
- `app/tutor/bookings/page.tsx` - Already compatible

### New Files
- `components/booking/reschedule-modal.tsx` - Reschedule UI
- `TUTOR_RESCHEDULE_GUIDE.md` - Reschedule docs
- `MARK_COMPLETE_FEATURE_GUIDE.md` - Completion docs

---

## Key Functions

### Reschedule
```typescript
rescheduleBooking(
  bookingId: string,
  newDate: string,
  newTime: string,
  reason?: string
): Promise<boolean>
```

### Mark Complete
```typescript
updateBookingStatus(
  bookingId: string,
  status: "completed"
): Promise<void>
```

---

## Notifications

### Reschedule Notification
```
Title: "Session Rescheduled"
Message: "[Tutor] has rescheduled your session from 
         [old date] at [old time] to [new date] at 
         [new time]. Reason: [reason]"
```

### Completion Notification
```
Title: "Session Completed"
Message: "Your session with [Tutor] on [date] at 
         [time] has been completed"
```

---

## Payment Integration

### When Session is Completed
1. Payment status changes to "due"
2. Parent can now pay
3. Payment appears in parent's dashboard
4. Tutor earnings are calculated
5. Payout scheduled according to schedule

---

## Best Practices

### Rescheduling
✅ Give advance notice when possible
✅ Always provide a reason
✅ Confirm new time works for parent
✅ Avoid last-minute changes

### Marking Complete
✅ Mark complete immediately after session
✅ Verify correct session before confirming
✅ Ensure session actually occurred
✅ Address issues before completing

---

## Testing Checklist

### Reschedule
- [x] Button shows for pending/confirmed
- [x] Calendar shows future dates only
- [x] Time slots match availability
- [x] Reason field is optional
- [x] Parent receives notification
- [x] Schedule updates correctly

### Mark Complete
- [x] Button shows for confirmed only
- [x] Confirmation modal appears
- [x] Status updates to completed
- [x] Payment marked as due
- [x] Parent receives notification
- [x] Earnings updated

---

## Quick Links

- [Full Reschedule Guide](TUTOR_RESCHEDULE_GUIDE.md)
- [Full Mark Complete Guide](MARK_COMPLETE_FEATURE_GUIDE.md)
- [Implementation Summary](RESCHEDULE_FEATURE_SUMMARY.md)
- [Booking System](BOOKING_SYSTEM_GUIDE.md)
- [Payment System](PAYMENT_SYSTEM_GUIDE.md)

---

## Support

**Issues?**
- Check the full guides above
- Verify you're logged in as tutor
- Ensure booking status is correct
- Try refreshing the page
- Contact support if problems persist

**Questions?**
- Review the detailed documentation
- Check the troubleshooting sections
- Contact platform support
