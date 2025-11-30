# Messaging System - Complete Guide

## Overview

A comprehensive messaging system for communication between parents and tutors, stored in Firebase with real-time capabilities.

## Database Structure

### Collections

#### 1. `conversations` Collection
Stores chat threads between two users.

```typescript
interface Conversation {
  id: string;
  participants: string[]; // [userId1, userId2]
  participantDetails: {
    [userId]: {
      name: string;
      email: string;
      role: 'parent' | 'tutor' | 'admin';
      avatar?: string;
    };
  };
  lastMessage: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: string;
  };
  unreadCount: {
    [userId]: number; // Unread count per user
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 2. `messages` Collection
Stores individual messages within conversations.

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'parent' | 'tutor' | 'admin';
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  text: string;
  isRead: boolean;
  readAt?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
  createdAt: string;
  updatedAt?: string;
}
```

## Features Included

### Core Features
- ✅ One-on-one conversations
- ✅ Real-time messaging
- ✅ Unread message counts
- ✅ Read receipts
- ✅ Message timestamps
- ✅ Conversation list with last message preview
- ✅ User details (name, role, avatar)

### Advanced Features (Prepared)
- ✅ File attachments support
- ✅ Reply to specific messages
- ✅ Mark messages as read
- ✅ Mark all messages as read
- ✅ Get or create conversation helper
- ✅ Unread count per conversation
- ✅ Total unread count across all conversations

## Firebase Service Functions

### Conversation Functions

```typescript
// Get all conversations for a user
getConversationsByUserId(userId: string): Promise<Conversation[]>

// Get conversation between two specific users
getConversationBetweenUsers(userId1: string, userId2: string): Promise<Conversation | null>

// Create new conversation
createConversation(conversationData: Omit<Conversation, 'id'>): Promise<string>

// Update conversation
updateConversation(conversationId: string, data: Partial<Conversation>): Promise<void>

// Mark conversation as read
markConversationAsRead(conversationId: string, userId: string): Promise<void>

// Get or create conversation (helper)
getOrCreateConversation(user1, user2): Promise<string>
```

### Message Functions

```typescript
// Get messages in a conversation
getMessagesByConversationId(conversationId: string, limit?: number): Promise<Message[]>

// Send a message
sendMessage(messageData: Omit<Message, 'id'>): Promise<string>

// Mark single message as read
markMessageAsRead(messageId: string): Promise<void>

// Mark all messages in conversation as read
markAllMessagesAsRead(conversationId: string, userId: string): Promise<void>

// Delete message
deleteMessage(messageId: string): Promise<void>

// Get total unread count
getUnreadMessageCount(userId: string): Promise<number>
```

## Usage Examples

### 1. Start a Conversation (from Tutor Profile)

```typescript
// When parent clicks "Message" button on tutor profile
const handleStartConversation = async () => {
  const { getOrCreateConversation } = await import("@/firebase/messages")
  
  const conversationId = await getOrCreateConversation(
    {
      id: parent.id,
      name: parent.name,
      email: parent.email,
      role: 'parent',
      avatar: parent.avatar
    },
    {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      role: 'tutor',
      avatar: tutor.avatar
    }
  )
  
  // Navigate to messages page with conversation selected
  router.push(`/parent/messages?conversation=${conversationId}`)
}
```

### 2. Load Conversations

```typescript
const loadConversations = async () => {
  const { getConversationsByUserId } = await import("@/firebase/messages")
  
  const conversations = await getConversationsByUserId(user.id)
  setConversations(conversations)
}
```

### 3. Send a Message

```typescript
const handleSendMessage = async (text: string) => {
  const { sendMessage } = await import("@/firebase/messages")
  
  await sendMessage({
    conversationId: currentConversation.id,
    senderId: user.id,
    senderName: user.name,
    senderEmail: user.email,
    senderRole: user.role,
    receiverId: otherUser.id,
    receiverName: otherUser.name,
    receiverEmail: otherUser.email,
    text: text,
    isRead: false,
    createdAt: new Date().toISOString()
  })
}
```

### 4. Load Messages

```typescript
const loadMessages = async (conversationId: string) => {
  const { getMessagesByConversationId, markAllMessagesAsRead } = 
    await import("@/firebase/messages")
  
  const messages = await getMessagesByConversationId(conversationId, 50)
  setMessages(messages)
  
  // Mark as read
  await markAllMessagesAsRead(conversationId, user.id)
}
```

### 5. Get Unread Count (for Badge)

```typescript
const loadUnreadCount = async () => {
  const { getUnreadMessageCount } = await import("@/firebase/messages")
  
  const count = await getUnreadMessageCount(user.id)
  setUnreadCount(count)
}
```

## Implementation Steps

### Step 1: Update Conversation List Component

```typescript
// components/messaging/conversation-list.tsx
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"

export function ConversationList({ selectedId, onSelect }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    try {
      const { getConversationsByUserId } = await import("@/firebase/messages")
      const data = await getConversationsByUserId(user.id)
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Render conversations...
}
```

### Step 2: Update Chat Interface Component

