/**
 * Migration Script: Approve Existing Tutors
 * 
 * This script sets approved=true for all existing tutors that don't have the approved field.
 * Run with: node scripts/approve-existing-tutors.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc,
  doc
} = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function approveExistingTutors() {
  console.log('🔧 Starting migration: Approve existing tutors\n');
  
  try {
    // Get all tutors
    const tutorsRef = collection(db, 'tutors');
    const snapshot = await getDocs(tutorsRef);
    
    console.log(`📊 Found ${snapshot.size} tutors in database\n`);
    
    let approvedCount = 0;
    let alreadyApprovedCount = 0;
    let errorCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const tutor = docSnap.data();
      const tutorId = docSnap.id;
      
      // Check if tutor already has approved field set to true
      if (tutor.approved === true) {
        console.log(`✅ ${tutor.name} - Already approved`);
        alreadyApprovedCount++;
        continue;
      }
      
      // Check if tutor is rejected
      if (tutor.rejected === true) {
        console.log(`❌ ${tutor.name} - Rejected (skipping)`);
        continue;
      }
      
      // Approve the tutor
      try {
        const tutorRef = doc(db, 'tutors', tutorId);
        await updateDoc(tutorRef, {
          approved: true,
          approvedBy: 'migration-script',
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ ${tutor.name} - Approved`);
        approvedCount++;
      } catch (error) {
        console.error(`❌ ${tutor.name} - Error:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total tutors: ${snapshot.size}`);
    console.log(`   Newly approved: ${approvedCount}`);
    console.log(`   Already approved: ${alreadyApprovedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('\n✅ Migration completed!');
    
    if (approvedCount > 0) {
      console.log('\n💡 Refresh your parent tutors page to see all approved tutors.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
approveExistingTutors()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
