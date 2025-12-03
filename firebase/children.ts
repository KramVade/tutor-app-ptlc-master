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
  status: 'pending' | 'confirmed' | 'rejected';
  confirmedBy?: string;        // Tutor ID who confirmed
  confirmedByName?: string;     // Tutor name who confirmed
  confirmedAt?: string;         // Confirmation timestamp
  rejectedBy?: string;          // Tutor ID who rejected
  rejectedByName?: string;      // Tutor name who rejected
  rejectedAt?: string;          // Rejection timestamp
  rejectionReason?: string;     // Optional reason for rejection
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
      status: childData.status || 'pending', // Default to pending if not specified
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

// Confirm a child (by tutor)
export async function confirmChild(
  childId: string,
  tutorId: string,
  tutorName: string
) {
  try {
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    await updateDoc(childRef, {
      status: 'confirmed',
      confirmedBy: tutorId,
      confirmedByName: tutorName,
      confirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Get child details for notification
    const child = await getChildById(childId);
    if (child) {
      // Notify parent
      try {
        const { addNotification } = await import('./notifications');
        await addNotification({
          userId: child.parentId,
          type: 'system',
          title: 'Child Profile Confirmed',
          message: `${tutorName} has confirmed ${child.name}'s profile`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('Error creating confirmation notification:', notifError);
      }
    }
    
    console.log(`✅ Child ${childId} confirmed by ${tutorName}`);
  } catch (error) {
    console.error('Error confirming child:', error);
    throw error;
  }
}

// Reject a child (by tutor)
export async function rejectChild(
  childId: string,
  tutorId: string,
  tutorName: string,
  reason?: string
) {
  try {
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    const updateData: any = {
      status: 'rejected',
      rejectedBy: tutorId,
      rejectedByName: tutorName,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (reason) {
      updateData.rejectionReason = reason;
    }
    
    await updateDoc(childRef, updateData);
    
    // Get child details for notification
    const child = await getChildById(childId);
    if (child) {
      // Notify parent
      try {
        const { addNotification } = await import('./notifications');
        await addNotification({
          userId: child.parentId,
          type: 'system',
          title: 'Child Profile Needs Update',
          message: `${tutorName} has requested updates to ${child.name}'s profile${reason ? ': ' + reason : ''}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('Error creating rejection notification:', notifError);
      }
    }
    
    console.log(`✅ Child ${childId} rejected by ${tutorName}`);
  } catch (error) {
    console.error('Error rejecting child:', error);
    throw error;
  }
}

// Get children by status
export async function getChildrenByStatus(status: Child['status']) {
  try {
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const q = query(childrenRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Child[];
  } catch (error) {
    console.error('Error fetching children by status:', error);
    throw error;
  }
}
