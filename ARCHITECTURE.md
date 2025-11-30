# System Architecture - Firebase Integration

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  Login Page          Signup Page         Dashboard Pages        │
│  /login              /signup             /parent/dashboard      │
│                                          /tutor/dashboard       │
│                                          /admin/dashboard       │
└────────────┬────────────────┬────────────────────┬─────────────┘
             │                │                    │
             ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│              lib/context/auth-context.tsx                       │
│  • login()    • signup()    • logout()    • updateUser()       │
└────────────┬────────────────┬────────────────────┬─────────────┘
             │                │                    │
             ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  tutors.js    parents.js    admin.js    bookings.js            │
│  children.js  payments.js   earnings.js                         │
└────────────┬────────────────┬────────────────────┬─────────────┘
             │                │                    │
             ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE CONFIGURATION                       │
├─────────────────────────────────────────────────────────────────┤
│                    firebase/config.js                           │
│  • Initializes Firebase App                                    │
│  • Exports Firestore (db)                                      │
│  • Exports Auth (auth)                                         │
└────────────┬────────────────┬────────────────────┬─────────────┘
             │                │                    │
             ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD                               │
├─────────────────────────────────────────────────────────────────┤
│  Firestore Database:                                            │
│  • tutors collection                                            │
│  • parents collection                                           │
│  • admins collection                                            │
│  • bookings collection                                          │
│  • children collection                                          │
│  • payments collection                                          │
│  • earnings collection                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Login Flow

```
┌──────────┐
│  User    │
│  enters  │
│  email   │
│ password │
│   role   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│  Login Page         │
│  app/login/page.tsx │
└────┬────────────────┘
     │ handleSubmit()
     ▼
┌──────────────────────────┐
│  Auth Context            │
│  auth-context.tsx        │
│  login(email, pwd, role) │
└────┬─────────────────────┘
     │
     ├─── role === "tutor" ──────┐
     │                           ▼
     │                    ┌──────────────────┐
     │                    │ getTutorByEmail()│
     │                    │ firebase/tutors  │
     │                    └────┬─────────────┘
     │                         │
     ├─── role === "parent" ────┤
     │                           ▼
     │                    ┌──────────────────┐
     │                    │getParentByEmail()│
     │                    │ firebase/parents │
     │                    └────┬─────────────┘
     │                         │
     └─── role === "admin" ─────┤
                                ▼
                         ┌──────────────────┐
                         │ getAdminByEmail()│
                         │  firebase/admin  │
                         └────┬─────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Query Firestore DB  │
                    │  WHERE email == ?    │
                    └────┬─────────────────┘
                         │
                    ┌────┴────┐
                    │         │
              User Found   User Not Found
                    │         │
                    ▼         ▼
            ┌──────────┐  ┌──────────────┐
            │ Verify   │  │ Throw Error  │
            │ Password │  │"User not     │
            │          │  │ found"       │
            └────┬─────┘  └──────────────┘
                 │
            ┌────┴────┐
            │         │
        Match    No Match
            │         │
            ▼         ▼
    ┌──────────┐  ┌──────────────┐
    │ Create   │  │ Throw Error  │
    │ Session  │  │"Invalid      │
    │ Store in │  │ password"    │
    │localStorage│ └──────────────┘
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ Redirect │
    │    to    │
    │Dashboard │
    └──────────┘
```

### Signup Flow

```
┌──────────┐
│  User    │
│  enters  │
│   name   │
│  email   │
│ password │
│   role   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│  Signup Page        │
│  app/signup/page.tsx│
└────┬────────────────┘
     │ handleSubmit()
     ▼
┌──────────────────────────┐
│  Auth Context            │
│  auth-context.tsx        │
│  signup(data)            │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Check if user exists    │
│  getTutorByEmail() or    │
│  getParentByEmail()      │
└────┬─────────────────────┘
     │
┌────┴────┐
│         │
Exists  Not Exists
│         │
▼         ▼
┌──────────────┐  ┌──────────────────┐
│ Throw Error  │  │ Create User      │
│"User already │  │ addTutor() or    │
│ exists"      │  │ addParent()      │
└──────────────┘  └────┬─────────────┘
                       │
                       ▼
                ┌──────────────────┐
                │ Add to Firestore │
                │ with default     │
                │ values           │
                └────┬─────────────┘
                     │
                     ▼
                ┌──────────────────┐
                │ Return new       │
                │ user ID          │
                └────┬─────────────┘
                     │
                     ▼
                ┌──────────────────┐
                │ Create Session   │
                │ Store in         │
                │ localStorage     │
                └────┬─────────────┘
                     │
                     ▼
                ┌──────────────────┐
                │ Redirect to      │
                │ Dashboard        │
                └──────────────────┘
```

## Data Flow

### Reading Data

