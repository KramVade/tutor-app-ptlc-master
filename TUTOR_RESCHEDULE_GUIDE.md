# Tutor Schedule Management Guide

## Overview
Tutors can now reschedule sessions for children directly from their schedule view. This feature allows tutors to change the date and time of upcoming sessions while automatically notifying parents of the changes.

## Features

### 1. Reschedule Sessions
- **Access**: Available from tutor schedule page and booking cards
- **Status**: Works for both pending and confirmed bookings
- **Restrictions**: Cannot reschedule completed or cancelled sessions

### 2. Reschedule Process

#### From Schedule Page
1. Navigate to **Tutor Dashboard** → **Schedule**
2. Click on a day with scheduled sessions
3. In the session details modal, click **"Reschedule Session"**
4. Select a new date from the calendar
5. Choose a new time slot
6. Optionally add a reason for rescheduling
7. Click **"Reschedule Session"** to confirm

#### From Booking Card
1. Find the booking in your bookings list
2. Click the **"Reschedule"** button
3. Follow the same process as above

### 3. Calendar Features
- **Available Days**: Only future dates with available time slots are selectable
- **Time Slots**: Shows your configured availability for the selected day
- **Visual Feedback**: Selected date and time are highlighted
- **Month Navigation**: Use arrows to browse different months

### 4. Parent Notifications
When you reschedule a session, the parent automatically receives:
- A notification in their dashboard
- Details about the old and new schedule
- Your reason for rescheduling (if provided)

## Technical Implementation

### Firebase Functions

#### `rescheduleBooking(bookingId, newDate, newTime, reason?)`
Updates the booking with new date/time and creates a notification for the parent.

**Parameters:**
- `bookingId`: The ID of the booking to reschedule
- `newDate`: New date in ISO format (YYYY-MM-DD)
- `newTime`: New time (e.g., "2:00 PM")
- `reason`: Optional reason for rescheduling

**Example:**
```typescript
await rescheduleBooking(
  "booking123",
  "2024-12-15",
  "3:00 PM",
  "Need to adjust schedule due to another commitment"
)
```

### Components

#### `RescheduleModal`
A modal component that provides the interface for rescheduling sessions.

**Props:**
- `isOpen`: Boolean to control modal visibility
- `onClose`: Callback when modal is closed
- `booking`: The booking object to reschedule
- `tutorAvailability`: Optional tutor availability schedule

**Usage:**
```tsx
<RescheduleModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  booking={selectedBooking}
  tutorAvailability={tutorData.availability}
/>
```

### Updated Components

#### `BookingCard`
- Added "Reschedule" button for tutors
- Shows for pending and confirmed bookings
- Opens reschedule modal on click

#### `TutorSchedulePage`
- Integrated reschedule functionality in session details modal
- Loads tutor availability data
- Passes availability to reschedule modal

## User Experience

### For Tutors
1. **Easy Access**: Reschedule button available in multiple locations
2. **Visual Calendar**: Clear calendar interface for date selection
3. **Time Slots**: Only shows available time slots based on your schedule
4. **Reason Field**: Optional field to explain the change to parents
5. **Instant Feedback**: Success/error messages confirm the action

### For Parents
1. **Automatic Notification**: Receive immediate notification of changes
2. **Clear Details**: See both old and new schedule information
3. **Reason Included**: Understand why the session was rescheduled
4. **No Action Required**: Schedule is automatically updated

## Best Practices

### When to Reschedule
- Give parents as much notice as possible
- Avoid rescheduling within 24 hours of the session
- Always provide a reason when rescheduling

### Communication
- Use the reason field to explain the change
- For last-minute changes, consider messaging the parent directly
- Be professional and apologetic when necessary

### Availability Management
- Keep your availability schedule up to date
- Block out times when you're not available
- Consider parent preferences when selecting new times

## Firestore Structure

### Bookings Collection
```javascript
{
  id: "booking123",
  parentId: "parent456",
  tutorId: "tutor789",
  childName: "John Doe",
  subject: "Mathematics",
  date: "2024-12-15",  // Updated when rescheduled
  time: "3:00 PM",     // Updated when rescheduled
  duration: 60,
  status: "confirmed",
  updatedAt: "2024-12-04T10:30:00Z"  // Updated timestamp
}
```

### Notifications Collection
```javascript
{
  id: "notif123",
  userId: "parent456",
  type: "booking",
  title: "Session Rescheduled",
  message: "Tutor has rescheduled your session from 2024-12-10 at 2:00 PM to 2024-12-15 at 3:00 PM. Reason: Need to adjust schedule",
  read: false,
  createdAt: "2024-12-04T10:30:00Z"
}
```

## Error Handling

### Common Errors
1. **Booking Not Found**: The booking ID doesn't exist
2. **Invalid Date**: Selected date is in the past
3. **No Time Slots**: Selected day has no available times
4. **Network Error**: Connection issues with Firebase

### Error Messages
- Clear, user-friendly error messages
- Suggestions for resolution when possible
- Option to retry the operation

## Future Enhancements

### Potential Features
1. **Parent Approval**: Require parent to approve reschedule
2. **Reschedule History**: Track all schedule changes
3. **Bulk Reschedule**: Reschedule multiple sessions at once
4. **Smart Suggestions**: AI-powered time slot recommendations
5. **Calendar Integration**: Sync with Google Calendar, etc.

## Testing

### Test Scenarios
1. Reschedule a pending booking
2. Reschedule a confirmed booking
3. Try to reschedule a completed booking (should fail)
4. Select past date (should be disabled)
5. Reschedule without reason
6. Reschedule with reason
7. Cancel reschedule operation
8. Verify parent receives notification

### Manual Testing Steps
1. Log in as a tutor
2. Navigate to schedule page
3. Click on a session
4. Click "Reschedule Session"
5. Select new date and time
6. Add optional reason
7. Confirm reschedule
8. Verify success message
9. Log in as parent
10. Check notifications for reschedule notice

## Support

### Common Questions

**Q: Can I reschedule a session multiple times?**
A: Yes, you can reschedule as many times as needed, but try to minimize changes for parent convenience.

**Q: What if the parent can't make the new time?**
A: Parents should message you directly to discuss alternative times. You can then reschedule again.

**Q: Can parents reschedule sessions?**
A: Currently, only tutors can reschedule. Parents should contact the tutor to request changes.

**Q: What happens to payments when I reschedule?**
A: Payment details remain the same, only the date and time are updated.

## Troubleshooting

### Issue: Reschedule button not showing
- Check that the booking status is "pending" or "confirmed"
- Verify you're logged in as a tutor
- Refresh the page

### Issue: No available time slots
- Update your availability in your profile settings
- Check that you've set availability for the selected day
- Verify the day is not in the past

### Issue: Parent didn't receive notification
- Check Firebase console for notification creation
- Verify parent's userId is correct in booking
- Check notification permissions

## Related Documentation
- [Booking System Guide](BOOKING_SYSTEM_GUIDE.md)
- [Notifications System Guide](NOTIFICATIONS_SYSTEM_GUIDE.md)
- [Tutor Profile Guide](PROFILE_UPDATE_GUIDE.md)
