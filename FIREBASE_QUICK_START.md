# Firebase Integration - Quick Start

## ✅ What's Been Done

Your project is now fully integrated with Firebase! Here's what was set up:

### 1. Firebase Service Files
- ✅ `firebase/config.js` - Firebase initialization
- ✅ `firebase/tutors.js` - Tutor operations
- ✅ `firebase/parents.js` - Parent operations  
- ✅ `firebase/admin.js` - Admin operations
- ✅ `firebase/bookings.js` - Booking management
- ✅ `firebase/children.js` - Children profiles
- ✅ `firebase/payments.js` - Payment tracking
- ✅ `firebase/earnings.js` - Earnings tracking

### 2. Authentication Integration
- ✅ Updated `lib/context/auth-context.tsx` to use Firebase
- ✅ Login now checks Firebase database for users
- ✅ Signup now creates users in Firebase
- ✅ Users must exist in database to log in

### 3. Configuration Files
- ✅ Created `.env.local` for Firebase credentials
- ✅ Updated `.gitignore` to exclude sensitive files

## 🚀 How to Complete Setup

### Step 1: Add Your Firebase Credentials

Edit `.env.local` and replace with your actual Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Where to find these:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ → Project settings
4. Scroll to "Your apps" → Web app
5. Copy the config values

### Step 2: Restart Your Dev Server

```bash
npm run dev
```

### Step 3: Test the Connection

**Option A: Create a test user in Firebase Console**
1. Go to Firestore Database
2. Create a collection called `parents` or `tutors`
3. Add a document with:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123",
     "phone": "",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```
4. Try logging in with those credentials

**Option B: Sign up through the app**
1. Go to `/signup`
2. Create a new account
3. Check Firebase Console to see if user was created
4. Try logging in with those credentials

## 🔒 How Authentication Works Now

### Before (Mock Data)
- Anyone could "log in" with any email/password
- Data was only stored in localStorage
- No real database connection

### After (Firebase Integration)
- ✅ Login checks if user exists in Firebase
- ✅ Password is verified against database
- ✅ Only registered users can access the system
- ✅ Signup creates real users in Firebase
- ✅ Role-based authentication (parent/tutor/admin)

## 📊 Database Collections

Your Firebase should have these collections:

| Collection | Purpose | Used By |
|------------|---------|---------|
| `tutors` | Tutor profiles | Tutor signup/login |
| `parents` | Parent profiles | Parent signup/login |
| `admins` | Admin users | Admin login |
| `bookings` | Session bookings | Parents & Tutors |
| `children` | Children profiles | Parents |
| `payments` | Payment records | Parents & Tutors |
| `earnings` | Tutor earnings | Tutors |

## 🧪 Testing Checklist

- [ ] Firebase credentials added to `.env.local`
- [ ] Dev server restarted
- [ ] Can create new user via signup
- [ ] New user appears in Firebase Console
- [ ] Can log in with created user
- [ ] Cannot log in with non-existent user
- [ ] Error message shows for invalid credentials

## ⚠️ Important Security Notes

**Current Implementation:**
- Passwords are stored in plain text (NOT SECURE for production!)
- This is for development/testing only

**For Production:**
- Use Firebase Authentication (recommended)
- Or implement password hashing (bcrypt, argon2)
- Add proper Firestore security rules
- Enable HTTPS only
- Add rate limiting

## 🐛 Common Issues

### "Firebase not initialized"
- Check `.env.local` has correct values
- Restart dev server after changing `.env.local`

### "User not found" 
- User doesn't exist in Firebase
- Check correct collection (tutors/parents/admins)
- Email is case-sensitive

### "Permission denied"
- Check Firestore Security Rules
- For testing, use test mode rules

## 📚 Using Firebase Services in Components

```typescript
// Import the service
import { getAllTutors, getTutorByEmail } from '@/firebase/tutors'
import { addBooking, getBookingsByParentEmail } from '@/firebase/bookings'

// In your component
const fetchTutors = async () => {
  const tutors = await getAllTutors()
  console.log(tutors)
}

const createBooking = async () => {
  const bookingId = await addBooking({
    parentEmail: 'parent@example.com',
    tutorEmail: 'tutor@example.com',
    subject: 'Math',
    status: 'pending'
  })
}
```

## 🎯 Next Steps

1. ✅ Add Firebase credentials to `.env.local`
2. ✅ Restart dev server
3. ✅ Test signup and login
4. Update other components to use Firebase services
5. Add proper error handling
6. Implement password hashing for production
7. Set up Firestore security rules

---

**Need Help?** Check `SETUP_INSTRUCTIONS.md` for detailed setup guide.
