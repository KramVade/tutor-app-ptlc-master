"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import {
  mockTutors,
  mockBookings,
  mockChildren,
  mockMessages,
  mockConversations,
  mockReviews,
  mockEarnings,
  mockTransactions,
  mockReports,
} from "@/lib/mock-data"

interface DataContextType {
  tutors: typeof mockTutors
  bookings: typeof mockBookings
  children: typeof mockChildren
  messages: typeof mockMessages
  conversations: typeof mockConversations
  reviews: typeof mockReviews
  earnings: typeof mockEarnings
  transactions: typeof mockTransactions
  reports: typeof mockReports
  addBooking: (booking: any) => void
  updateBooking: (id: string, data: any) => void
  addChild: (child: any) => void
  updateChild: (id: string, data: any) => void
  sendMessage: (conversationId: string, message: any) => void
  updateTutor: (id: string, data: any) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [tutors, setTutors] = useState(mockTutors)
  const [bookings, setBookings] = useState(mockBookings)
  const [childrenData, setChildrenData] = useState(mockChildren)
  const [messages, setMessages] = useState(mockMessages)
  const [conversations] = useState(mockConversations)
  const [reviews] = useState(mockReviews)
  const [earnings] = useState(mockEarnings)
  const [transactions] = useState(mockTransactions)
  const [reports] = useState(mockReports)

  const addBooking = (booking: any) => {
    setBookings((prev) => [...prev, { ...booking, id: `booking_${Date.now()}` }])
  }

  const updateBooking = (id: string, data: any) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)))
  }

  const addChild = (child: any) => {
    setChildrenData((prev) => [...prev, { ...child, id: `child_${Date.now()}` }])
  }

  const updateChild = (id: string, data: any) => {
    setChildrenData((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const sendMessage = (conversationId: string, message: any) => {
    setMessages((prev) => [...prev, { ...message, id: `msg_${Date.now()}`, conversationId }])
  }

  const updateTutor = (id: string, data: any) => {
    setTutors((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
  }

  return (
    <DataContext.Provider
      value={{
        tutors,
        bookings,
        children: childrenData,
        messages,
        conversations,
        reviews,
        earnings,
        transactions,
        reports,
        addBooking,
        updateBooking,
        addChild,
        updateChild,
        sendMessage,
        updateTutor,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
