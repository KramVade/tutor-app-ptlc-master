"use client"

import { useState } from "react"
import { AirbnbButton } from "../ui/airbnb-button"
import { AirbnbDrawer } from "../ui/airbnb-drawer"

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    subjects: string[]
    priceRange: [number, number]
    rating: number
    availability: string[]
  }
  onApply: (filters: any) => void
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Spanish",
  "French",
  "History",
  "Computer Science",
  "Music",
]

const availabilityOptions = ["Morning (8AM-12PM)", "Afternoon (12PM-5PM)", "Evening (5PM-9PM)", "Weekends"]

export function FilterPanel({ isOpen, onClose, filters, onApply }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleSubjectToggle = (subject: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleAvailabilityToggle = (option: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter((a) => a !== option)
        : [...prev.availability, option],
    }))
  }

  const handleClear = () => {
    setLocalFilters({
      subjects: [],
      priceRange: [0, 200],
      rating: 0,
      availability: [],
    })
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  return (
    <AirbnbDrawer isOpen={isOpen} onClose={onClose} title="Filters" position="right">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Subjects */}
          <div>
            <h3 className="font-semibold mb-4">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    localFilters.subjects.includes(subject)
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-4">Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Min</label>
                <input
                  type="number"
                  value={localFilters.priceRange[0]}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      priceRange: [Number(e.target.value), prev.priceRange[1]],
                    }))
                  }
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background mt-1"
                />
              </div>
              <span className="text-muted-foreground mt-6">—</span>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Max</label>
                <input
                  type="number"
                  value={localFilters.priceRange[1]}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)],
                    }))
                  }
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background mt-1"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold mb-4">Minimum Rating</h3>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, rating }))}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    localFilters.rating === rating
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {rating === 0 ? "Any" : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="font-semibold mb-4">Availability</h3>
            <div className="space-y-2">
              {availabilityOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.availability.includes(option)}
                    onChange={() => handleAvailabilityToggle(option)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button onClick={handleClear} className="text-sm font-semibold underline">
            Clear all
          </button>
          <AirbnbButton onClick={handleApply}>Show results</AirbnbButton>
        </div>
      </div>
    </AirbnbDrawer>
  )
}
