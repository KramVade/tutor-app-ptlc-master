"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "parent" | "tutor" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

interface SignupData {
  email: string
  password: string
  name: string
  role: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem("ptlcDigitalCoach_user")
      if (stored) {
        const storedUser = JSON.parse(stored)
        
        // If admin, verify Firebase Auth session
        if (storedUser.role === 'admin') {
          try {
            const { auth } = await import("@/firebase/config")
            const { onAuthStateChanged } = await import("firebase/auth")
            
            onAuthStateChanged(auth, (firebaseUser) => {
              if (firebaseUser && firebaseUser.email === storedUser.email) {
                console.log('✅ Admin session restored from Firebase Auth')
                setUser(storedUser)
              } else {
                console.log('⚠️  No valid Firebase Auth session, clearing admin')
                localStorage.removeItem("ptlcDigitalCoach_user")
                setUser(null)
              }
              setIsLoading(false)
            })
            return // Don't set isLoading false here, wait for onAuthStateChanged
          } catch (error) {
            console.error('Error checking Firebase Auth:', error)
          }
        } else {
          setUser(storedUser)
        }
      }
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    
    try {
      console.log('🔥 Starting login for:', email, 'as', role)
      
      // For admin, use Firebase Authentication
      if (role === "admin") {
        console.log('🔐 Using Firebase Authentication for admin...')
        const { auth } = await import("@/firebase/config")
        const { signInWithEmailAndPassword } = await import("firebase/auth")
        const { getAdminByEmail } = await import("@/firebase/admin")
        
        try {
          // Authenticate with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          console.log('✅ Firebase Authentication successful')
          
          // Get admin data from Firestore (optional, for additional info)
          let adminData = await getAdminByEmail(email)
          
          // If admin doesn't exist in Firestore, create basic profile
          if (!adminData) {
            console.log('⚠️  Admin not in Firestore, using Firebase Auth data')
            adminData = {
              id: userCredential.user.uid,
              email: userCredential.user.email || email,
              name: userCredential.user.displayName || 'Admin User',
              role: 'admin',
              createdAt: new Date().toISOString()
            }
          }
          
          const authenticatedUser: User = {
            id: userCredential.user.uid,
            email: userCredential.user.email || email,
            name: adminData.name || userCredential.user.displayName || 'Admin User',
            role: 'admin',
            avatar: userCredential.user.photoURL || `/placeholder.svg?height=100&width=100&query=admin avatar`,
            phone: adminData.phone || "",
            createdAt: adminData.createdAt || new Date().toISOString(),
          }
          
          console.log('💾 Saving admin session...')
          localStorage.setItem("ptlcDigitalCoach_user", JSON.stringify(authenticatedUser))
          setUser(authenticatedUser)
          console.log('✅ Admin login complete!')
          setIsLoading(false)
          return
        } catch (authError: any) {
          console.error('❌ Firebase Authentication error:', authError.message)
          setIsLoading(false)
          throw new Error(authError.message || "Invalid credentials")
        }
      }
      
      // For tutors and parents, use Firestore authentication
      let userData: any = null

      // Dynamically import Firebase services
      const { getTutorByEmail } = await import("@/firebase/tutors")
      const { getParentByEmail } = await import("@/firebase/parents")

      console.log('✅ Firebase services imported')

      // Query Firebase based on role
      if (role === "tutor") {
        console.log('🔍 Searching for tutor...')
        userData = await getTutorByEmail(email)
      } else if (role === "parent") {
        console.log('🔍 Searching for parent...')
        userData = await getParentByEmail(email)
      }

      // Check if user exists
      if (!userData) {
        console.log('❌ User not found in database')
        setIsLoading(false)
        throw new Error("User not found")
      }

      console.log('✅ User found:', userData.name)

      // Verify password (Note: In production, use proper password hashing)
      if (userData.password !== password) {
        console.log('❌ Invalid password')
        setIsLoading(false)
        throw new Error("Invalid password")
      }

      console.log('✅ Password verified')

      // Create user object
      const authenticatedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role,
        avatar: userData.avatar || `/placeholder.svg?height=100&width=100&query=${role} avatar`,
        phone: userData.phone || "",
        createdAt: userData.createdAt,
      }

