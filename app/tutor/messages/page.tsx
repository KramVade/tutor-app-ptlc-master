"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { PageLayout } from "@/components/layout/page-layout"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatInterface } from "@/components/messaging/chat-interface"
import { MessageCircle } from "lucide-react"

export default function TutorMessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-64px-80px)] md:h-[calc(100vh-64px)]">
        <div className="flex h-full border-x border-border">
          <div className={`w-full md:w-80 border-r border-border ${selectedConversation ? "hidden md:block" : ""}`}>
            <ConversationList selectedId={selectedConversation} onSelect={setSelectedConversation} />
          </div>

          <div className={`flex-1 ${!selectedConversation ? "hidden md:flex" : "flex"}`}>
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-4 border-b border-border text-left font-medium"
                >
                  ← Back to conversations
                </button>
                <div className="flex-1">
                  <ChatInterface conversationId={selectedConversation} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
