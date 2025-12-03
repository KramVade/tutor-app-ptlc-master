import { 
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

const PAYMENTS_COLLECTION = 'payments';

export interface Payment {
  id?: string;
  bookingId: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
  tutorId: string;
  tutorEmail: string;
  tutorName: string;
  childName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  amount: number;
  platformFee: number;
  tutorAmount: number;
  status: 'pending' | 'due' | 'paid' | 'verified' | 'cancelled';
  paymentMethod: 'gcash' | 'cash';
  gcashReferenceNumber?: string;
  gcashScreenshot?: string;
  paymentDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  // Tutor payout tracking (PTLC pays tutor)
  tutorPayoutStatus?: 'pending' | 'processing' | 'paid' | 'failed';
  tutorPayoutMethod?: 'gcash' | 'bank_transfer' | 'cash';
  tutorPayoutReference?: string;
  tutorPayoutDate?: string;
  tutorPayoutNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Create payment record when booking is confirmed
export async function createPaymentForBooking(bookingData: {
  bookingId: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
  tutorId: string;
  tutorEmail: string;
  tutorName: string;
  childName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  totalPrice: number;
}) {
  try {
    // Calculate platform fee (10% of total)
    const platformFee = Math.round(bookingData.totalPrice * 0.10);
    const tutorAmount = bookingData.totalPrice - platformFee;

    const paymentData: Omit<Payment, 'id'> = {
      bookingId: bookingData.bookingId,
      parentId: bookingData.parentId,
      parentEmail: bookingData.parentEmail,
      parentName: bookingData.parentName,
      tutorId: bookingData.tutorId,
      tutorEmail: bookingData.tutorEmail,
      tutorName: bookingData.tutorName,
      childName: bookingData.childName,
      subject: bookingData.subject,
      sessionDate: bookingData.sessionDate,
      sessionTime: bookingData.sessionTime,
      amount: bookingData.totalPrice,
      platformFee,
      tutorAmount,
      status: 'pending',
      paymentMethod: 'gcash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const docRef = await addDoc(paymentsRef, paymentData);

    console.log('✅ Payment record created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    throw error;
  }
}

// Get all payments
export async function getAllPayments() {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

// Get payment by ID
export async function getPaymentById(paymentId: string) {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (paymentSnap.exists()) {
      return {
        id: paymentSnap.id,
        ...paymentSnap.data()
      } as Payment;
    }
    return null;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

// Get payments by parent ID
export async function getPaymentsByParentId(parentId: string) {
  try {
    console.log('🔍 Fetching payments for parentId:', parentId);
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    
    // Try without orderBy first to avoid index issues
    const q = query(
      paymentsRef,
      where('parentId', '==', parentId)
    );
    const snapshot = await getDocs(q);
    
    console.log('📊 Found payments:', snapshot.size);
    
    const payments = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Payment doc:', doc.id, data);
      return {
        id: doc.id,
        ...data
      };
    }) as Payment[];
    
    // Sort in memory
    return payments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('❌ Error fetching parent payments:', error);
    throw error;
  }
}

// Get payments by tutor ID
export async function getPaymentsByTutorId(tutorId: string) {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('tutorId', '==', tutorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching tutor payments:', error);
    throw error;
  }
}

// Get payment by booking ID
export async function getPaymentByBookingId(bookingId: string) {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('bookingId', '==', bookingId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Payment;
    }
    return null;
  } catch (error) {
    console.error('Error fetching payment by booking:', error);
    throw error;
  }
}

// Submit payment proof
export async function submitPaymentProof(
  paymentId: string,
  referenceNumber: string,
  screenshot?: string
) {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      status: 'paid',
      gcashReferenceNumber: referenceNumber,
      gcashScreenshot: screenshot,
      paymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Payment proof submitted');
  } catch (error) {
    console.error('❌ Error submitting payment proof:', error);
    throw error;
  }
}

// Verify payment (admin/tutor)
export async function verifyPayment(
  paymentId: string,
  verifiedBy: string
) {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      status: 'verified',
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Payment verified');
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    throw error;
  }
}

// Update payment status
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['status'],
  notes?: string
) {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(paymentRef, updateData);
    console.log('✅ Payment status updated');
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
}

// Get due payments count for parent
export async function getDuePaymentsCount(parentId: string) {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('parentId', '==', parentId),
      where('status', '==', 'due')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching due payments count:', error);
    return 0;
  }
}

// Mark payment as due when session is completed
export async function markPaymentAsDue(bookingId: string) {
  try {
    const payment = await getPaymentByBookingId(bookingId);
    if (payment && payment.status === 'pending') {
      await updatePaymentStatus(payment.id!, 'due');
      console.log('✅ Payment marked as due');
      
      // Create notification for parent
      try {
        const { createNotification } = await import('./notifications');
        await createNotification({
          userId: payment.parentId,
          type: 'payment_due',
          title: 'Payment Due',
          message: `Payment of ₱${payment.amount} is now due for your session with ${payment.tutorName}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('Error creating payment due notification:', notifError);
      }
    }
  } catch (error) {
    console.error('❌ Error marking payment as due:', error);
    throw error;
  }
}
