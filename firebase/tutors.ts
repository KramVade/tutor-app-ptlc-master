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
  DocumentData
} from 'firebase/firestore';
import { db } from './config';

const TUTORS_COLLECTION = 'tutors';

export async function getAllTutors() {
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
}

export async function getTutorById(tutorId: string) {
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
}

export async function getTutorByEmail(email: string) {
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
}

export async function addTutor(tutorData: any) {
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
}

export async function updateTutor(tutorId: string, tutorData: any) {
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
}

export async function deleteTutor(tutorId: string) {
  try {
    const tutorRef = doc(db, TUTORS_COLLECTION, tutorId);
    await deleteDoc(tutorRef);
  } catch (error) {
    console.error('Error deleting tutor:', error);
    throw error;
  }
}

export async function getTutorsBySubject(subject: string) {
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
}

export async function getAvailableTutors() {
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
}