```
Component
   │
   │ import { getAllTutors } from '@/firebase/tutors'
   │
   ▼
Firebase Service (tutors.js)
   │
   │ collection(db, 'tutors')
   │ getDocs(tutorsRef)
   │
   ▼
Firebase Config (config.js)
   │
   │ db = getFirestore(app)
   │
   ▼
Firestore Database
   │
   │ Returns documents
   │
   ▼
Firebase Service
   │
   │ Maps docs to objects
   │ { id: doc.id, ...doc.data() }
   │
   ▼
Component
   │
   │ setState(data)
   │ Render UI
```

### Writing Data

```
Component
   │
   │ import { addTutor } from '@/firebase/tutors'
   │ addTutor({ name, email, ... })
   │
   ▼
Firebase Service (tutors.js)
   │
   │ collection(db, 'tutors')
   │ addDoc(tutorsRef, data)
   │
   ▼
Firebase Config (config.js)
   │
   │ db = getFirestore(app)
   │
   ▼
Firestore Database
   │
   │ Creates document
   │ Returns document ID
   │
   ▼
Firebase Service
   │
   │ return docRef.id
   │
   ▼
Component
   │
   │ Handle success
   │ Update UI
```

## File Dependencies

```
app/login/page.tsx
    └── lib/context/auth-context.tsx
            ├── firebase/tutors.js
            │       └── firebase/config.js
            ├── firebase/parents.js
            │       └── firebase/config.js
            └── firebase/admin.js
                    └── firebase/config.js

app/signup/page.tsx
    └── lib/context/auth-context.tsx
            ├── firebase/tutors.js
            │       └── firebase/config.js
            └── firebase/parents.js
                    └── firebase/config.js

firebase/config.js
    └── .env.local (environment variables)
```

## Environment Configuration

```
.env.local
    │
    ├── NEXT_PUBLIC_FIREBASE_API_KEY
    ├── NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    ├── NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ├── NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    ├── NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    └── NEXT_PUBLIC_FIREBASE_APP_ID
         │
         ▼
firebase/config.js
    │
    │ const firebaseConfig = {
    │   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    │   ...
    │ }
    │
    ▼
Firebase App Initialized
    │
    ├── Firestore (db)
    └── Auth (auth)
```

## Collections Structure

```
Firestore Database
│
├── tutors/
│   ├── {tutorId1}/
│   │   ├── name: string
│   │   ├── email: string
│   │   ├── password: string
│   │   ├── subjects: array
│   │   ├── bio: string
│   │   ├── hourlyRate: number
│   │   ├── rating: number
│   │   ├── available: boolean
│   │   └── createdAt: timestamp
│   └── {tutorId2}/
│       └── ...
│
├── parents/
│   ├── {parentId1}/
│   │   ├── name: string
│   │   ├── email: string
│   │   ├── password: string
│   │   ├── phone: string
│   │   ├── children: array
│   │   └── createdAt: timestamp
│   └── {parentId2}/
│       └── ...
│
├── admins/
│   └── {adminId}/
│       ├── name: string
│       ├── email: string
│       ├── password: string
│       ├── role: "admin"
│       └── createdAt: timestamp
│
├── bookings/
│   └── {bookingId}/
│       ├── parentEmail: string
│       ├── tutorEmail: string
│       ├── subject: string
│       ├── status: string
│       └── createdAt: timestamp
│
├── children/
│   └── {childId}/
│       ├── name: string
│       ├── age: number
│       ├── grade: string
│       └── parentId: string
│
├── payments/
│   └── {paymentId}/
│       ├── amount: number
│       ├── bookingId: string
│       ├── status: string
│       └── createdAt: timestamp
│
└── earnings/
    └── {earningId}/
        ├── tutorEmail: string
        ├── amount: number
        └── createdAt: timestamp
```

## Security Flow

```
Request
   │
   ▼
Firestore Security Rules
   │
   ├── Check authentication
   ├── Check permissions
   └── Check data validation
       │
       ├── Allow ──────► Execute Request
       │
       └── Deny ───────► Return Error
```

## Session Management

```
Login Success
   │
   ▼
Create User Object
   │
   ▼
localStorage.setItem('ptlcDigitalCoach_user', JSON.stringify(user))
   │
   ▼
setUser(user) in Auth Context
   │
   ▼
User State Updated
   │
   ▼
Components Re-render
   │
   ▼
Dashboard Displayed

───────────────────────

Page Refresh
   │
   ▼
useEffect() runs
   │
   ▼
localStorage.getItem('ptlcDigitalCoach_user')
   │
   ├── Found ──────► Parse & setUser()
   │                      │
   │                      ▼
   │                 User Restored
   │
   └── Not Found ──► User stays null
                          │
                          ▼
                     Show Login
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Reusable Firebase services
- ✅ Type-safe authentication
- ✅ Centralized configuration
- ✅ Scalable structure
