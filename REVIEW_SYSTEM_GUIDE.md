# Review System Guide

## Overview

The review system allows parents to rate and review tutors after sessions. Reviews include a 1-5 star rating and written feedback, helping other parents make informed decisions.

## Features

### For Parents

**Leave Reviews:**
- Rate tutors from 1 to 5 stars
- Write detailed feedback
- One review per tutor (prevents spam)
- Reviews are public and visible to all users

**Review Guidelines:**
- Be honest and constructive
- Focus on your experience
- Avoid personal attacks
- Keep it relevant to tutoring

### For Tutors

**Receive Reviews:**
- Get notified when reviewed
- Reviews displayed on profile
- Average rating calculated automatically
- Rating distribution shown

**Rating Impact:**
- Average rating updates automatically
- Review count displayed
- Helps attract more parents
- Builds credibility

### For Everyone

**View Reviews:**
- See all reviews for any tutor
- View rating distribution (5-star breakdown)
- See average rating
- Read detailed feedback
- Sort by date (newest first)

## Firebase Structure

### Collection: `reviews`

```typescript
{
  id: string
  tutorId: string                // Tutor being reviewed
  tutorName: string
  parentId: string               // Parent who wrote review
  parentName: string
  rating: number                 // 1-5 stars
  comment: string                // Written feedback
  bookingId?: string            // Optional related booking
  createdAt: string             // ISO timestamp
  updatedAt?: string            // ISO timestamp
}
```

### Tutor Document Updates

When reviews are added/updated/deleted, the tutor document is automatically updated:

```typescript
{
  rating: number                // Average rating (0-5, 1 decimal)
  reviewCount: number           // Total number of reviews
}
```

## Components

### ReviewModal

Modal for submitting reviews:

```typescript
<ReviewModal
  isOpen={showReviewModal}
  onClose={() => setShowReviewModal(false)}
  tutorId={tutor.id}
  tutorName={tutor.name}
  bookingId={optionalBookingId}
  onReviewSubmitted={() => loadReviews()}
/>
```

**Features:**
- Interactive star rating (hover effects)
- Text area for comments
- Character counter (500 max)
- Review guidelines
- Validation
- Loading states

### ReviewList

Display list of reviews:

```typescript
<ReviewList reviews={reviews} />
```

**Features:**
- Shows all reviews
- Parent name and avatar
- Star rating display
- Review date
- Comment text
- Empty state

### RatingSummary

Display rating statistics:

```typescript
<RatingSummary
  averageRating={4.5}
  totalReviews={25}
  ratingDistribution={{
    5: 15,
    4: 7,
    3: 2,
    2: 1,
    1: 0
  }}
/>
```

**Features:**
- Large average rating display
- Star visualization
- Total review count
- Rating distribution bars
- Percentage calculations

## Usage

### Submit a Review

```typescript
import { addReview } from '@/firebase/reviews'

await addReview({
  tutorId: 'tutor123',
  tutorName: 'John Doe',
  parentId: user.id,
  parentName: user.name,
  rating: 5,
  comment: 'Excellent tutor!',
  bookingId: 'booking456', // optional
  createdAt: new Date().toISOString()
})
```

### Load Reviews

```typescript
import { getReviewsByTutorId, getTutorReviewStats } from '@/firebase/reviews'

// Get all reviews for a tutor
const reviews = await getReviewsByTutorId(tutorId)

// Get rating statistics
const stats = await getTutorReviewStats(tutorId)
// Returns: { totalReviews, averageRating, ratingDistribution }
```

### Check if Already Reviewed

```typescript
import { checkIfParentReviewedTutor } from '@/firebase/reviews'

const hasReviewed = await checkIfParentReviewedTutor(parentId, tutorId)
```

## Automatic Features

### Rating Calculation

When a review is added, updated, or deleted:

1. **Fetch all reviews** for the tutor
2. **Calculate average** rating
3. **Round to 1 decimal** place
4. **Update tutor document** with new rating and count

```typescript
// Automatic on review changes
await updateTutorRating(tutorId)
```

### Notifications

**Tutor Notification:**
When a parent submits a review:
```
Title: "New Review"
Message: "[Parent Name] left you a [X]-star review"
```

### Validation

**Prevents:**
- Multiple reviews from same parent
- Reviews without rating
- Reviews without comment
- Invalid ratings (< 1 or > 5)

