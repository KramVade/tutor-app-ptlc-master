# Tutors Page - Firebase Integration

## Overview

The tutors listing and detail pages now fetch real data from Firebase instead of using mock data.

## What Was Updated

### 1. Tutors Listing Page (`app/parent/tutors/page.tsx`)

**Before:**
```typescript
const { tutors } = useData() // Mock data from context
```

**After:**
```typescript
const [tutors, setTutors] = useState<any[]>([])

const loadTutors = async () => {
  const { getAllTutors } = await import("@/firebase/tutors")
  const tutorsData = await getAllTutors()
  setTutors(tutorsData)
}
```

**Features:**
- ✅ Fetches all tutors from Firebase on page load
- ✅ Search by name, subject, or bio
- ✅ Filter by location
- ✅ Filter by subjects
- ✅ Filter by price range
- ✅ Filter by rating
- ✅ Loading states
- ✅ Empty state handling
- ✅ Console logging for debugging

### 2. Tutor Detail Page (`app/parent/tutors/[id]/page.tsx`)

**Before:**
```typescript
const tutor = tutors.find((t) => t.id === params.id) // From mock data
```

**After:**
```typescript
const [tutor, setTutor] = useState<any>(null)

const loadTutor = async () => {
  const { getTutorById } = await import("@/firebase/tutors")
  const tutorData = await getTutorById(params.id as string)
  setTutor(tutorData)
}
```

**Features:**
- ✅ Fetches specific tutor from Firebase by ID
- ✅ Shows tutor profile details
- ✅ Displays subjects, education, experience
- ✅ Shows reviews
- ✅ Booking functionality
- ✅ Loading states
- ✅ Not found handling

## How It Works

### Tutors Listing Flow

```
Parent visits /parent/tutors
    ↓
Page loads
    ↓
useEffect triggers loadTutors()
    ↓
Import getAllTutors from Firebase
    ↓
Fetch all tutors from Firestore
    ↓
Update state with tutors
    ↓
Display tutors in grid
    ↓
User can search/filter
```

### Tutor Detail Flow

```
Parent clicks on tutor card
    ↓
Navigate to /parent/tutors/[id]
    ↓
Page loads with tutor ID
    ↓
useEffect triggers loadTutor()
    ↓
Import getTutorById from Firebase
    ↓
Fetch specific tutor from Firestore
    ↓
Update state with tutor data
    ↓
Display tutor profile
```

## Firebase Queries Used

### Get All Tutors
```typescript
const { getAllTutors } = await import("@/firebase/tutors")
const tutors = await getAllTutors()
```

Returns all tutors from the `tutors` collection.

### Get Tutor by ID
```typescript
const { getTutorById } = await import("@/firebase/tutors")
const tutor = await getTutorById(tutorId)
```

Returns a specific tutor document by ID.

## Expected Tutor Data Structure

```typescript
{
  id: "tutor_123",
  name: "John Doe",
  email: "john@example.com",
  bio: "Experienced math tutor...",
  subjects: ["Math", "Physics", "Chemistry"],
  hourlyRate: 50,
  rating: 4.8,
  reviewCount: 45,
  location: "New York, NY",
  avatar: "https://...",
  available: true,
  verified: true,
  responseTime: "within 1 hour",
  totalSessions: 120,
  education: [
    {
      degree: "Master's in Mathematics",
      school: "MIT",
      year: "2018"
    }
  ],
  experience: "5+ years of tutoring experience",
  languages: ["English", "Spanish"],
  documents: [
    {
      name: "Background Check",
      status: "verified"
    },
    {
      name: "Teaching Certificate",
      status: "verified"
    }
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
}
```

## Search & Filter Features

### Search
Searches across:
- Tutor name
- Subjects
- Bio/description

### Filters
- **Location** - Filter by city/location
- **Subjects** - Filter by specific subjects
- **Price Range** - Filter by hourly rate ($0-$200)
- **Rating** - Filter by minimum rating

### Filter Logic
```typescript
const filteredTutors = tutors.filter((tutor) => {
  const matchesSearch = 
    tutor.name.toLowerCase().includes(search.toLowerCase()) ||
    tutor.subjects.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    tutor.bio.toLowerCase().includes(search.toLowerCase())

  const matchesLocation = 
    !location || tutor.location.toLowerCase().includes(location.toLowerCase())

  const matchesSubjects = 
    filters.subjects.length === 0 || 
    filters.subjects.some(s => tutor.subjects.includes(s))

  const matchesPrice = 
    tutor.hourlyRate >= filters.priceRange[0] && 
    tutor.hourlyRate <= filters.priceRange[1]

  const matchesRating = tutor.rating >= filters.rating

  return matchesSearch && matchesLocation && matchesSubjects && 
         matchesPrice && matchesRating
})
```

