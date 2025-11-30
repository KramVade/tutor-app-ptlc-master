# Booking System - Firebase Integration

## Overview

The booking system now integrates with Firebase, allowing parents to book tutoring sessions for their children. All bookings are stored in the `bookings` collection in Firestore.

## What Was Updated

### 1. Firebase Bookings Service (`firebase/bookings.ts`)

**Created TypeScript interface:**
```typescript
export interface Booking {
  id?: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
  tutorId: string;
  tutorEmail: string;
  tutorName: string;
  childId: string;
  childName: string;
  childAge?: number;
  childGrade?: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  hourlyRate: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
```

**Functions:**
- `getAllBookings()` - Get all bookings
- `getBookingById(bookingId)` - Get specific booking
- `getBookingsByParentId(parentId)` - Get parent's bookings
- `getBookingsByTutorId(tutorId)` - Get tutor's bookings
- `getBookingsByStatus(status)` - Get bookings by status
- `addBooking(bookingData)` - Create new booking
- `updateBooking(bookingId, bookingData)` - Update booking
- `updateBookingStatus(bookingId, status)` - Update status
- `deleteBooking(bookingId)` - Delete booking

### 2. Booking Modal (`components/booking/booking-modal.tsx`)

**Updated Features:**
- ✅ Fetches children from Firebase (not mock data)
- ✅ Shows loading state while fetching children
- ✅ Shows empty state if no children registered
- ✅ Saves booking to Firebase with all details
- ✅ Includes child information in booking
- ✅ Calculates total price
- ✅ Error handling with toast notifications
- ✅ Console logging for debugging

## Booking Flow

```
Parent clicks "Book a Session"
    ↓
Modal opens
    ↓
Load children from Firebase
    ↓
Step 1: Select Child & Subject
    ↓
Step 2: Select Date & Time
    ↓
Step 3: Select Duration & Add Notes
    ↓
Review Summary
    ↓
Click "Confirm Booking"
    ↓
Save to Firebase
    ↓
Show success message
    ↓
Close modal
```

## Booking Data Structure

### What Gets Saved to Firebase

```json
{
  "parentId": "parent_abc123",
  "parentEmail": "parent@example.com",
  "parentName": "Jane Smith",
  "tutorId": "tutor_xyz789",
  "tutorEmail": "tutor@example.com",
  "tutorName": "John Doe",
  "childId": "child_def456",
  "childName": "Emily Johnson",
  "childAge": 12,
  "childGrade": "Grade 7",
  "subject": "Mathematics",
  "date": "2024-01-20",
  "time": "3:00 PM",
  "duration": 60,
  "hourlyRate": 50,
  "totalPrice": 50,
  "status": "pending",
  "notes": "Focus on algebra",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Step-by-Step Booking Process

### Step 1: Select Child & Subject

**Child Selection:**
- Fetches children from Firebase using parent's ID
- Shows loading spinner while fetching
- Displays all registered children
- Shows child's name, grade level, and age
- Empty state if no children registered

**Subject Selection:**
- Shows all subjects the tutor teaches
- Single selection from available subjects

### Step 2: Select Date & Time

**Date Selection:**
- Calendar view with month navigation
- Only shows available dates (based on tutor availability)
- Disables past dates
- Highlights selected date

**Time Selection:**
- Shows available time slots for selected date
- Based on tutor's availability schedule
- Single selection from available times

### Step 3: Duration & Notes

**Duration:**
- Options: 30, 60, 90, 120 minutes
- Default: 60 minutes
- Affects total price calculation

**Notes:**
- Optional text area
- For special requests or focus areas
- Sent to tutor with booking

**Summary:**
- Shows all booking details
- Displays calculated total price
- Final review before confirmation

## Console Logs

### Loading Children
```
🔍 Loading children from Firebase...
✅ Loaded children: 2
```

### Creating Booking
```
📅 Creating booking in Firebase...
Booking data: {
  parentId: "parent_123",
  childId: "child_456",
  tutorId: "tutor_789",
  ...
}
✅ Booking created with ID: booking_abc123
```

### Errors
```
❌ Error loading children: [error details]
❌ Error creating booking: [error details]
```

## Toast Notifications

### Success
- **Title:** "Booking Confirmed!"
- **Message:** "Your session with [Tutor Name] has been booked for [Child Name]."

### Error - Loading Children
- **Title:** "Error"
- **Message:** "Failed to load children"

### Error - Creating Booking
- **Title:** "Booking Failed"
- **Message:** "Failed to create booking. Please try again."

## Testing Checklist

- [ ] Modal opens when clicking "Book a Session"
- [ ] Children load from Firebase
- [ ] Loading state shows while fetching
- [ ] Empty state shows if no children
- [ ] Can select a child
- [ ] Can select a subject
- [ ] Can navigate calendar months
- [ ] Can select a date
- [ ] Available times show for selected date
- [ ] Can select a time
- [ ] Can select duration
- [ ] Can add notes
- [ ] Summary shows correct information
- [ ] Total price calculates correctly
- [ ] Booking saves to Firebase
- [ ] Success toast shows
- [ ] Modal closes after booking
- [ ] Booking appears in Firebase Console

## Firebase Structure

### Bookings Collection

```
firestore/
└── bookings/
    └── {bookingId}/
        ├── parentId: "parent_abc123"
        ├── parentEmail: "parent@example.com"
        ├── parentName: "Jane Smith"
        ├── tutorId: "tutor_xyz789"
        ├── tutorEmail: "tutor@example.com"
        ├── tutorName: "John Doe"
        ├── childId: "child_def456"
        ├── childName: "Emily Johnson"
        ├── childAge: 12
        ├── childGrade: "Grade 7"
        ├── subject: "Mathematics"
        ├── date: "2024-01-20"
        ├── time: "3:00 PM"
        ├── duration: 60
        ├── hourlyRate: 50
        ├── totalPrice: 50
        ├── status: "pending"
        ├── notes: "Focus on algebra"
        ├── createdAt: "2024-01-15T10:00:00.000Z"
        └── updatedAt: "2024-01-15T10:00:00.000Z"
