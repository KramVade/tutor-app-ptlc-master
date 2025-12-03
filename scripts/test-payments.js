// Test script to check payments and bookings
// Run with: node scripts/test-payments.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase config (use your actual config)
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

async function checkPaymentsAndBookings() {
  try {
    console.log('🔍 Checking bookings...\n');
    
    // Get all bookings
    const bookingsRef = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    
    console.log(`Total bookings: ${bookingsSnapshot.size}`);
    
    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      bookings.push({ id: doc.id, ...data });
      console.log(`\nBooking ${doc.id}:`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Parent: ${data.parentName} (${data.parentId})`);
      console.log(`  Tutor: ${data.tutorName}`);
      console.log(`  Date: ${data.date} at ${data.time}`);
      console.log(`  Price: ₱${data.totalPrice}`);
    });
    
    console.log('\n\n🔍 Checking payments...\n');
    
    // Get all payments
    const paymentsRef = collection(db, 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    
    console.log(`Total payments: ${paymentsSnapshot.size}`);
    
    paymentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nPayment ${doc.id}:`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Booking ID: ${data.bookingId}`);
      console.log(`  Parent: ${data.parentName} (${data.parentId})`);
      console.log(`  Amount: ₱${data.amount}`);
      console.log(`  Created: ${data.createdAt}`);
    });
    
    // Check for confirmed bookings without payments
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    console.log(`\n\n📊 Summary:`);
    console.log(`  Total bookings: ${bookings.length}`);
    console.log(`  Confirmed bookings: ${confirmedBookings.length}`);
    console.log(`  Total payments: ${paymentsSnapshot.size}`);
    
    if (confirmedBookings.length > paymentsSnapshot.size) {
      console.log(`\n⚠️  Warning: ${confirmedBookings.length - paymentsSnapshot.size} confirmed bookings don't have payment records!`);
      console.log(`\nConfirmed bookings without payments:`);
      
      const paymentBookingIds = [];
      paymentsSnapshot.forEach(doc => {
        paymentBookingIds.push(doc.data().bookingId);
      });
      
      confirmedBookings.forEach(booking => {
        if (!paymentBookingIds.includes(booking.id)) {
          console.log(`  - Booking ${booking.id}: ${booking.parentName} -> ${booking.tutorName}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPaymentsAndBookings();