## Console Logs

### Tutors Listing Page
```
🔍 Loading tutors from Firebase...
✅ Loaded tutors: 15
```

### Tutor Detail Page
```
🔍 Loading tutor from Firebase... tutor_123
✅ Loaded tutor: { id: "tutor_123", name: "John Doe", ... }
```

### Error Handling
```
❌ Error loading tutors: [error details]
```

## Testing Checklist

### Tutors Listing Page
- [ ] Page loads without errors
- [ ] Tutors are fetched from Firebase
- [ ] Tutors display in grid
- [ ] Search works correctly
- [ ] Location filter works
- [ ] Subject filter works
- [ ] Price range filter works
- [ ] Rating filter works
- [ ] Loading state shows
- [ ] Empty state shows when no results
- [ ] Console logs show correct data

### Tutor Detail Page
- [ ] Page loads with tutor ID
- [ ] Tutor data fetched from Firebase
- [ ] Profile displays correctly
- [ ] Subjects display
- [ ] Education displays
- [ ] Experience displays
- [ ] Languages display
- [ ] Reviews display
- [ ] Booking button works
- [ ] Message button works
- [ ] Loading state shows
- [ ] Not found state shows for invalid ID

## Adding Test Tutors

To test the pages, add some tutors to Firebase:

### Method 1: Through Signup
1. Go to `/signup`
2. Select "Tutor" role
3. Create account
4. Go to `/tutor/profile`
5. Fill in profile details

### Method 2: Directly in Firebase Console
1. Go to Firebase Console → Firestore
2. Open `tutors` collection
3. Add document with structure above

### Method 3: Using Firebase Service
```typescript
const { addTutor } = await import("@/firebase/tutors")

await addTutor({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  bio: "Experienced math tutor with 5+ years...",
  subjects: ["Math", "Physics"],
  hourlyRate: 50,
  rating: 4.8,
  reviewCount: 45,
  location: "New York, NY",
  avatar: "",
  available: true,
  verified: true,
  responseTime: "within 1 hour",
  totalSessions: 120,
  education: [
    {
      degree: "Master's in Mathematics",
      school: "MIT",
      year: "2018"
    }
  ],
  experience: "5+ years of tutoring experience",
  languages: ["English", "Spanish"],
  documents: [
    {
      name: "Background Check",
      status: "verified"
    }
  ],
  phone: "+1234567890",
  createdAt: new Date().toISOString()
})
```

## Performance Considerations

### Current Implementation
- Fetches all tutors on page load
- Filters happen client-side

### For Large Datasets
Consider implementing:
1. **Pagination** - Load tutors in batches
2. **Server-side filtering** - Use Firestore queries
3. **Caching** - Cache tutor data
4. **Lazy loading** - Load more as user scrolls

### Example: Pagination
```typescript
import { query, limit, startAfter, orderBy } from 'firebase/firestore'

const q = query(
  collection(db, 'tutors'),
  orderBy('name'),
  limit(10)
)
```

### Example: Server-side Subject Filter
```typescript
const q = query(
  collection(db, 'tutors'),
  where('subjects', 'array-contains', 'Math')
)
```

## Next Steps

### Enhancements
1. **Add favorites** - Save favorite tutors
2. **Add reviews** - Let parents leave reviews
3. **Add availability** - Show tutor's available times
4. **Add instant booking** - Book without modal
5. **Add tutor comparison** - Compare multiple tutors
6. **Add sorting** - Sort by price, rating, etc.

### Integration with Bookings
When booking a tutor, save to Firebase:

```typescript
const { addBooking } = await import("@/firebase/bookings")

await addBooking({
  parentId: user.id,
  parentEmail: user.email,
  tutorId: tutor.id,
  tutorEmail: tutor.email,
  tutorName: tutor.name,
  subject: selectedSubject,
  date: selectedDate,
  time: selectedTime,
  duration: 60,
  hourlyRate: tutor.hourlyRate,
  status: "pending",
  createdAt: new Date().toISOString()
})
```

## Troubleshooting

### No tutors showing
1. Check Firebase Console - Are there tutors in the collection?
2. Check console logs - Any errors?
3. Check network tab - Is Firebase request successful?
4. Verify Firebase credentials in `.env.local`

### Tutor detail page not loading
1. Check if tutor ID is valid
2. Check if tutor exists in Firebase
3. Check console logs for errors
4. Verify `getTutorById` function works

### Filters not working
1. Check if tutor data has required fields
2. Verify filter logic
3. Check console for errors
4. Test with different filter combinations

---

**Status:** ✅ Tutors pages now use real Firebase data!

**Pages Updated:**
- `/parent/tutors` - Tutors listing
- `/parent/tutors/[id]` - Tutor detail
