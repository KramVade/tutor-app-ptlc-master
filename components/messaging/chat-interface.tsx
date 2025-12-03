"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { AirbnbButton } from "../ui/airbnb-button"
import { cn } from "@/lib/utils"
import { Send, Paperclip, ImageIcon } from "lucide-react"
import type { Message, Conversation } from "@/firebase/messages"

interface ChatInterfaceProps {
  conversationId: string
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      loadConversation()
      loadMessages()
    }
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Scroll to bottom immediately on mount and when loading completes
    if (!isLoading && messages.length > 0) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [isLoading])

  const loadConversation = async () => {
    try {
      const { getConversationsByUserId } = await import("@/firebase/messages")
      const conversations = await getConversationsByUserId(user!.id)
      const conv = conversations.find(c => c.id === conversationId)
      
      if (conv) {
        setConversation(conv)
      } else {
        // If conversation not found in list, it might be newly created
        // Try to fetch it directly or wait for it to appear
        console.log('⏳ Conversation not found in list, it may be newly created')
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const loadMessages = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      console.log('💬 Loading messages from Firebase...')
      
      const { getMessagesByConversationId, markAllMessagesAsRead } = 
        await import("@/firebase/messages")
      
      const data = await getMessagesByConversationId(conversationId, 50)
      console.log('✅ Loaded messages:', data.length)
      setMessages(data)
      
      // Mark messages as read
      await markAllMessagesAsRead(conversationId, user.id)
    } catch (error) {
      console.error('❌ Error loading messages:', error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !conversation) return

    setIsSending(true)
    try {
      console.log('📤 Sending message...')
      
      const { sendMessage } = await import("@/firebase/messages")
      
      // Get other participant
      const otherUserId = conversation.participants.find(id => id !== user.id)
      if (!otherUserId) return
      
      const otherUser = conversation.participantDetails[otherUserId]
      
      await sendMessage({
        conversationId,
        senderId: user.id,
        senderName: user.name,
        senderEmail: user.email,
        senderRole: user.role,
        receiverId: otherUserId,
        receiverName: otherUser.name,
        receiverEmail: otherUser.email,
        text: newMessage,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      
      console.log('✅ Message sent')
      setNewMessage("")
      
      // Reload messages to show new message
      await loadMessages()
    } catch (error: any) {
      console.error('❌ Error sending message:', error)
      
      // Show user-friendly error message with toast
      if (error.message?.includes('Message blocked')) {
        showToast({
          type: "error",
          title: "Message Blocked",
          message: "Your message was blocked due to inappropriate content. Please review our community guidelines.",
        })
      } else {
        showToast({
          type: "error",
          title: "Failed to Send",
          message: "Failed to send message. Please try again.",
        })
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!conversation && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <div className="text-center">
          <p className="mb-2">Loading conversation...</p>
          <p className="text-sm">If this is your first message, the conversation is being created.</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a conversation to start messaging
      </div>
    )
  }

  const otherUserId = conversation.participants.find(id => id !== user?.id)
  const otherUser = otherUserId ? conversation.participantDetails[otherUserId] : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        {otherUser?.avatar ? (
          <img
            src={otherUser.avatar}
            alt={otherUser.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {otherUser?.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold">{otherUser?.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{otherUser?.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] px-4 py-3 rounded-2xl",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={cn("text-xs mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full min-h-[48px] max-h-32 px-4 py-3 pr-24 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
                <Paperclip className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <AirbnbButton 
            onClick={handleSend} 
            size="lg" 
            className="rounded-xl"
            isLoading={isSending}
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </AirbnbButton>
        </div>
      </div>
    </div>
  )
}
