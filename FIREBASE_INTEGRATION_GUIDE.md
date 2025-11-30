# Firebase Integration Guide - Complete Explanation

## Overview

This project uses Firebase Firestore as a database to store and manage data for tutors, parents, and bookings. Here's a complete explanation of how it works and how to replicate it.

## Architecture

```
React App
    ↓
Firebase Config (src/firebase/config.js)
    ↓
Firebase Services (tutorService.js, parentService.js, bookingService.js)
    ↓
React Components (Signup, Login, Dashboards)
    ↓
Firestore Database (Cloud)
```

## Step-by-Step Setup

### 1. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "tutoring-platform")
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

#### Get Configuration
1. In Firebase Console, click gear icon → Project settings
2. Scroll to "Your apps" section
3. Click web icon (`</>`)
4. Register app with nickname
5. Copy the `firebaseConfig` object

#### Enable Firestore
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location (closest to your users)
5. Click "Enable"

### 2. Install Firebase SDK

```bash
npm install firebase
```

### 3. Firebase Configuration File

**File**: `src/firebase/config.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Authentication (optional)
export const auth = getAuth(app);

export default app;
```

**Key Points:**
- `initializeApp()` - Initializes Firebase with your config
- `getFirestore()` - Gets Firestore database instance
- `getAuth()` - Gets Authentication instance (if using Firebase Auth)
- Export `db` to use in service files

### 4. Firebase Service Files

These files contain functions to interact with Firestore.

#### Example: Tutor Service

**File**: `src/firebase/tutorService.js`

```javascript
import { 
  collection,      // Reference to a collection
  getDocs,         // Get all documents
  addDoc,          // Add new document
  updateDoc,       // Update existing document
  deleteDoc,       // Delete document
  doc,             // Reference to a document
  query,           // Create a query
  where,           // Filter condition
  orderBy          // Sort results
} from 'firebase/firestore';
import { db } from './config';

const TUTORS_COLLECTION = 'tutors';

// GET ALL TUTORS
export const getAllTutors = async () => {
  try {
    // Get reference to 'tutors' collection
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    
    // Get all documents
    const snapshot = await getDocs(tutorsRef);
    
    // Map documents to array of objects
    return snapshot.docs.map(doc => ({
      id: doc.id,           // Document ID
      ...doc.data()         // Document data
    }));
  } catch (error) {
    console.error('Error fetching tutors:', error);
    throw error;
  }
};

// GET TUTOR BY EMAIL
export const getTutorByEmail = async (email) => {
  try {
    // Get reference to collection
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    
    // Create query with filter
    const q = query(tutorsRef, where('email', '==', email));
    
    // Execute query
    const snapshot = await getDocs(q);
    
    // Check if found
    if (snapshot.empty) return null;
    
    // Return first match
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error fetching tutor:', error);
    throw error;
  }
};

// ADD NEW TUTOR
export const addTutor = async (tutorData) => {
  try {
    // Get reference to collection
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    
    // Add document with auto-generated ID
    const docRef = await addDoc(tutorsRef, {
      ...tutorData,
      createdAt: new Date().toISOString()
    });
    
    // Return the new document ID
    return docRef.id;
  } catch (error) {
    console.error('Error adding tutor:', error);
    throw error;
  }
};

// UPDATE TUTOR
export const updateTutor = async (tutorId, tutorData) => {
  try {
    // Get reference to specific document
    const tutorRef = doc(db, TUTORS_COLLECTION, tutorId);
    
    // Update document
    await updateDoc(tutorRef, {
      ...tutorData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating tutor:', error);
    throw error;
  }
};

// DELETE TUTOR
export const deleteTutor = async (tutorId) => {
  try {
    // Get reference to specific document
    const tutorRef = doc(db, TUTORS_COLLECTION, tutorId);
    
    // Delete document
    await deleteDoc(tutorRef);
  } catch (error) {
    console.error('Error deleting tutor:', error);
    throw error;
  }
};

// GET TUTORS BY SUBJECT
export const getTutorsBySubject = async (subject) => {
  try {
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    
    // Query with array-contains for array fields
    const q = query(
      tutorsRef, 
      where('subjects', 'array-contains', subject)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tutors by subject:', error);
    throw error;
  }
};
```

### 5. Using Services in Components

#### Example: Signup Component

