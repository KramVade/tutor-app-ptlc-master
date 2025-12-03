// Migration script to create payment records for existing confirmed bookings
// Run with: node scripts/create-payments-for-bookings.js

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, where } = require('firebase/firestore');

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

async function createPaymentsForBookings() {
  try {
    console.log('🔍 Finding confirmed bookings without payments...\n');
    
    // Get all confirmed bookings
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('status', '==', 'confirmed'));
    const bookingsSnapshot = await getDocs(q);
    
    console.log(`Found ${bookingsSnapshot.size} confirmed bookings\n`);
    
    // Get all existing payments
    const paymentsRef = collection(db, 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    
    const existingPaymentBookingIds = new Set();
    paymentsSnapshot.forEach(doc => {
      existingPaymentBookingIds.add(doc.data().bookingId);
    });
    
    console.log(`Found ${paymentsSnapshot.size} existing payments\n`);
    
    // Create payments for bookings that don't have them
    let created = 0;
    let skipped = 0;
    
    for (const bookingDoc of bookingsSnapshot.docs) {
      const booking = { id: bookingDoc.id, ...bookingDoc.data() };
      
      if (existingPaymentBookingIds.has(booking.id)) {
        console.log(`⏭️  Skipping booking ${booking.id} - payment already exists`);
        skipped++;
        continue;
      }
      
      // Calculate fees
      const platformFee = Math.round(booking.totalPrice * 0.10);
      const tutorAmount = booking.totalPrice - platformFee;
      
      const paymentData = {
        bookingId: booking.id,
        parentId: booking.parentId,
        parentEmail: booking.parentEmail,
        parentName: booking.parentName,
        tutorId: booking.tutorId,
        tutorEmail: booking.tutorEmail,
        tutorName: booking.tutorName,
        childName: booking.childName,
        subject: booking.subject,
        sessionDate: booking.date,
        sessionTime: booking.time,
        amount: booking.totalPrice,
        platformFee,
        tutorAmount,
        status: 'pending',
        paymentMethod: 'gcash',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(paymentsRef, paymentData);
      console.log(`✅ Created payment ${docRef.id} for booking ${booking.id}`);
      console.log(`   Parent: ${booking.parentName}`);
      console.log(`   Tutor: ${booking.tutorName}`);
      console.log(`   Amount: ₱${booking.totalPrice}\n`);
      created++;
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Created: ${created} payments`);
    console.log(`   Skipped: ${skipped} bookings (already have payments)`);
    console.log(`   Total: ${created + skipped} confirmed bookings`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

createPaymentsForBookings();
