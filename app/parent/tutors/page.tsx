"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { PageLayout } from "@/components/layout/page-layout"
import { TutorCard } from "@/components/tutor/tutor-card"
import { FilterPanel } from "@/components/tutor/filter-panel"
import { TutorCardSkeleton } from "@/components/ui/skeleton"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbInput } from "@/components/ui/airbnb-input"
import { Search, SlidersHorizontal } from "lucide-react"

export default function TutorsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tutors, setTutors] = useState<any[]>([])
  const [filters, setFilters] = useState({
    subjects: [] as string[],
    priceRange: [0, 200] as [number, number],
    rating: 0,
    availability: [] as string[],
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "parent")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadTutors()
    }
  }, [user])

  const loadTutors = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Loading tutors from Firebase...')
      
      const { getAllTutors } = await import("@/firebase/tutors")
      const tutorsData = await getAllTutors()
      
      console.log('✅ Loaded tutors:', tutorsData.length)
      setTutors(tutorsData)
    } catch (error) {
      console.error('❌ Error loading tutors:', error)
      setTutors([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(search.toLowerCase()) ||
      tutor.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      tutor.bio.toLowerCase().includes(search.toLowerCase())

    const matchesSubjects = filters.subjects.length === 0 || filters.subjects.some((s) => tutor.subjects.includes(s))

    const matchesPrice = tutor.hourlyRate >= filters.priceRange[0] && tutor.hourlyRate <= filters.priceRange[1]

    const matchesRating = tutor.rating >= filters.rating

    return matchesSearch && matchesSubjects && matchesPrice && matchesRating
  })

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Find a Tutor</h1>
          <p className="text-muted-foreground mt-1">
            Browse our network of verified tutors and find the perfect match for your child.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <AirbnbInput
                placeholder="Search by subject, name, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>
            <AirbnbButton
              variant="outline"
              onClick={() => setShowFilters(true)}
              leftIcon={<SlidersHorizontal className="h-5 w-5" />}
            >
              Filters
              {(filters.subjects.length > 0 || filters.rating > 0) && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {filters.subjects.length + (filters.rating > 0 ? 1 : 0)}
                </span>
              )}
            </AirbnbButton>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""} found
        </p>

        {/* Tutor Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <TutorCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tutors found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters to find more tutors.</p>
            <AirbnbButton
              variant="outline"
              onClick={() => {
                setSearch("")
                setFilters({
                  subjects: [],
                  priceRange: [0, 200],
                  rating: 0,
                  availability: [],
                })
              }}
            >
              Clear Filters
            </AirbnbButton>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} onApply={setFilters} />
    </PageLayout>
  )
}