```javascript
import { useState } from 'react';
import { addTutor } from '../firebase/tutorService';
import { addParent } from '../firebase/parentService';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'parent'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.role === 'tutor') {
        // Add tutor to Firebase
        const tutorId = await addTutor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          subjects: ['Math'],
          bio: 'New tutor',
          hourlyRate: 30,
          rating: 0,
          available: true
        });
        
        console.log('Tutor created with ID:', tutorId);
      } else if (formData.role === 'parent') {
        // Add parent to Firebase
        const parentId = await addParent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          children: [],
          phone: ''
        });
        
        console.log('Parent created with ID:', parentId);
      }
      
      // Redirect or show success
      alert('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create account');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Example: Dashboard Component

```javascript
import { useState, useEffect } from 'react';
import { getAllTutors } from '../firebase/tutorService';

export default function Dashboard() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const data = await getAllTutors();
        setTutors(data);
      } catch (error) {
        console.error('Error loading tutors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []); // Empty dependency array = run once on mount

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Tutors</h1>
      {tutors.map(tutor => (
        <div key={tutor.id}>
          <h2>{tutor.name}</h2>
          <p>{tutor.email}</p>
        </div>
      ))}
    </div>
  );
}
```

## Firestore Data Structure

### Collections

```
firestore/
├── tutors/
│   ├── {tutorId}/
│   │   ├── name: "John Doe"
│   │   ├── email: "john@example.com"
│   │   ├── password: "hashed_password"
│   │   ├── subjects: ["Math", "Physics"]
│   │   ├── bio: "Experienced tutor..."
│   │   ├── hourlyRate: 35
│   │   ├── rating: 4.8
│   │   ├── available: true
│   │   └── createdAt: "2024-01-15T10:00:00.000Z"
│   └── ...
│
├── parents/
│   ├── {parentId}/
│   │   ├── name: "Jane Parent"
│   │   ├── email: "jane@example.com"
│   │   ├── password: "hashed_password"
│   │   ├── phone: "+1234567890"
│   │   ├── children: [
│   │   │   {
│   │   │     id: "1234567890",
│   │   │     name: "Emily",
│   │   │     age: 12,
│   │   │     grade: "Grade 7"
│   │   │   }
│   │   │ ]
│   │   └── createdAt: "2024-01-15T10:00:00.000Z"
│   └── ...
│
└── bookings/
    ├── {bookingId}/
    │   ├── parentEmail: "jane@example.com"
    │   ├── parentName: "Jane Parent"
    │   ├── tutorEmail: "john@example.com"
    │   ├── tutorName: "John Doe"
    │   ├── childName: "Emily"
    │   ├── childAge: 12
    │   ├── subject: "Mathematics"
    │   ├── status: "pending"
    │   ├── hourlyRate: 35
    │   └── createdAt: "2024-01-15T10:00:00.000Z"
    └── ...
```

## Common Firestore Operations

### 1. Create (Add Document)

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';

// Add with auto-generated ID
const docRef = await addDoc(collection(db, 'users'), {
  name: 'John',
  email: 'john@example.com',
  age: 30
});
console.log('Document ID:', docRef.id);

// Add with custom ID
import { doc, setDoc } from 'firebase/firestore';
await setDoc(doc(db, 'users', 'custom-id'), {
  name: 'John',
  email: 'john@example.com'
});
```

### 2. Read (Get Documents)

```javascript
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Get all documents
const snapshot = await getDocs(collection(db, 'users'));
snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});

// Get single document by ID
const docRef = doc(db, 'users', 'user-id');
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  console.log(docSnap.data());
}

// Query with filter
const q = query(
  collection(db, 'users'),
  where('age', '>', 25),
  where('city', '==', 'New York')
);
const querySnapshot = await getDocs(q);
```

### 3. Update (Modify Document)

```javascript
import { doc, updateDoc } from 'firebase/firestore';

// Update specific fields
const docRef = doc(db, 'users', 'user-id');
await updateDoc(docRef, {
  age: 31,
  city: 'Boston'
});

// Update nested fields
await updateDoc(docRef, {
  'address.city': 'Boston',
  'address.zip': '02101'
});

// Update array
import { arrayUnion, arrayRemove } from 'firebase/firestore';
await updateDoc(docRef, {
  hobbies: arrayUnion('reading'),  // Add to array
  tags: arrayRemove('old-tag')     // Remove from array
});
```

### 4. Delete (Remove Document)

```javascript
import { doc, deleteDoc } from 'firebase/firestore';

const docRef = doc(db, 'users', 'user-id');
await deleteDoc(docRef);
```

### 5. Query Operations

