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

const PARENTS_COLLECTION = 'parents';

// GET ALL PARENTS
export const getAllParents = async () => {
  try {
    const parentsRef = collection(db, PARENTS_COLLECTION);
    const snapshot = await getDocs(parentsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching parents:', error);
    throw error;
  }
};

// GET PARENT BY ID
export const getParentById = async (parentId) => {
  try {
    const parentRef = doc(db, PARENTS_COLLECTION, parentId);
    const parentSnap = await getDoc(parentRef);
    
    if (parentSnap.exists()) {
      return {
        id: parentSnap.id,
        ...parentSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching parent:', error);
    throw error;
  }
};

// GET PARENT BY EMAIL
export const getParentByEmail = async (email) => {
  try {
    const parentsRef = collection(db, PARENTS_COLLECTION);
    const q = query(parentsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error fetching parent by email:', error);
    throw error;
  }
};

// ADD NEW PARENT
export const addParent = async (parentData) => {
  try {
    const parentsRef = collection(db, PARENTS_COLLECTION);
    const docRef = await addDoc(parentsRef, {
      ...parentData,
      children: parentData.children || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding parent:', error);
    throw error;
  }
};

// UPDATE PARENT
export const updateParent = async (parentId, parentData) => {
  try {
    const parentRef = doc(db, PARENTS_COLLECTION, parentId);
    await updateDoc(parentRef, {
      ...parentData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

// DELETE PARENT
export const deleteParent = async (parentId) => {
  try {
    const parentRef = doc(db, PARENTS_COLLECTION, parentId);
    await deleteDoc(parentRef);
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw error;
  }
};

// ADD CHILD TO PARENT
export const addChildToParent = async (parentId, childData) => {
  try {
    const parent = await getParentById(parentId);
    if (!parent) throw new Error('Parent not found');
    
    const updatedChildren = [...(parent.children || []), childData];
    await updateParent(parentId, { children: updatedChildren });
  } catch (error) {
    console.error('Error adding child to parent:', error);
    throw error;
  }
};

// UPDATE CHILD IN PARENT
export const updateChildInParent = async (parentId, childId, childData) => {
  try {
    const parent = await getParentById(parentId);
    if (!parent) throw new Error('Parent not found');
    
    const updatedChildren = parent.children.map(child =>
      child.id === childId ? { ...child, ...childData } : child
    );
    
    await updateParent(parentId, { children: updatedChildren });
  } catch (error) {
    console.error('Error updating child:', error);
    throw error;
  }
};

// REMOVE CHILD FROM PARENT
export const removeChildFromParent = async (parentId, childId) => {
  try {
    const parent = await getParentById(parentId);
    if (!parent) throw new Error('Parent not found');
    
    const updatedChildren = parent.children.filter(child => child.id !== childId);
    await updateParent(parentId, { children: updatedChildren });
  } catch (error) {
    console.error('Error removing child:', error);
    throw error;
  }
};
