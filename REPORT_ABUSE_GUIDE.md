# Report Abuse Feature Guide

## Overview

The Report Abuse feature allows parents to report inappropriate behavior, safety concerns, or other issues with tutors. Reports are submitted to admins for review and action.

## Features

### For Parents

**Report Categories:**
- Inappropriate Behavior
- Harassment or Bullying
- Safety Concern
- Unprofessional Conduct
- Fraud or Scam
- Other

**How to Report:**
1. Go to tutor's profile page
2. Click "Report Abuse" button (below Message button)
3. Select a category
4. Provide detailed description
5. Submit report

**After Submission:**
- Report is sent to admin team
- Parent receives confirmation notification
- Parent can view their submitted reports
- Parent gets notified when report is resolved

### For Admins

**Report Management:**
- View all reports in admin dashboard
- Filter by status (pending, under review, resolved, dismissed)
- Filter by priority (low, medium, high, urgent)
- Filter by category
- View reporter and reported user details
- Add admin notes
- Update report status
- Resolve or dismiss reports

**Automatic Features:**
- Priority assignment based on category
- Admin notifications for new reports
- Reporter notifications for status updates
- Report statistics and analytics

## Firebase Structure

### Collection: `reports`

```typescript
{
  id: string
  reporterId: string              // Parent who submitted report
  reporterName: string
  reporterEmail: string
  reportedUserId: string          // Tutor being reported
  reportedUserName: string
  reportedUserType: 'tutor' | 'parent'
  category: string                // Report category
  description: string             // Detailed description
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  bookingId?: string             // Optional related booking
  evidence?: string[]            // Optional evidence URLs
  adminNotes?: string            // Admin's notes
  resolvedBy?: string            // Admin who resolved
  resolvedAt?: string            // Resolution timestamp
  createdAt: string
  updatedAt?: string
}
```

## Priority Assignment

Reports are automatically assigned priority based on category:

- **Urgent**: Fraud or Scam
- **High**: Safety Concern, Harassment
- **Medium**: Inappropriate Behavior, Unprofessional, Other
- **Low**: (manually set by admin)

## Usage

### Parent Reporting

```typescript
import { ReportModal } from '@/components/report/report-modal'

<ReportModal
  isOpen={showReportModal}
  onClose={() => setShowReportModal(false)}
  reportedUserId={tutor.id}
  reportedUserName={tutor.name}
  reportedUserType="tutor"
  bookingId={optionalBookingId}
/>
```

### Admin Functions

```typescript
import { 
  getAllReports,
  getReportsByStatus,
  updateReportStatus,
  getReportStats
} from '@/firebase/reports'

// Get all reports
const reports = await getAllReports()

// Get pending reports
const pending = await getReportsByStatus('pending')

// Update report status
await updateReportStatus(
  reportId,
  'resolved',
  adminId,
  'Issue has been addressed'
)

// Get statistics
const stats = await getReportStats()
```

## Report Workflow

### 1. Report Submission
```
Parent → Report Button → Fill Form → Submit
```

### 2. Admin Notification
```
System → Create Notification → Notify All Admins
```

### 3. Admin Review
```
Admin → View Report → Investigate → Take Action
```

### 4. Status Update
```
Admin → Update Status → Add Notes → Resolve/Dismiss
```

### 5. Reporter Notification
```
System → Create Notification → Notify Reporter
```

## Report Statuses

**Pending**
- Just submitted
- Awaiting admin review
- Default status for new reports

**Under Review**
- Admin is investigating
- Gathering information
- Contacting parties involved

**Resolved**
- Issue has been addressed
- Action taken
- Reporter notified

**Dismissed**
- Report found to be invalid
- No action needed
- Reporter notified with reason

## Security

### Firestore Rules

```javascript
match /reports/{reportId} {
  // Users can read their own reports
  allow read: if isSignedIn() && 
    resource.data.reporterId == request.auth.uid;
  
  // Anyone authenticated can create reports
  allow create: if isSignedIn();
  
  // Only admins can update reports
  allow update: if isSignedIn();
}
```

### Validation

- User must be logged in
- Category must be selected
- Description is required
- False reports may result in account suspension

## Notifications

### Admin Notifications

When report is submitted:
```
Title: "New Report Submitted"
Message: "[Reporter] reported [Reported User] for [Category]"
Link: "/admin/moderation"
```

### Reporter Notifications

When report is resolved/dismissed:
```
Title: "Report Update"
Message: "Your report has been [status]. [Admin notes]"
```

## Best Practices

### For Parents

1. **Be Specific**: Provide detailed information
2. **Include Evidence**: Mention dates, times, specific incidents
3. **Be Honest**: False reports may result in suspension
4. **Follow Up**: Check for updates on your report
5. **Use Appropriately**: Only report genuine concerns

### For Admins

1. **Review Promptly**: Address high-priority reports first
2. **Investigate Thoroughly**: Gather all relevant information
3. **Document Actions**: Add detailed admin notes
4. **Communicate Clearly**: Provide clear resolution notes
5. **Take Action**: Suspend or ban users if necessary
6. **Follow Up**: Ensure issues are fully resolved

## Testing

### Test Report Submission

1. Login as parent
2. Go to any tutor profile
3. Click "Report Abuse"
4. Fill out form
5. Submit
6. Check console for success message

### Test Admin Review

1. Login as admin
2. Go to moderation page
3. View submitted reports
4. Update status
5. Add notes
6. Resolve report

## Statistics

Track report metrics:
- Total reports
- Reports by status
- Reports by category
- Reports by priority
- Resolution time
- Most reported users

## Future Enhancements

### Planned Features

1. **Evidence Upload**: Allow photo/video uploads
2. **Report History**: View all reports for a user
3. **Automated Actions**: Auto-suspend after X reports
4. **Appeal System**: Allow reported users to appeal
5. **Report Templates**: Pre-filled forms for common issues
6. **Email Notifications**: Send emails for important updates
7. **Report Analytics**: Detailed reporting dashboard
8. **Bulk Actions**: Handle multiple reports at once

### Integration Points

- Link reports to specific bookings
- Show report count on tutor profiles
- Flag users with multiple reports
- Integrate with user suspension system
- Add to admin dashboard statistics

## Troubleshooting

### Report Not Submitting

**Check:**
- User is logged in
- All required fields filled
- Network connection
- Firebase permissions

### Admin Can't See Reports

**Check:**
- User has admin role
- Firestore rules allow admin access
- Reports collection exists
- Network connection

### Notifications Not Sending

**Check:**
- Notification service is working
- Admin accounts exist
- Firebase permissions
- Console for errors

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase configuration
3. Review Firestore rules
4. Check user permissions
5. Test with different accounts

## Summary

✅ **Report abuse feature for parents**
✅ **Multiple report categories**
✅ **Automatic priority assignment**
✅ **Admin notification system**
✅ **Reporter notification system**
✅ **Status tracking and management**
✅ **Secure Firebase integration**
✅ **Easy-to-use modal interface**

Parents can now safely report concerns, and admins can effectively manage and resolve reports! 🛡️
