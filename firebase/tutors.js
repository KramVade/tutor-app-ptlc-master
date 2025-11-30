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

const TUTORS_COLLECTION = 'tutors';

export const getAllTutors = async () => {
  try {
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    const snapshot = await getDocs(tutorsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tutors:', error);
    throw error;
  }
};

export const getTutorById = async (tutorId) => {
  try {
    const tutorRef = doc(db, TUTORS_COLLECTION, tutorId);
    const tutorSnap = await getDoc(tutorRef);
    
    if (tutorSnap.exists()) {
      return {
        id: tutorSnap.id,
        ...tutorSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching tutor:', error);
    throw error;
  }
};

export const getTutorByEmail = async (email) => {
  try {
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    const q = query(tutorsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching tutor by email:', error);
    throw error;
  }
};

export const addTutor = async (tutorData) => {
  try {
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    const docRef = await addDoc(tutorsRef, {
      ...tutorData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding tutor:', error);
    throw error;
  }
};

export const updateTutor = async (tutorId, tutorData) => {
  try {
    const tutorRef = doc(db, TUTORS_COLLECTION, tutorId);
    await updateDoc(tutorRef, {
      ...tutorData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating tutor:', error);
    throw error;
  }
};

export const deleteTutor = async (tutorId) => {
  try {
    const tutorRef = doc(db, TUTORS_COLLECTION, tutorId);
    await deleteDoc(tutorRef);
  } catch (error) {
    console.error('Error deleting tutor:', error);
    throw error;
  }
};

export const getTutorsBySubject = async (subject) => {
  try {
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    const q = query(tutorsRef, where('subjects', 'array-contains', subject));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tutors by subject:', error);
    throw error;
  }
};

export const getAvailableTutors = async () => {
  try {
    const tutorsRef = collection(db, TUTORS_COLLECTION);
    const q = query(tutorsRef, where('available', '==', true));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching available tutors:', error);
    throw error;
  }
};