      console.log('💾 Saving session...')
      localStorage.setItem("ptlcDigitalCoach_user", JSON.stringify(authenticatedUser))
      setUser(authenticatedUser)
      console.log('✅ Login complete!')
      setIsLoading(false)
    } catch (error) {
      console.error('❌ Login error:', error)
      setIsLoading(false)
      throw error
    }
  }

  const signup = async (data: SignupData) => {
    setIsLoading(true)
    
    try {
      console.log('🔥 Starting signup process for:', data.email, 'as', data.role)
      
      // Dynamically import Firebase services
      const { getTutorByEmail, addTutor } = await import("@/firebase/tutors")
      const { getParentByEmail, addParent } = await import("@/firebase/parents")

      console.log('✅ Firebase services imported')
      console.log('getTutorByEmail:', typeof getTutorByEmail)
      console.log('addTutor:', typeof addTutor)

      // Check if user already exists
      let existingUser = null
      if (data.role === "tutor") {
        console.log('🔍 Checking if tutor exists...')
        existingUser = await getTutorByEmail(data.email)
      } else if (data.role === "parent") {
        console.log('🔍 Checking if parent exists...')
        existingUser = await getParentByEmail(data.email)
      }

      if (existingUser) {
        console.log('❌ User already exists')
        setIsLoading(false)
        throw new Error("User already exists")
      }

      console.log('✅ User does not exist, creating new user...')

      // Create new user in Firebase
      let userId = ""
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password, // Note: In production, hash passwords before storing
        phone: "",
        createdAt: new Date().toISOString(),
      }

      if (data.role === "tutor") {
        console.log('📝 Creating tutor in Firebase...')
        userId = await addTutor({
          ...userData,
          subjects: [],
          bio: "",
          hourlyRate: 0,
          rating: 0,
          available: true,
          avatar: "",
        })
        console.log('✅ Tutor created with ID:', userId)
      } else if (data.role === "parent") {
        console.log('📝 Creating parent in Firebase...')
        userId = await addParent({
          ...userData,
          children: [],
        })
        console.log('✅ Parent created with ID:', userId)
      }

      // Create user object
      const newUser: User = {
        id: userId,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: `/placeholder.svg?height=100&width=100&query=${data.role} avatar`,
        createdAt: new Date().toISOString(),
      }

      console.log('💾 Saving user to localStorage...')
      localStorage.setItem("ptlcDigitalCoach_user", JSON.stringify(newUser))
      setUser(newUser)
      console.log('✅ Signup complete!')
      setIsLoading(false)
    } catch (error) {
      console.error('❌ Signup error:', error)
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    // If admin, sign out from Firebase Auth
    if (user?.role === 'admin') {
      try {
        const { auth } = await import("@/firebase/config")
        const { signOut } = await import("firebase/auth")
        await signOut(auth)
        console.log('✅ Signed out from Firebase Auth')
      } catch (error) {
        console.error('Error signing out from Firebase Auth:', error)
      }
    }
    
    localStorage.removeItem("ptlcDigitalCoach_user")
    setUser(null)
  }

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      try {
        console.log('💾 Updating user in Firebase...')
        
        // Import Firebase services
        const { updateTutor } = await import("@/firebase/tutors")
        const { updateParent } = await import("@/firebase/parents")
        const { updateAdmin } = await import("@/firebase/admin")
        
        // Update in Firebase based on role
        if (user.role === "tutor") {
          await updateTutor(user.id, data)
        } else if (user.role === "parent") {
          await updateParent(user.id, data)
        } else if (user.role === "admin") {
          await updateAdmin(user.id, data)
        }
        
        console.log('✅ User updated in Firebase')
        
        // Update local state
        const updated = { ...user, ...data }
        localStorage.setItem("ptlcDigitalCoach_user", JSON.stringify(updated))
        setUser(updated)
      } catch (error) {
        console.error('❌ Error updating user:', error)
        throw error
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
