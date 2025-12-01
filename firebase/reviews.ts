import { 
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

const REVIEWS_COLLECTION = 'reviews';

export interface Review {
  id?: string;
  tutorId: string;
  tutorName: string;
  parentId: string;
  parentName: string;
  rating: number; // 1-5
  comment: string;
  bookingId?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getAllReviews() {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const snapshot = await getDocs(reviewsRef);
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    
    // Sort by createdAt (newest first)
    return reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

export async function getReviewById(reviewId: string) {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (reviewSnap.exists()) {
      return {
        id: reviewSnap.id,
        ...reviewSnap.data()
      } as Review;
    }
    return null;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
}

export async function getReviewsByTutorId(tutorId: string) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('tutorId', '==', tutorId)
    );
    const snapshot = await getDocs(q);
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    
    // Sort by createdAt (newest first)
    return reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reviews by tutor:', error);
    throw error;
  }
}

export async function getReviewsByParentId(parentId: string) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('parentId', '==', parentId)
    );
    const snapshot = await getDocs(q);
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    
    // Sort by createdAt (newest first)
    return reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reviews by parent:', error);
    throw error;
  }
}

export async function checkIfParentReviewedTutor(parentId: string, tutorId: string) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('parentId', '==', parentId),
      where('tutorId', '==', tutorId)
    );
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if parent reviewed tutor:', error);
    return false;
  }
}

export async function addReview(reviewData: Omit<Review, 'id'>) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    
    // Check if parent already reviewed this tutor
    const alreadyReviewed = await checkIfParentReviewedTutor(
      reviewData.parentId,
      reviewData.tutorId
    );
    
    if (alreadyReviewed) {
      throw new Error('You have already reviewed this tutor');
    }
    
    // Remove undefined fields (Firebase doesn't accept them)
    const cleanData: any = {
      tutorId: reviewData.tutorId,
      tutorName: reviewData.tutorName,
      parentId: reviewData.parentId,
      parentName: reviewData.parentName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Only add bookingId if it's defined
    if (reviewData.bookingId) {
      cleanData.bookingId = reviewData.bookingId;
    }
    
    const docRef = await addDoc(reviewsRef, cleanData);
    
    // Update tutor's average rating
    await updateTutorRating(reviewData.tutorId);
    
    // Create notification for tutor
    try {
      const { addNotification } = await import('./notifications');
      await addNotification({
        userId: reviewData.tutorId,
        type: 'system',
        title: 'New Review',
        message: `${reviewData.parentName} left you a ${reviewData.rating}-star review`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (notifError) {
      console.error('Error creating review notification:', notifError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

export async function updateReview(reviewId: string, reviewData: Partial<Review>) {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: new Date().toISOString()
    });
    
    // Update tutor's average rating if rating changed
    if (reviewData.rating !== undefined) {
      const review = await getReviewById(reviewId);
      if (review) {
        await updateTutorRating(review.tutorId);
      }
    }
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const review = await getReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);
    
    // Update tutor's average rating
    await updateTutorRating(review.tutorId);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

// Calculate and update tutor's average rating
export async function updateTutorRating(tutorId: string) {
  try {
    const reviews = await getReviewsByTutorId(tutorId);
    
    if (reviews.length === 0) {
      // No reviews, set rating to 0
      const { updateTutor } = await import('./tutors');
      await updateTutor(tutorId, { 
        rating: 0,
        reviewCount: 0
      });
      return;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Round to 1 decimal place
    const roundedRating = Math.round(averageRating * 10) / 10;
    
    // Update tutor document
    const { updateTutor } = await import('./tutors');
    await updateTutor(tutorId, { 
      rating: roundedRating,
      reviewCount: reviews.length
    });
    
    console.log(`✅ Updated tutor ${tutorId} rating to ${roundedRating} (${reviews.length} reviews)`);
  } catch (error) {
    console.error('Error updating tutor rating:', error);
    throw error;
  }
}

// Get review statistics for a tutor
export async function getTutorReviewStats(tutorId: string) {
  try {
    const reviews = await getReviewsByTutorId(tutorId);
    
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };
    
    return {
      totalReviews: reviews.length,
      averageRating,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error getting tutor review stats:', error);
    throw error;
  }
}
