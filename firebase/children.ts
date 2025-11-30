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

const CHILDREN_COLLECTION = 'children';

export interface Child {
  id?: string;
  name: string;
  age: number;
  gender: string;
  gradeLevel: string;
  parentId: string;
  parentEmail: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getAllChildren() {
  try {
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const snapshot = await getDocs(childrenRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Child[];
  } catch (error) {
    console.error('Error fetching children:', error);
    throw error;
  }
}

export async function getChildById(childId: string) {
  try {
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    const childSnap = await getDoc(childRef);
    
    if (childSnap.exists()) {
      return {
        id: childSnap.id,
        ...childSnap.data()
      } as Child;
    }
    return null;
  } catch (error) {
    console.error('Error fetching child:', error);
    throw error;
  }
}

export async function getChildrenByParentId(parentId: string) {
  try {
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const q = query(childrenRef, where('parentId', '==', parentId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Child[];
  } catch (error) {
    console.error('Error fetching children by parent:', error);
    throw error;
  }
}

export async function getChildrenByParentEmail(parentEmail: string) {
  try {
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const q = query(childrenRef, where('parentEmail', '==', parentEmail));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Child[];
  } catch (error) {
    console.error('Error fetching children by parent email:', error);
    throw error;
  }
}

export async function addChild(childData: Omit<Child, 'id'>) {
  try {
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const docRef = await addDoc(childrenRef, {
      ...childData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding child:', error);
    throw error;
  }
}

export async function updateChild(childId: string, childData: Partial<Child>) {
  try {
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    await updateDoc(childRef, {
      ...childData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating child:', error);
    throw error;
  }
}

export async function deleteChild(childId: string) {
  try {
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    await deleteDoc(childRef);
  } catch (error) {
    console.error('Error deleting child:', error);
    throw error;
  }
}
