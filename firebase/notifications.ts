import { 
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';

const NOTIFICATIONS_COLLECTION = 'notifications';

export interface Notification {
  id?: string;
  userId: string;
  type: 'booking' | 'message' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export async function getNotificationsByUserId(userId: string) {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    // Sort by createdAt in memory (newest first)
    return notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

export async function addNotification(notificationData: Omit<Notification, 'id'>) {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: notificationData.createdAt || new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Real-time listener for notifications
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notificationsRef,
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    // Sort by createdAt (newest first)
    const sortedNotifications = notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    callback(sortedNotifications);
  }, (error) => {
    console.error('Error in notifications subscription:', error);
  });
}

// Helper function to create booking notifications
export async function createBookingNotification(
  userId: string,
  type: 'new_booking' | 'booking_confirmed' | 'booking_cancelled',
  bookingDetails: { tutorName?: string; parentName?: string; date: string; time: string }
) {
  const messages = {
    new_booking: {
      title: 'New Booking Request',
      message: `${bookingDetails.parentName} has requested a session on ${bookingDetails.date} at ${bookingDetails.time}`
    },
    booking_confirmed: {
      title: 'Booking Confirmed',
      message: `Your session with ${bookingDetails.tutorName} on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed`
    },
    booking_cancelled: {
      title: 'Booking Cancelled',
      message: `Your session on ${bookingDetails.date} at ${bookingDetails.time} has been cancelled`
    }
  };
  
  const notification = messages[type];
  
  await addNotification({
    userId,
    type: 'booking',
    title: notification.title,
    message: notification.message,
    read: false,
    createdAt: new Date().toISOString()
  });
}

// Helper function to create message notifications
export async function createMessageNotification(
  userId: string,
  senderName: string,
  conversationId: string
) {
  await addNotification({
    userId,
    type: 'message',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    read: false,
    link: `/messages?conversation=${conversationId}`,
    createdAt: new Date().toISOString()
  });
}
