import { 
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Payment } from './payments';

const PAYMENTS_COLLECTION = 'payments';

/**
 * Tutor Payout System
 * 
 * Flow:
 * 1. Parent pays PTLC → Payment status: 'verified'
 * 2. PTLC processes tutor payout → tutorPayoutStatus: 'processing'
 * 3. PTLC pays tutor → tutorPayoutStatus: 'paid'
 * 
 * Tutors only see earnings when tutorPayoutStatus is 'paid'
 */

// Get payments ready for tutor payout (verified but not yet paid to tutor)
export async function getPaymentsReadyForPayout() {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('status', '==', 'verified'),
      where('tutorPayoutStatus', 'in', ['pending', null])
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching payments ready for payout:', error);
    throw error;
  }
}

// Get tutor's paid earnings (only payments where PTLC has paid the tutor)
export async function getTutorPaidEarnings(tutorId: string) {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('tutorId', '==', tutorId),
      where('tutorPayoutStatus', '==', 'paid'),
      orderBy('tutorPayoutDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching tutor paid earnings:', error);
    throw error;
  }
}

// Get tutor's pending payouts (verified by parent but not yet paid by PTLC)
export async function getTutorPendingPayouts(tutorId: string) {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('tutorId', '==', tutorId),
      where('status', '==', 'verified')
    );
    const snapshot = await getDocs(q);
    
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
    
    // Filter for payments not yet paid to tutor
    return payments.filter(p => 
      !p.tutorPayoutStatus || 
      p.tutorPayoutStatus === 'pending' || 
      p.tutorPayoutStatus === 'processing'
    );
  } catch (error) {
    console.error('Error fetching tutor pending payouts:', error);
    throw error;
  }
}

// Mark payout as processing (admin initiated payout)
export async function markPayoutAsProcessing(
  paymentId: string,
  notes?: string
) {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      tutorPayoutStatus: 'processing',
      tutorPayoutNotes: notes,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Payout marked as processing');
  } catch (error) {
    console.error('❌ Error marking payout as processing:', error);
    throw error;
  }
}

// Mark payout as paid (PTLC has paid the tutor)
export async function markPayoutAsPaid(
  paymentId: string,
  payoutMethod: 'gcash' | 'bank_transfer' | 'cash',
  payoutReference?: string,
  notes?: string
) {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      tutorPayoutStatus: 'paid',
      tutorPayoutMethod: payoutMethod,
      tutorPayoutReference: payoutReference,
      tutorPayoutDate: new Date().toISOString(),
      tutorPayoutNotes: notes,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Payout marked as paid');
    
    // Create notification for tutor
    try {
      const { createNotification } = await import('./notifications');
      const payment = await import('./payments').then(m => m.getPaymentById(paymentId));
      
      if (payment) {
        await createNotification({
          userId: payment.tutorId,
          type: 'payment_received',
          title: 'Payment Received',
          message: `You received ₱${payment.tutorAmount.toLocaleString()} from PTLC for your session with ${payment.childName}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (notifError) {
      console.error('Error creating payout notification:', notifError);
    }
  } catch (error) {
    console.error('❌ Error marking payout as paid:', error);
    throw error;
  }
}

// Batch process payouts (admin pays multiple tutors at once)
export async function batchProcessPayouts(
  paymentIds: string[],
  payoutMethod: 'gcash' | 'bank_transfer' | 'cash',
  notes?: string
) {
  try {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    for (const paymentId of paymentIds) {
      try {
        await markPayoutAsPaid(paymentId, payoutMethod, undefined, notes);
        results.success.push(paymentId);
      } catch (error) {
        results.failed.push({
          id: paymentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Batch payout completed: ${results.success.length} success, ${results.failed.length} failed`);
    return results;
  } catch (error) {
    console.error('❌ Error processing batch payouts:', error);
    throw error;
  }
}

// Calculate tutor earnings summary
export async function getTutorEarningsSummary(tutorId: string) {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('tutorId', '==', tutorId),
      where('status', '==', 'verified')
    );
    const snapshot = await getDocs(q);
    
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
    
    const paidPayments = payments.filter(p => p.tutorPayoutStatus === 'paid');
    const pendingPayments = payments.filter(p => 
      !p.tutorPayoutStatus || 
      p.tutorPayoutStatus === 'pending' || 
      p.tutorPayoutStatus === 'processing'
    );
    
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
    
    return {
      totalPaid,
      totalPending,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      paidPayments,
      pendingPayments
    };
  } catch (error) {
    console.error('Error calculating tutor earnings summary:', error);
    throw error;
  }
}

// Get all tutors with pending payouts (for admin)
export async function getAllTutorsWithPendingPayouts() {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('status', '==', 'verified')
    );
    const snapshot = await getDocs(q);
    
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
    
    // Filter for pending payouts
    const pendingPayouts = payments.filter(p => 
      !p.tutorPayoutStatus || 
      p.tutorPayoutStatus === 'pending' || 
      p.tutorPayoutStatus === 'processing'
    );
    
    // Group by tutor
    const tutorPayouts = new Map<string, {
      tutorId: string;
      tutorName: string;
      tutorEmail: string;
      totalAmount: number;
      paymentCount: number;
      payments: Payment[];
    }>();
    
    pendingPayouts.forEach(payment => {
      const existing = tutorPayouts.get(payment.tutorId);
      if (existing) {
        existing.totalAmount += payment.tutorAmount;
        existing.paymentCount += 1;
        existing.payments.push(payment);
      } else {
        tutorPayouts.set(payment.tutorId, {
          tutorId: payment.tutorId,
          tutorName: payment.tutorName,
          tutorEmail: payment.tutorEmail,
          totalAmount: payment.tutorAmount,
          paymentCount: 1,
          payments: [payment]
        });
      }
    });
    
    return Array.from(tutorPayouts.values());
  } catch (error) {
    console.error('Error fetching tutors with pending payouts:', error);
    throw error;
  }
}
