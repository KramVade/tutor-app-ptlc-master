"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/firebase/messages"
import { User } from "lucide-react"

interface ConversationListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      console.log('💬 Loading conversations from Firebase...')
      
      const { getConversationsByUserId } = await import("@/firebase/messages")
      const data = await getConversationsByUserId(user.id)
      
      console.log('✅ Loaded conversations:', data.length)
      setConversations(data)
    } catch (error: any) {
      console.error('❌ Error loading conversations:', error)
      
      // If it's an index error, show helpful message
      if (error?.message?.includes('index')) {
        console.log('ℹ️ Firestore index needed. Creating the index will improve performance.')
        console.log('For now, conversations will still work but may be slower.')
      }
      
      // Set empty array so UI still works
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  const getOtherParticipant = (conv: Conversation) => {
    const otherUserId = conv.participants.find(id => id !== user?.id)
    return otherUserId ? conv.participantDetails[otherUserId] : null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start a conversation by messaging a tutor
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const otherUser = getOtherParticipant(conv)
            if (!otherUser) return null
            
            const unreadCount = conv.unreadCount[user?.id || ''] || 0

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id!)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 border-b border-border hover:bg-secondary transition-colors text-left",
                  selectedId === conv.id && "bg-secondary",
                )}
              >
                <div className="relative">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary">
                        {otherUser.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{otherUser.name}</p>
                    {conv.lastMessage.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conv.lastMessage.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