```javascript
import { query, where, orderBy, limit, startAfter } from 'firebase/firestore';

// Filter
const q1 = query(
  collection(db, 'users'),
  where('age', '>=', 18),
  where('age', '<=', 65)
);

// Sort
const q2 = query(
  collection(db, 'users'),
  orderBy('age', 'desc')
);

// Limit results
const q3 = query(
  collection(db, 'users'),
  limit(10)
);

// Pagination
const q4 = query(
  collection(db, 'users'),
  orderBy('name'),
  startAfter(lastDoc),
  limit(10)
);

// Array contains
const q5 = query(
  collection(db, 'tutors'),
  where('subjects', 'array-contains', 'Math')
);

// Multiple conditions
const q6 = query(
  collection(db, 'tutors'),
  where('available', '==', true),
  where('hourlyRate', '<=', 50),
  orderBy('hourlyRate', 'asc')
);
```

## Security Rules

**File**: Firestore Rules (in Firebase Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Tutors collection
    match /tutors/{tutorId} {
      // Anyone can read tutors
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null;
      
      // Only the tutor can update their own profile
      allow update: if request.auth != null && 
        resource.data.email == request.auth.token.email;
      
      // Only admins can delete
      allow delete: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Parents collection
    match /parents/{parentId} {
      // Users can only read their own data
      allow read: if request.auth != null && 
        resource.data.email == request.auth.token.email;
      
      // Anyone can create (signup)
      allow create: if request.auth != null;
      
      // Users can only update their own data
      allow update: if request.auth != null && 
        resource.data.email == request.auth.token.email;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      // Parents and tutors can read their bookings
      allow read: if request.auth != null && 
        (resource.data.parentEmail == request.auth.token.email || 
         resource.data.tutorEmail == request.auth.token.email);
      
      // Parents can create bookings
      allow create: if request.auth != null;
      
      // Parents and tutors can update their bookings
      allow update: if request.auth != null && 
        (resource.data.parentEmail == request.auth.token.email || 
         resource.data.tutorEmail == request.auth.token.email);
    }
  }
}
```

## Error Handling

```javascript
export const getTutors = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'tutors'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    // Log error
    console.error('Error fetching tutors:', error);
    
    // Check error type
    if (error.code === 'permission-denied') {
      console.error('Permission denied');
    } else if (error.code === 'unavailable') {
      console.error('Firebase unavailable');
    }
    
    // Re-throw or return default
    throw error;
    // OR
    // return [];
  }
};
```

## Best Practices

### 1. **Service Layer Pattern**
```
Components → Services → Firebase
```
- Keep Firebase logic in service files
- Components call service functions
- Easy to test and maintain

### 2. **Error Handling**
```javascript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error(error);
  setError('Failed to load data');
} finally {
  setLoading(false);
}
```

### 3. **Loading States**
```javascript
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);
const [error, setError] = useState(null);
```

### 4. **Timestamps**
```javascript
// Always add timestamps
{
  ...data,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

### 5. **Data Validation**
```javascript
// Validate before saving
if (!email || !name) {
  throw new Error('Missing required fields');
}

// Sanitize data
const sanitizedData = {
  name: name.trim(),
  email: email.toLowerCase().trim()
};
```

## Replicating for Another Project

### Step 1: Setup
```bash
# Install Firebase
npm install firebase

# Create config file
touch src/firebase/config.js
```

### Step 2: Configuration
```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Step 3: Create Service
```javascript
// src/firebase/userService.js
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './config';

export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addUser = async (userData) => {
  const docRef = await addDoc(collection(db, 'users'), userData);
  return docRef.id;
};
```

### Step 4: Use in Component
```javascript
import { useState, useEffect } from 'react';
import { getUsers, addUser } from './firebase/userService';

export default function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleAddUser = async (userData) => {
    await addUser(userData);
    // Refresh list
    const data = await getUsers();
    setUsers(data);
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Summary

### Key Concepts:
1. **Config** - Initialize Firebase with your credentials
2. **Services** - Create functions to interact with Firestore
3. **Collections** - Organize data into collections (like tables)
4. **Documents** - Individual records in collections
5. **Queries** - Filter and sort data
6. **Security Rules** - Control access to data

### File Structure:
```
src/
├── firebase/
│   ├── config.js           # Firebase initialization
│   ├── userService.js      # User CRUD operations
│   ├── productService.js   # Product CRUD operations
│   └── orderService.js     # Order CRUD operations
├── components/
│   └── Dashboard.jsx       # Uses services
└── App.jsx
```

### Common Pattern:
```javascript
// 1. Import service
import { getItems, addItem } from './firebase/itemService';

// 2. State management
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

// 3. Fetch on mount
useEffect(() => {
  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchItems();
}, []);

// 4. CRUD operations
const handleAdd = async (newItem) => {
  await addItem(newItem);
  // Refresh list
};
```

---

This is the complete Firebase integration pattern used in this project! 🔥
