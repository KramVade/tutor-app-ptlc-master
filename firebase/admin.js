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

const ADMINS_COLLECTION = 'admins';

// GET ALL ADMINS
export const getAllAdmins = async () => {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const snapshot = await getDocs(adminsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

// GET ADMIN BY ID
export const getAdminById = async (adminId) => {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, adminId);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      return {
        id: adminSnap.id,
        ...adminSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error;
  }
};

// GET ADMIN BY EMAIL
export const getAdminByEmail = async (email) => {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const q = query(adminsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error fetching admin by email:', error);
    throw error;
  }
};

// ADD NEW ADMIN
export const addAdmin = async (adminData) => {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const docRef = await addDoc(adminsRef, {
      ...adminData,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};

// UPDATE ADMIN
export const updateAdmin = async (adminId, adminData) => {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, adminId);
    await updateDoc(adminRef, {
      ...adminData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

// DELETE ADMIN
export const deleteAdmin = async (adminId) => {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, adminId);
    await deleteDoc(adminRef);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

// VERIFY ADMIN CREDENTIALS
export const verifyAdminCredentials = async (email, password) => {
  try {
    const admin = await getAdminByEmail(email);
    if (!admin) return null;
    
    // Note: In production, use proper password hashing
    if (admin.password === password) {
      return admin;
    }
    return null;
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    throw error;
  }
};
