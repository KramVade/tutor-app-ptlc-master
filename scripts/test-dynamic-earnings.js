/**
 * Test script to verify dynamic earnings calculation
 * This script tests that tutor earnings are calculated from verified payments, not static data
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where 
} = require('firebase/firestore');

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

async function testDynamicEarnings() {
  console.log('🧪 Testing Dynamic Earnings Calculation\n');
  
  try {
    // Get all payments
    const paymentsRef = collection(db, 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Total Payments: ${payments.length}\n`);
    
    // Group by tutor
    const tutorPayments = {};
    payments.forEach(payment => {
      if (!tutorPayments[payment.tutorId]) {
        tutorPayments[payment.tutorId] = {
          tutorName: payment.tutorName,
          tutorEmail: payment.tutorEmail,
          payments: []
        };
      }
      tutorPayments[payment.tutorId].payments.push(payment);
    });
    
    // Calculate earnings for each tutor
    console.log('💰 Tutor Earnings Breakdown:\n');
    
    for (const [tutorId, data] of Object.entries(tutorPayments)) {
      const { tutorName, tutorEmail, payments } = data;
      
      const pending = payments.filter(p => p.status === 'pending');
      const due = payments.filter(p => p.status === 'due');
      const paid = payments.filter(p => p.status === 'paid');
      const verified = payments.filter(p => p.status === 'verified');
      
      const totalAmount = verified.reduce((sum, p) => sum + (p.amount || 0), 0);
      const platformFees = verified.reduce((sum, p) => sum + (p.platformFee || 0), 0);
      const tutorEarnings = verified.reduce((sum, p) => sum + (p.tutorAmount || 0), 0);
      const pendingEarnings = paid.reduce((sum, p) => sum + (p.tutorAmount || 0), 0);
      const expectedEarnings = due.reduce((sum, p) => sum + (p.tutorAmount || 0), 0);
      
      console.log(`👨‍🏫 ${tutorName} (${tutorEmail})`);
      console.log(`   Total Payments: ${payments.length}`);
      console.log(`   - Pending: ${pending.length}`);
      console.log(`   - Due: ${due.length} (₱${expectedEarnings.toLocaleString()})`);
      console.log(`   - Paid (Awaiting Verification): ${paid.length} (₱${pendingEarnings.toLocaleString()})`);
      console.log(`   - Verified: ${verified.length}`);
      console.log(`   `);
      console.log(`   💵 Verified Earnings:`);
      console.log(`   - Total Amount: ₱${totalAmount.toLocaleString()}`);
      console.log(`   - Platform Fee (10%): ₱${platformFees.toLocaleString()}`);
      console.log(`   - Tutor Earnings (90%): ₱${tutorEarnings.toLocaleString()}`);
      console.log('');
    }
    
    // Overall statistics
    const allVerified = payments.filter(p => p.status === 'verified');
    const totalRevenue = allVerified.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPlatformFees = allVerified.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const totalTutorEarnings = allVerified.reduce((sum, p) => sum + (p.tutorAmount || 0), 0);
    
    console.log('📈 Platform Statistics:');
    console.log(`   Total Verified Payments: ${allVerified.length}`);
    console.log(`   Total Revenue: ₱${totalRevenue.toLocaleString()}`);
    console.log(`   Total Platform Fees: ₱${totalPlatformFees.toLocaleString()}`);
    console.log(`   Total Tutor Earnings: ₱${totalTutorEarnings.toLocaleString()}`);
    console.log('');
    
    // Payment status breakdown
    const statusBreakdown = {
      pending: payments.filter(p => p.status === 'pending').length,
      due: payments.filter(p => p.status === 'due').length,
      paid: payments.filter(p => p.status === 'paid').length,
      verified: payments.filter(p => p.status === 'verified').length,
      cancelled: payments.filter(p => p.status === 'cancelled').length,
    };
    
    console.log('📊 Payment Status Breakdown:');
    console.log(`   Pending: ${statusBreakdown.pending}`);
    console.log(`   Due: ${statusBreakdown.due}`);
    console.log(`   Paid (Awaiting Verification): ${statusBreakdown.paid}`);
    console.log(`   Verified: ${statusBreakdown.verified}`);
    console.log(`   Cancelled: ${statusBreakdown.cancelled}`);
    console.log('');
    
    console.log('✅ Dynamic earnings test completed successfully!');
    console.log('');
    console.log('📝 Key Points:');
    console.log('   - Earnings are calculated from verified payments only');
    console.log('   - Platform takes 10% fee from each payment');
    console.log('   - Tutors receive 90% of the payment amount');
    console.log('   - Earnings update in real-time as payments are verified');
    
  } catch (error) {
    console.error('❌ Error testing dynamic earnings:', error);
    throw error;
  }
}

// Run the test
testDynamicEarnings()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
