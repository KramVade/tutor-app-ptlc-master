"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { GraduationCap, Search, Calendar, MessageCircle, Star, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/${user.role}/dashboard`)
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
              Find the perfect tutor for your child
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground text-pretty">
              Connect with qualified, verified tutors who can help your child excel in any subject. Personalized
              learning, flexible scheduling, and guaranteed results.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <AirbnbButton size="xl">Get Started</AirbnbButton>
              </Link>
              <Link href="/login">
                <AirbnbButton variant="outline" size="xl">
                  Sign In
                </AirbnbButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mb-8 relative z-10">
          <div className="bg-card rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.12)] p-4 md:p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City or ZIP"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-end">
                <Link href="/signup" className="w-full">
                  <AirbnbButton className="w-full" size="lg" leftIcon={<Search className="h-5 w-5" />}>
                    Search
                  </AirbnbButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Why parents choose PTLC Digital Coach</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              We make it easy to find, book, and manage tutoring sessions for your children.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Verified Tutors",
                description: "All tutors undergo background checks and credential verification for your peace of mind.",
              },
              {
                icon: <Calendar className="h-8 w-8 text-primary" />,
                title: "Flexible Scheduling",
                description: "Book sessions that fit your schedule. Reschedule or cancel with ease.",
              },
              {
                icon: <Star className="h-8 w-8 text-primary" />,
                title: "Quality Guaranteed",
                description: "Read reviews from other parents and find tutors with proven track records.",
              },
              {
                icon: <MessageCircle className="h-8 w-8 text-primary" />,
                title: "Direct Communication",
                description: "Message tutors directly to discuss your child's needs before booking.",
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Progress Tracking",
                description: "Monitor your child's progress with session notes and performance insights.",
              },
              {
                icon: <GraduationCap className="h-8 w-8 text-primary" />,
                title: "Expert Tutors",
                description: "Access tutors with advanced degrees and years of teaching experience.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to help your child succeed?</h2>
          <p className="mt-4 text-lg text-background/70 max-w-2xl mx-auto text-pretty">
            Join thousands of parents who have found the perfect tutors for their children.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=parent">
              <AirbnbButton size="xl" className="bg-background text-foreground hover:bg-background/90">
                Sign Up as Parent
              </AirbnbButton>
            </Link>
            <Link href="/signup?role=tutor">
              <AirbnbButton
                size="xl"
                variant="outline"
                className="border-background text-background hover:bg-background hover:text-foreground"
              >
                Become a Tutor
              </AirbnbButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PTLC Digital Coach</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 PTLC Digital Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </PageLayout>
  )
}
