"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/context/auth-context"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbInput } from "@/components/ui/airbnb-input"
import { GraduationCap, Mail, Lock, User, Users, BookOpen, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "parent")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      await signup({ name, email, password, role })
      router.push(`/${role}/dashboard`)
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const roles = [
    {
      value: "parent" as UserRole,
      label: "Parent",
      icon: Users,
      description: "Find and book tutors for your children",
      features: ["Browse verified tutors", "Book sessions easily", "Track progress"],
    },
    {
      value: "tutor" as UserRole,
      label: "Tutor",
      icon: BookOpen,
      description: "Share your knowledge and earn",
      features: ["Set your own rates", "Flexible schedule", "Grow your business"],
    },
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

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Join thousands of families and tutors on PTLC Digital Coach</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">I want to...</label>
              <div className="space-y-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      role === r.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          role === r.value ? "bg-primary text-primary-foreground" : "bg-secondary",
                        )}
                      >
                        <r.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{r.label}</p>
                        <p className="text-sm text-muted-foreground">{r.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.features.map((f, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-success" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AirbnbInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="h-5 w-5" />}
            />

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
              Create Account
            </AirbnbButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div 
        className="hidden lg:block lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')"
        }}
      >
        {/* White-Pinkish Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-pink-50/80 to-rose-50/75" />
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-2xl mb-6">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Start your learning journey today</h2>
            <p className="text-lg text-muted-foreground">
              Whether you're a parent looking for tutors or an educator wanting to share your knowledge, PTLC Digital Coach has
              you covered.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