```

## Code Examples

### Create a Booking

```typescript
const { addBooking } = await import("@/firebase/bookings")

const bookingId = await addBooking({
  parentId: user.id,
  parentEmail: user.email,
  parentName: user.name,
  tutorId: tutor.id,
  tutorEmail: tutor.email,
  tutorName: tutor.name,
  childId: child.id,
  childName: child.name,
  childAge: child.age,
  childGrade: child.gradeLevel,
  subject: "Math",
  date: "2024-01-20",
  time: "3:00 PM",
  duration: 60,
  hourlyRate: 50,
  totalPrice: 50,
  status: "pending",
  notes: "Focus on algebra",
  createdAt: new Date().toISOString()
})
```

### Get Parent's Bookings

```typescript
const { getBookingsByParentId } = await import("@/firebase/bookings")

const bookings = await getBookingsByParentId(parentId)
console.log('Bookings:', bookings)
```

### Update Booking Status

```typescript
const { updateBookingStatus } = await import("@/firebase/bookings")

await updateBookingStatus(bookingId, "confirmed")
```

## Booking Statuses

- **pending** - Waiting for tutor confirmation
- **confirmed** - Tutor has confirmed the session
- **completed** - Session has been completed
- **cancelled** - Booking was cancelled

## Price Calculation

```typescript
const totalPrice = (hourlyRate * duration) / 60

// Examples:
// $50/hour × 60 minutes = $50
// $50/hour × 30 minutes = $25
// $50/hour × 90 minutes = $75
// $50/hour × 120 minutes = $100
```

## Next Steps

### For Parents
1. View bookings on dashboard
2. Cancel bookings
3. Reschedule bookings
4. Rate completed sessions
5. View booking history

### For Tutors
1. View pending bookings
2. Accept/decline bookings
3. View upcoming sessions
4. Mark sessions as completed
5. View earnings from bookings

### Enhancements
1. **Email notifications** - Notify tutor of new booking
2. **Calendar integration** - Add to Google Calendar
3. **Reminders** - Send reminders before session
4. **Recurring bookings** - Book multiple sessions
5. **Payment integration** - Process payments
6. **Video call links** - For online sessions

## Integration with Dashboard

### Parent Dashboard
Show upcoming bookings:

```typescript
const { getBookingsByParentId } = await import("@/firebase/bookings")

const bookings = await getBookingsByParentId(user.id)
const upcomingBookings = bookings.filter(b => 
  b.status === 'pending' || b.status === 'confirmed'
)
```

### Tutor Dashboard
Show pending bookings:

```typescript
const { getBookingsByTutorId } = await import("@/firebase/bookings")

const bookings = await getBookingsByTutorId(user.id)
const pendingBookings = bookings.filter(b => b.status === 'pending')
```

## Security Considerations

### Current Implementation
- Bookings linked to parent, tutor, and child
- Parent ID from authenticated user
- All data validated before saving

### For Production
Add Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      // Parents can read their own bookings
      allow read: if request.auth != null && 
        (resource.data.parentId == request.auth.uid ||
         resource.data.tutorId == request.auth.uid);
      
      // Parents can create bookings
      allow create: if request.auth != null && 
        request.resource.data.parentId == request.auth.uid;
      
      // Parents and tutors can update their bookings
      allow update: if request.auth != null && 
        (resource.data.parentId == request.auth.uid ||
         resource.data.tutorId == request.auth.uid);
      
      // Only parents can delete their bookings
      allow delete: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
    }
  }
}
```

---

**Status:** ✅ Booking system fully integrated with Firebase!

**Features:**
- ✅ Child selection from Firebase
- ✅ Booking saved to Firebase
- ✅ Complete booking information stored
- ✅ Error handling and notifications
- ✅ Loading states
