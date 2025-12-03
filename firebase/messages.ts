import { 
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

// Conversation between two users
export interface Conversation {
  id?: string;
  participants: string[]; // Array of user IDs
  participantDetails: {
    [userId: string]: {
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
    [userId: string]: number; // Unread count per user
  };
  createdAt: string;
  updatedAt: string;
}

// Individual message
export interface Message {
  id?: string;
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
  flagged?: boolean;
  moderationReasons?: string[];
  moderationConfidence?: number;
  approvedAt?: string;
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

// ============ CONVERSATIONS ============

export async function getConversationsByUserId(userId: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    // Simplified query - just filter by participants, sort in memory
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[];
    
    // Sort by updatedAt in memory to avoid needing a composite index
    return conversations.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

export async function getConversationBetweenUsers(userId1: string, userId2: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );
    const snapshot = await getDocs(q);
    
    // Find conversation that includes both users
    const conversation = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(userId2);
    });
    
    if (conversation) {
      return {
        id: conversation.id,
        ...conversation.data()
      } as Conversation;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

export async function createConversation(conversationData: Omit<Conversation, 'id'>) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const docRef = await addDoc(conversationsRef, {
      ...conversationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function updateConversation(conversationId: string, data: Partial<Conversation>) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

export async function markConversationAsRead(conversationId: string, userId: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

// ============ MESSAGES ============

export async function getMessagesByConversationId(conversationId: string, limitCount: number = 50) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    // Simplified query - just filter by conversationId, sort in memory
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId)
    );
    const snapshot = await getDocs(q);
    
    let messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    // Sort by createdAt in memory (oldest first for chat display)
    messages = messages.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Ascending order (oldest first)
    });
    
    // Apply limit in memory
    if (messages.length > limitCount) {
      messages = messages.slice(-limitCount); // Get last N messages
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function sendMessage(messageData: Omit<Message, 'id'>) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    
    // Moderate the message before sending
    const { moderateMessage, shouldAutoBlock } = await import('@/lib/moderation/message-moderator');
    const moderation = await moderateMessage(messageData.text);
    
    // Block high-severity content
    if (shouldAutoBlock(moderation)) {
      // Notify admins about blocked message attempt
      try {
        const { addNotification } = await import('./notifications');
        const { getCategoryDescription } = await import('@/lib/moderation/message-moderator');
        
        // Get all admin users
        const usersRef = collection(db, 'users');
        const adminsQuery = query(usersRef, where('role', '==', 'admin'));
        const adminsSnapshot = await getDocs(adminsQuery);
        
        // Notify each admin
        const reasonDescriptions = moderation.reasons.map(getCategoryDescription).join(', ');
        for (const adminDoc of adminsSnapshot.docs) {
          await addNotification({
            userId: adminDoc.id,
            type: 'system',
            title: '🚫 Message Blocked',
            message: `${messageData.senderName} attempted to send: "${messageData.text.substring(0, 50)}..." - Blocked for: ${reasonDescriptions}`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      } catch (adminNotifError) {
        console.error('Error notifying admins of blocked message:', adminNotifError);
      }
      
      throw new Error(
        `Message blocked: ${moderation.reasons.join(", ")}`
      );
    }
    
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    
    // Prepare message data (only include defined values)
    const messageToSave: any = {
      ...messageData,
      isRead: false,
      flagged: !moderation.allowed,
      moderationReasons: moderation.reasons,
      createdAt: new Date().toISOString()
    };
    
    // Only add moderationConfidence if it exists
    if (moderation.confidence !== undefined) {
      messageToSave.moderationConfidence = moderation.confidence;
    }
    
    const docRef = await addDoc(messagesRef, messageToSave);
    
    // Update conversation with last message
    await updateConversation(messageData.conversationId, {
      lastMessage: {
        text: messageData.text,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        timestamp: new Date().toISOString()
      },
      [`unreadCount.${messageData.receiverId}`]: 
        await incrementUnreadCount(messageData.conversationId, messageData.receiverId)
    } as any);
    
    // Create notification for receiver
    try {
      const { createMessageNotification } = await import('./notifications');
      await createMessageNotification(
        messageData.receiverId,
        messageData.senderName,
        messageData.conversationId
      );
    } catch (notifError) {
      console.error('Error creating message notification:', notifError);
    }
    
    // If message is flagged, notify admins
    if (!moderation.allowed) {
      try {
        const { addNotification } = await import('./notifications');
        // Get all admin users
        const { collection: firestoreCollection, getDocs: getFirestoreDocs, query: firestoreQuery, where: firestoreWhere } = await import('firebase/firestore');
        const usersRef = firestoreCollection(db, 'users');
        const adminsQuery = firestoreQuery(usersRef, firestoreWhere('role', '==', 'admin'));
        const adminsSnapshot = await getFirestoreDocs(adminsQuery);
        
        // Notify each admin
        for (const adminDoc of adminsSnapshot.docs) {
          await addNotification({
            userId: adminDoc.id,
            type: 'system',
            title: 'Flagged Message',
            message: `Message from ${messageData.senderName} flagged: ${moderation.reasons.join(", ")}`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      } catch (adminNotifError) {
        console.error('Error notifying admins:', adminNotifError);
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

async function incrementUnreadCount(conversationId: string, userId: string): Promise<number> {
  try {
    if (!db) return 1;
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      const currentCount = data.unreadCount?.[userId] || 0;
      return currentCount + 1;
    }
    
    return 1;
  } catch (error) {
    console.error('Error incrementing unread count:', error);
    return 1;
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      isRead: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

export async function markAllMessagesAsRead(conversationId: string, userId: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        isRead: true,
        readAt: new Date().toISOString()
      })
    );
    
    await Promise.all(updatePromises);
    
    // Reset unread count in conversation
    await markConversationAsRead(conversationId, userId);
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    throw error;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

export async function getUnreadMessageCount(userId: string) {
  try {
    const conversations = await getConversationsByUserId(userId);
    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[userId] || 0);
    }, 0);
    
    return totalUnread;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Get flagged messages for admin moderation
export async function getFlaggedMessages() {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where('flagged', '==', true)
    );
    const snapshot = await getDocs(q);
    
    let messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    // Sort by createdAt (newest first)
    messages = messages.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    return messages;
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    throw error;
  }
}

// Approve a flagged message (remove flag)
export async function approveMessage(messageId: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      flagged: false,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error approving message:', error);
    throw error;
  }
}

// Helper function to get or create conversation
export async function getOrCreateConversation(
  user1: { id: string; name: string; email: string; role: 'parent' | 'tutor' | 'admin'; avatar?: string },
  user2: { id: string; name: string; email: string; role: 'parent' | 'tutor' | 'admin'; avatar?: string }
): Promise<string> {
  try {
    // Check if conversation exists
    const existingConversation = await getConversationBetweenUsers(user1.id, user2.id);
    
    if (existingConversation) {
      return existingConversation.id!;
    }
    
    // Create new conversation
    const conversationId = await createConversation({
      participants: [user1.id, user2.id],
      participantDetails: {
        [user1.id]: {
          name: user1.name,
          email: user1.email,
          role: user1.role,
          avatar: user1.avatar
        },
        [user2.id]: {
          name: user2.name,
          email: user2.email,
          role: user2.role,
          avatar: user2.avatar
        }
      },
      lastMessage: {
        text: '',
        senderId: '',
        senderName: '',
        timestamp: new Date().toISOString()
      },
      unreadCount: {
        [user1.id]: 0,
        [user2.id]: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return conversationId;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw error;
  }
}
