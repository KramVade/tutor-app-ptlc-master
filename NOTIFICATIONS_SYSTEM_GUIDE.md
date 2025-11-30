# Notifications System Guide

## Overview
The notifications system provides real-time notifications to users about bookings, messages, and other important events using Firebase Firestore.

## Features

### Real-time Updates
- Notifications are synced in real-time using Firestore listeners
- Automatic updates when new notifications arrive
- No page refresh needed

### Notification Types
1. **Booking Notifications**
   - New booking requests (for tutors)
   - Booking confirmations (for parents)
   - Booking cancellations

2. **Message Notifications**
   - New message alerts
   - Links directly to the conversation

3. **System Notifications**
   - General announcements
   - Important updates

## Firebase Structure

### Collection: `notifications`
```typescript
{
  id: string
  userId: string              // User who receives the notification
  type: 'booking' | 'message' | 'payment' | 'system'
  title: string
  message: string
  read: boolean
  link?: string              // Optional link to navigate to
  createdAt: string
}
```

## Usage

### Accessing Notifications
```typescript
import { useNotification } from '@/lib/context/notification-context'

function MyComponent() {
  const { 
    notifications,      // All notifications
    unreadCount,       // Count of unread notifications
    markAsRead,        // Mark single notification as read
    markAllAsRead,     // Mark all as read
    showToast          // Show temporary toast message
  } = useNotification()
}
```

### Creating Notifications

#### Booking Notifications
```typescript
import { createBookingNotification } from '@/firebase/notifications'

// New booking request
await createBookingNotification(
  tutorId,
  'new_booking',
  {
    parentName: 'John Doe',
    date: '2024-01-15',
    time: '10:00 AM'
  }
)

// Booking confirmed
await createBookingNotification(
  parentId,
  'booking_confirmed',
  {
    tutorName: 'Jane Smith',
    date: '2024-01-15',
    time: '10:00 AM'
  }
)
```

#### Message Notifications
```typescript
import { createMessageNotification } from '@/firebase/notifications'

await createMessageNotification(
  receiverId,
  senderName,
  conversationId
)
```

### Toast Notifications
For temporary success/error messages:

```typescript
const { showToast } = useNotification()

showToast({
  type: 'success',
  title: 'Success!',
  message: 'Your action was completed'
})

showToast({
  type: 'error',
  title: 'Error',
  message: 'Something went wrong'
})
```

## Automatic Notifications

The system automatically creates notifications for:

1. **New Bookings** - Tutor receives notification when parent books a session
2. **Booking Status Changes** - Parent receives notification when booking is confirmed/cancelled
3. **New Messages** - Receiver gets notification when a message is sent

## Display

### Header Bell Icon
- Shows unread count badge
- Dropdown shows recent 5 notifications
- Click notification to mark as read
- "Mark all read" button available

### Notification Item
- Icon based on type (booking, message, etc.)
- Title and message
- Timestamp
- Read/unread indicator
- Optional link to related content

## Firebase Functions

### Core Functions
- `getNotificationsByUserId(userId)` - Get all notifications for a user
- `getUnreadNotificationsCount(userId)` - Get count of unread notifications
- `addNotification(data)` - Create a new notification
- `markNotificationAsRead(notificationId)` - Mark single as read
- `markAllNotificationsAsRead(userId)` - Mark all as read
- `subscribeToNotifications(userId, callback)` - Real-time listener

### Helper Functions
- `createBookingNotification()` - Create booking-related notifications
- `createMessageNotification()` - Create message notifications

## Best Practices

1. **Always handle errors** when creating notifications - don't let notification failures break main functionality
2. **Use appropriate types** - Choose the correct notification type for better organization
3. **Keep messages concise** - Notification messages should be brief and clear
4. **Include links** when relevant - Help users navigate to related content
5. **Don't spam** - Only create notifications for important events

## Testing

To test notifications:

1. Create a booking as a parent - tutor should receive notification
2. Confirm/cancel a booking as tutor - parent should receive notification
3. Send a message - receiver should receive notification
4. Check that unread count updates in real-time
5. Verify "mark as read" functionality works

## Troubleshooting

### Notifications not appearing
- Check Firebase connection
- Verify user is logged in
- Check browser console for errors
- Ensure Firestore rules allow read/write to notifications collection

### Real-time updates not working
- Check that subscription is properly set up
- Verify cleanup function is called on unmount
- Check network connection

### Unread count incorrect
- Verify `read` field is being updated correctly
- Check that markAsRead function is being called
- Refresh the page to resync
