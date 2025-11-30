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

const EARNINGS_COLLECTION = 'earnings';

// GET ALL EARNINGS
export const getAllEarnings = async () => {
  try {
    const earningsRef = collection(db, EARNINGS_COLLECTION);
    const q = query(earningsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching earnings:', error);
    throw error;
  }
};

// GET EARNINGS BY TUTOR EMAIL
export const getEarningsByTutorEmail = async (tutorEmail) => {
  try {
    const earningsRef = collection(db, EARNINGS_COLLECTION);
    const q = query(
      earningsRef,
      where('tutorEmail', '==', tutorEmail),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tutor earnings:', error);
    throw error;
  }
};

// ADD EARNING RECORD
export const addEarning = async (earningData) => {
  try {
    const earningsRef = collection(db, EARNINGS_COLLECTION);
    const docRef = await addDoc(earningsRef, {
      ...earningData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding earning:', error);
    throw error;
  }
};

// UPDATE EARNING
export const updateEarning = async (earningId, earningData) => {
  try {
    const earningRef = doc(db, EARNINGS_COLLECTION, earningId);
    await updateDoc(earningRef, {
      ...earningData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating earning:', error);
    throw error;
  }
};

// GET TOTAL EARNINGS BY TUTOR
export const getTotalEarningsByTutor = async (tutorEmail) => {
  try {
    const earnings = await getEarningsByTutorEmail(tutorEmail);
    return earnings.reduce((total, earning) => total + (earning.amount || 0), 0);
  } catch (error) {
    console.error('Error calculating total earnings:', error);
    throw error;
  }
};
