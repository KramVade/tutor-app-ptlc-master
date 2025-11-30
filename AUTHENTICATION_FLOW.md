# Authentication Flow Documentation

## Overview

This document explains how authentication now works with Firebase integration.

## Login Flow

```
User enters credentials → auth-context.tsx → Firebase Service → Firestore Database
                                                                        ↓
User redirected to dashboard ← User stored in localStorage ← User verified
```

### Step-by-Step Login Process

1. **User submits login form** (`app/login/page.tsx`)
   - Email, password, and role (parent/tutor/admin)

2. **Auth context receives request** (`lib/context/auth-context.tsx`)
   - Calls appropriate Firebase service based on role

3. **Firebase service queries database**
   - `getTutorByEmail()` for tutors
   - `getParentByEmail()` for parents
   - `getAdminByEmail()` for admins

4. **Database returns user data**
   - If user not found → Error: "User not found"
   - If found → Continue to password verification

5. **Password verification**
   - Compare entered password with stored password
   - If mismatch → Error: "Invalid password"
   - If match → Continue to authentication

6. **User authenticated**
   - Create User object
   - Store in localStorage
   - Update auth context state
   - Redirect to dashboard

## Signup Flow

```
User fills signup form → auth-context.tsx → Check if exists → Create in Firebase
                                                                      ↓
User redirected to dashboard ← User stored in localStorage ← User created
```

### Step-by-Step Signup Process

1. **User submits signup form** (`app/signup/page.tsx`)
   - Name, email, password, and role

2. **Auth context receives request** (`lib/context/auth-context.tsx`)
   - Validates input
   - Checks if user already exists

3. **Check for existing user**
   - Query Firebase for email
   - If exists → Error: "User already exists"
   - If not exists → Continue to creation

4. **Create user in Firebase**
   - `addTutor()` for tutors (with default tutor fields)
   - `addParent()` for parents (with empty children array)
   - Returns new user ID

5. **User created successfully**
   - Create User object
   - Store in localStorage
   - Update auth context state
   - Redirect to dashboard

## Code Examples

### Login Implementation

```typescript
// lib/context/auth-context.tsx
const login = async (email: string, password: string, role: UserRole) => {
  setIsLoading(true)
  
  try {
    let userData: any = null

    // Query Firebase based on role
    if (role === "tutor") {
      userData = await getTutorByEmail(email)
    } else if (role === "parent") {
      userData = await getParentByEmail(email)
    } else if (role === "admin") {
      userData = await getAdminByEmail(email)
    }

    // Check if user exists
    if (!userData) {
      throw new Error("User not found")
    }

    // Verify password
    if (userData.password !== password) {
      throw new Error("Invalid password")
    }

    // Create authenticated user
    const authenticatedUser: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role,
      avatar: userData.avatar || `/placeholder.svg`,
      phone: userData.phone || "",
      createdAt: userData.createdAt,
    }

    // Store and set user
    localStorage.setItem("ptlcDigitalCoach_user", JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  } catch (error) {
    throw error
  } finally {
    setIsLoading(false)
  }
}
```

### Signup Implementation

```typescript
// lib/context/auth-context.tsx
const signup = async (data: SignupData) => {
  setIsLoading(true)
  
  try {
    // Check if user already exists
    let existingUser = null
    if (data.role === "tutor") {
      existingUser = await getTutorByEmail(data.email)
    } else if (data.role === "parent") {
      existingUser = await getParentByEmail(data.email)
    }

    if (existingUser) {
      throw new Error("User already exists")
    }

    // Create new user in Firebase
    let userId = ""
    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: "",
      createdAt: new Date().toISOString(),
    }

    if (data.role === "tutor") {
      userId = await addTutor({
        ...userData,
        subjects: [],
        bio: "",
        hourlyRate: 0,
        rating: 0,
        available: true,
        avatar: "",
      })
    } else if (data.role === "parent") {
      userId = await addParent({
        ...userData,
        children: [],
      })
    }

    // Create user object
    const newUser: User = {
      id: userId,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: `/placeholder.svg`,
      createdAt: new Date().toISOString(),
    }

    // Store and set user
    localStorage.setItem("ptlcDigitalCoach_user", JSON.stringify(newUser))
    setUser(newUser)
  } catch (error) {
    throw error
  } finally {
    setIsLoading(false)
  }
}
```

## Firebase Service Functions

### Get User by Email

```javascript
// firebase/tutors.js
export const getTutorByEmail = async (email) => {
  try {
    const tutorsRef = collection(db, 'tutors')
    const q = query(tutorsRef, where('email', '==', email))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    }
  } catch (error) {
    console.error('Error fetching tutor by email:', error)
    throw error
  }
}
```

### Add New User

```javascript
// firebase/tutors.js
export const addTutor = async (tutorData) => {
  try {
    const tutorsRef = collection(db, 'tutors')
    const docRef = await addDoc(tutorsRef, {
      ...tutorData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error adding tutor:', error)
    throw error
  }
}
```

## Error Handling

### Login Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "User not found" | Email doesn't exist in database | Check email or sign up |
| "Invalid password" | Password doesn't match | Check password |
| Firebase error | Connection/config issue | Check Firebase setup |

### Signup Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "User already exists" | Email already registered | Use different email or log in |
| "Please fill in all fields" | Missing required fields | Complete all fields |
| "Password must be at least 6 characters" | Password too short | Use longer password |
| Firebase error | Connection/config issue | Check Firebase setup |

## Security Considerations

### Current Implementation (Development)

```javascript
// ⚠️ NOT SECURE - Plain text password storage
if (userData.password !== password) {
  throw new Error("Invalid password")
}
```

### Production Implementation (Recommended)

```javascript
// ✅ SECURE - Use Firebase Authentication
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './config'

const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}
```

Or with password hashing:

```javascript
// ✅ SECURE - Hash passwords with bcrypt
import bcrypt from 'bcryptjs'

// On signup
const hashedPassword = await bcrypt.hash(password, 10)
await addUser({ ...userData, password: hashedPassword })

// On login
const isValid = await bcrypt.compare(password, userData.password)
if (!isValid) throw new Error("Invalid password")
```

## Testing Authentication

### Test Login

```typescript
// In browser console or test file
const testLogin = async () => {
  try {
    await login('test@example.com', 'password123', 'parent')
    console.log('Login successful!')
  } catch (error) {
    console.error('Login failed:', error.message)
  }
}
```

### Test Signup

```typescript
const testSignup = async () => {
  try {
    await signup({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'parent'
    })
    console.log('Signup successful!')
  } catch (error) {
    console.error('Signup failed:', error.message)
  }
}
```

## Logout Flow

```
User clicks logout → Clear localStorage → Clear auth state → Redirect to home
```

```typescript
const logout = () => {
  localStorage.removeItem("ptlcDigitalCoach_user")
  setUser(null)
}
```

## Session Persistence

Users remain logged in across page refreshes:

```typescript
useEffect(() => {
  const stored = localStorage.getItem("ptlcDigitalCoach_user")
  if (stored) {
    setUser(JSON.parse(stored))
  }
  setIsLoading(false)
}, [])
```

## Role-Based Access

Different roles have different dashboards:

- **Parent** → `/parent/dashboard`
- **Tutor** → `/tutor/dashboard`
- **Admin** → `/admin/dashboard`

```typescript
// After successful login
router.push(`/${role}/dashboard`)
```

---

**Summary:** Authentication now requires users to exist in your Firebase database. No more mock logins - only real, verified users can access the system!