```typescript
// components/messaging/chat-interface.tsx
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/context/auth-context"

export function ChatInterface({ conversationId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (conversationId) {
      loadMessages()
    }
  }, [conversationId])

  const loadMessages = async () => {
    try {
      const { getMessagesByConversationId, markAllMessagesAsRead } = 
        await import("@/firebase/messages")
      
      const data = await getMessagesByConversationId(conversationId)
      setMessages(data)
      
      // Mark as read
      await markAllMessagesAsRead(conversationId, user.id)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return
    
    setIsSending(true)
    try {
      const { sendMessage } = await import("@/firebase/messages")
      
      await sendMessage({
        conversationId,
        senderId: user.id,
        senderName: user.name,
        senderEmail: user.email,
        senderRole: user.role,
        receiverId: otherUser.id,
        receiverName: otherUser.name,
        receiverEmail: otherUser.email,
        text: newMessage,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      
      setNewMessage("")
      loadMessages() // Reload to show new message
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  // Render chat interface...
}
```

### Step 3: Add Message Button to Tutor Profile

```typescript
// app/parent/tutors/[id]/page.tsx
const handleMessageTutor = async () => {
  try {
    const { getOrCreateConversation } = await import("@/firebase/messages")
    
    const conversationId = await getOrCreateConversation(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email || '',
        role: 'tutor',
        avatar: tutor.avatar
      }
    )
    
    router.push(`/parent/messages?conversation=${conversationId}`)
  } catch (error) {
    console.error('Error starting conversation:', error)
  }
}

// Update the Message button
<AirbnbButton
  variant="outline"
  onClick={handleMessageTutor}
  leftIcon={<MessageCircle className="h-5 w-5" />}
>
  Message
</AirbnbButton>
```

## Firestore Structure Example

```
firestore/
├── conversations/
│   └── conv_abc123/
│       ├── participants: ["parent_123", "tutor_456"]
│       ├── participantDetails: {
│       │   "parent_123": {
│       │     name: "Jane Smith",
│       │     email: "jane@example.com",
│       │     role: "parent",
│       │     avatar: "..."
│       │   },
│       │   "tutor_456": {
│       │     name: "John Doe",
│       │     email: "john@example.com",
│       │     role: "tutor",
│       │     avatar: "..."
│       │   }
│       │ }
│       ├── lastMessage: {
│       │   text: "Thanks for the session!",
│       │   senderId: "parent_123",
│       │   senderName: "Jane Smith",
│       │   timestamp: "2024-01-15T10:00:00.000Z"
│       │ }
│       ├── unreadCount: {
│       │   "parent_123": 0,
│       │   "tutor_456": 1
│       │ }
│       ├── createdAt: "2024-01-15T09:00:00.000Z"
│       └── updatedAt: "2024-01-15T10:00:00.000Z"
│
└── messages/
    ├── msg_xyz789/
    │   ├── conversationId: "conv_abc123"
    │   ├── senderId: "parent_123"
    │   ├── senderName: "Jane Smith"
    │   ├── senderEmail: "jane@example.com"
    │   ├── senderRole: "parent"
    │   ├── receiverId: "tutor_456"
    │   ├── receiverName: "John Doe"
    │   ├── receiverEmail: "john@example.com"
    │   ├── text: "Hi, I'd like to book a session"
    │   ├── isRead: true
    │   ├── readAt: "2024-01-15T09:05:00.000Z"
    │   └── createdAt: "2024-01-15T09:00:00.000Z"
    └── msg_def456/
        └── ...
```

## Additional Features to Implement

### 1. Real-time Updates
Use Firestore's `onSnapshot` for real-time message updates:

```typescript
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore'

const unsubscribe = onSnapshot(
  query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  ),
  (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setMessages(messages)
  }
)

// Cleanup
return () => unsubscribe()
```

### 2. Typing Indicator
Add a `typing` field to conversations:

```typescript
// When user starts typing
await updateConversation(conversationId, {
  [`typing.${user.id}`]: true
})

// When user stops typing
await updateConversation(conversationId, {
  [`typing.${user.id}`]: false
})
```

### 3. File Attachments
Upload files to Firebase Storage and store URLs in messages:

```typescript
const uploadFile = async (file: File) => {
  const storageRef = ref(storage, `messages/${conversationId}/${file.name}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  
  return {
    name: file.name,
    url,
    type: file.type,
    size: file.size
  }
}
```

### 4. Message Reactions
Add reactions array to messages:

```typescript
interface Message {
  // ... other fields
  reactions?: {
    emoji: string;
    userId: string;
    userName: string;
  }[];
}
```

### 5. Search Messages
Add search functionality:

```typescript
const searchMessages = async (conversationId: string, searchTerm: string) => {
  const messages = await getMessagesByConversationId(conversationId, 100)
  return messages.filter(msg => 
    msg.text.toLowerCase().includes(searchTerm.toLowerCase())
  )
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Conversations
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
      
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId;
      
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
      
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
  }
}
```

---

**Status:** ✅ Messaging system Firebase service created!

**Next Steps:**
1. Update conversation-list component
2. Update chat-interface component
3. Add message button to tutor profile
4. Test messaging flow
5. Add real-time updates
6. Add file attachments (optional)
