/**
 * Script to create an admin account in Firestore
 * 
 * Usage:
 * 1. Make sure you have Firebase Admin SDK set up
 * 2. Update the admin details below
 * 3. Run: node scripts/create-admin.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You need to download this from Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Admin account details
const adminData = {
  name: 'Admin User',
  email: 'admin@ptlc.com', // Change this to your admin email
  password: 'admin123', // Change this to a secure password
  phone: '',
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function createAdmin() {
  try {
    console.log('🔥 Creating admin account...');
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins')
      .where('email', '==', adminData.email)
      .get();
    
    if (!existingAdmin.empty) {
      console.log('⚠️  Admin account already exists!');
      const doc = existingAdmin.docs[0];
      console.log('Admin ID:', doc.id);
      console.log('Admin Data:', doc.data());
      return;
    }
    
    // Create admin account
    const docRef = await db.collection('admins').add(adminData);
    
    console.log('✅ Admin account created successfully!');
    console.log('Admin ID:', docRef.id);
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
