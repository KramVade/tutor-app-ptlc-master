import { 
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from './config';

const BOOKINGS_COLLECTION = 'bookings';

export interface Booking {
  id?: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
  tutorId: string;
  tutorEmail: string;
  tutorName: string;
  childId: string;
  childName: string;
  childAge?: number;
  childGrade?: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  hourlyRate: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getAllBookings() {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const snapshot = await getDocs(bookingsRef);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    
    // Sort by createdAt in memory (newest first)
    return bookings.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export async function getBookingById(bookingId: string) {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (bookingSnap.exists()) {
      return {
        id: bookingSnap.id,
        ...bookingSnap.data()
      } as Booking;
    }
    return null;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

export async function getBookingsByParentId(parentId: string) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    // Simplified query - just filter by parentId, sort in memory
    const q = query(
      bookingsRef,
      where('parentId', '==', parentId)
    );
    const snapshot = await getDocs(q);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    
    // Sort by createdAt in memory (newest first)
    return bookings.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching parent bookings:', error);
    throw error;
  }
}

export async function getBookingsByTutorId(tutorId: string) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    // Simplified query - just filter by tutorId, sort in memory
    const q = query(
      bookingsRef,
      where('tutorId', '==', tutorId)
    );
    const snapshot = await getDocs(q);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    
    // Sort by createdAt in memory (newest first)
    return bookings.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching tutor bookings:', error);
    throw error;
  }
}

export async function getBookingsByStatus(status: string) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    // Simplified query - just filter by status, sort in memory
    const q = query(
      bookingsRef,
      where('status', '==', status)
    );
    const snapshot = await getDocs(q);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    
    // Sort by createdAt in memory (newest first)
    return bookings.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    throw error;
  }
}

export async function addBooking(bookingData: Omit<Booking, 'id'>) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create notification for tutor about new booking
    try {
      const { createBookingNotification } = await import('./notifications');
      await createBookingNotification(
        bookingData.tutorId,
        'new_booking',
        {
          parentName: bookingData.parentName,
          date: bookingData.date,
          time: bookingData.time
        }
      );
    } catch (notifError) {
      console.error('Error creating booking notification:', notifError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
}

export async function updateBooking(bookingId: string, bookingData: Partial<Booking>) {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      ...bookingData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

export async function updateBookingStatus(bookingId: string, status: Booking['status']) {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    
    // Get booking details for notification
    const bookingSnap = await getDoc(bookingRef);
    if (bookingSnap.exists()) {
      const booking = bookingSnap.data() as Booking;
      
      // Create notification for parent about status change
      try {
        const { createBookingNotification } = await import('./notifications');
        
        if (status === 'confirmed') {
          await createBookingNotification(
            booking.parentId,
            'booking_confirmed',
            {
              tutorName: booking.tutorName,
              date: booking.date,
              time: booking.time
            }
          );
        } else if (status === 'cancelled') {
          await createBookingNotification(
            booking.parentId,
            'booking_cancelled',
            {
              date: booking.date,
              time: booking.time
            }
          );
        }
      } catch (notifError) {
        console.error('Error creating status notification:', notifError);
      }
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}