## Review Workflow

### 1. Parent Completes Session
```
Parent → Completes Booking → Can Write Review
```

### 2. Write Review
```
Parent → Click "Write a Review" → Fill Form → Submit
```

### 3. Review Saved
```
System → Save to Firestore → Update Tutor Rating
```

### 4. Tutor Notified
```
System → Create Notification → Notify Tutor
```

### 5. Review Displayed
```
System → Show on Tutor Profile → Visible to All
```

## Rating Distribution

Shows breakdown of ratings:

```
5 ⭐ ████████████████████ 15
4 ⭐ ████████████         7
3 ⭐ ███                  2
2 ⭐ █                    1
1 ⭐                      0
```

Calculated as:
- Count reviews for each rating (1-5)
- Calculate percentage of total
- Display as progress bars

## Security

### Firestore Rules

```javascript
match /reviews/{reviewId} {
  // Anyone can read reviews (public)
  allow read: if true;
  
  // Only authenticated users can create
  allow create: if isSignedIn();
  
  // Users can update their own reviews
  allow update: if isSignedIn() && 
    resource.data.parentId == request.auth.uid;
  
  // Users can delete their own reviews
  allow delete: if isSignedIn() && 
    resource.data.parentId == request.auth.uid;
}
```

### Validation

- User must be logged in
- Rating must be 1-5
- Comment is required
- One review per parent per tutor
- Cannot review yourself

## Best Practices

### For Parents

1. **Be Specific**: Mention what you liked/disliked
2. **Be Fair**: Consider the full experience
3. **Be Constructive**: Help others make decisions
4. **Be Honest**: Share your genuine experience
5. **Be Respectful**: Avoid personal attacks

### For Tutors

1. **Respond Professionally**: Thank reviewers
2. **Learn from Feedback**: Improve based on reviews
3. **Don't Take it Personally**: Use criticism constructively
4. **Maintain Quality**: Good reviews come from good service
5. **Encourage Reviews**: Ask satisfied parents to review

## Testing

### Test Review Submission

1. Login as parent
2. Go to tutor profile
3. Click "Write a Review"
4. Select rating (1-5 stars)
5. Write comment
6. Submit
7. Check tutor profile for new review

### Test Rating Calculation

1. Submit multiple reviews
2. Check tutor's average rating
3. Verify it's calculated correctly
4. Check rating distribution
5. Verify review count

### Test Duplicate Prevention

1. Submit a review
2. Try to submit another for same tutor
3. Should show error message
4. Review count should not increase

## Statistics

Track review metrics:
- Total reviews
- Average rating
- Rating distribution
- Reviews per tutor
- Most reviewed tutors
- Highest rated tutors

## Future Enhancements

### Planned Features

1. **Review Responses**: Let tutors respond to reviews
2. **Helpful Votes**: Let users mark reviews as helpful
3. **Review Photos**: Allow photo uploads
4. **Verified Reviews**: Mark reviews from confirmed bookings
5. **Review Filters**: Filter by rating, date, etc.
6. **Review Reports**: Report inappropriate reviews
7. **Review Editing**: Allow parents to edit reviews
8. **Review Reminders**: Remind parents to review after sessions

### Integration Points

- Link reviews to specific bookings
- Show review prompt after completed sessions
- Display recent reviews on dashboard
- Include reviews in tutor search/filter
- Add review stats to admin dashboard

## Troubleshooting

### Review Not Submitting

**Check:**
- User is logged in
- Rating is selected
- Comment is filled
- Haven't already reviewed this tutor
- Network connection

### Rating Not Updating

**Check:**
- Review was successfully saved
- updateTutorRating function ran
- Tutor document has rating field
- Console for errors

### Reviews Not Displaying

**Check:**
- Reviews exist in Firestore
- getReviewsByTutorId is working
- Component is receiving data
- No console errors

## Summary

✅ **5-star rating system**
✅ **Written feedback/comments**
✅ **One review per parent per tutor**
✅ **Automatic rating calculation**
✅ **Rating distribution display**
✅ **Tutor notifications**
✅ **Public reviews (anyone can read)**
✅ **Secure Firebase integration**
✅ **Beautiful UI components**
✅ **Validation and error handling**

Parents can now share their experiences and help others make informed decisions! ⭐
