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

// GET ALL PAYMENTS
export const getAllPayments = async () => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// GET PAYMENT BY ID
export const getPaymentById = async (paymentId) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (paymentSnap.exists()) {
      return {
        id: paymentSnap.id,
        ...paymentSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// GET PAYMENTS BY PARENT EMAIL
export const getPaymentsByParentEmail = async (parentEmail) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('parentEmail', '==', parentEmail),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching parent payments:', error);
    throw error;
  }
};

// GET PAYMENTS BY TUTOR EMAIL
export const getPaymentsByTutorEmail = async (tutorEmail) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('tutorEmail', '==', tutorEmail),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tutor payments:', error);
    throw error;
  }
};

// GET PAYMENTS BY BOOKING ID
export const getPaymentsByBookingId = async (bookingId) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('bookingId', '==', bookingId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching payments by booking:', error);
    throw error;
  }
};

// ADD NEW PAYMENT
export const addPayment = async (paymentData) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      status: paymentData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};

// UPDATE PAYMENT
export const updatePayment = async (paymentId, paymentData) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      ...paymentData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// UPDATE PAYMENT STATUS
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};
