"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/context/auth-context"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbInput } from "@/components/ui/airbnb-input"
import { GraduationCap, Mail, Lock, Users, BookOpen, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("parent")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await login(email, password, role)
      router.push(`/${role}/dashboard`)
    } catch (err) {
      setError("Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  const roles = [
    { value: "parent" as UserRole, label: "Parent", icon: Users, description: "Find tutors for your children" },
    { value: "tutor" as UserRole, label: "Tutor", icon: BookOpen, description: "Manage your tutoring business" },
    { value: "admin" as UserRole, label: "Admin", icon: Shield, description: "Platform administration" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">PTLC Digital Coach</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      role === r.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                  >
                    <r.icon
                      className={cn(
                        "h-6 w-6 mx-auto mb-2",
                        role === r.value ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="text-sm font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <AirbnbInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-5 w-5" />}
            />

            <AirbnbInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <AirbnbButton type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </AirbnbButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div 
        className="hidden lg:block lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop')"
        }}
      >
        {/* White-Pinkish Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-pink-60/80 to-rose-55/75" />
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-2xl mb-6">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Personalized learning for every student</h2>
            <p className="text-lg text-muted-foreground">
              Connect with expert tutors who can help your child reach their full potential.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
