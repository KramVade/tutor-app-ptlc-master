# Tutor Approval System

## Overview

Implemented a tutor approval system where new tutor accounts require admin approval before they can access the platform and accept sessions.

## How It Works

### Registration Flow

```
Tutor Signs Up → Account Created (approved: false) → Pending Approval Page → Admin Approves → Full Access
```

### Key Features

1. **Automatic Pending Status**: New tutors are automatically set to `approved: false`
2. **Pending Approval Page**: Tutors see a waiting page instead of dashboard
3. **Admin Approval Interface**: Admins can approve or reject tutors
4. **Notifications**: Tutors receive notifications when approved/rejected
5. **Access Control**: Unapproved tutors cannot access tutor features

## Database Changes

### Tutor Document Fields

```typescript
{
  // Existing fields...
  approved: boolean,          // false by default for new tutors
  rejected: boolean,          // true if admin rejects
  approvedBy?: string,        // Admin ID who approved
  approvedAt?: string,        // Approval timestamp
  rejectedBy?: string,        // Admin ID who rejected
  rejectedAt?: string,        // Rejection timestamp
  rejectionReason?: string    // Optional reason for rejection
}
```

## User Experience

### For Tutors

#### 1. Sign Up
- Tutor creates account with email, password, name
- Account is created with `approved: false`
- Automatically redirected to pending approval page

#### 2. Pending Approval Page (`/tutor/pending-approval`)
- Clean, informative waiting page
- Explains the approval process
- Shows timeline (24-48 hours)
- Provides contact information
- Logout option available

#### 3. After Approval
- Receives notification
- Can log in normally
- Full access to tutor dashboard and features

#### 4. If Rejected
- Receives notification with reason (if provided)
- Can contact support for clarification

### For Admins

#### Admin Tutors Page (`/admin/tutors`)

**Three Tabs:**
1. **Pending** - Tutors awaiting approval
2. **Approved** - Active tutors
3. **Rejected** - Rejected applications

**Actions:**
- **Approve**: Marks tutor as approved, sends notification
- **Reject**: Marks as rejected, prompts for reason, sends notification
- **View**: See full tutor profile

## Implementation Details

### Firebase Functions

#### `firebase/tutors.ts`

```typescript
// Get pending tutors
getPendingTutors()

// Get approved tutors
getApprovedTutors()

// Approve a tutor
approveTutor(tutorId, approvedBy)

// Reject a tutor
rejectTutor(tutorId, rejectedBy, reason?)
```

### Auth Context Updates

#### `lib/context/auth-context.tsx`

**Login:**
- Checks if tutor is approved
- If not approved, sets pending flag in localStorage
- Redirects to pending approval page

**Signup:**
- Sets `approved: false` for new tutors
- Sets pending flag in localStorage
- Creates account but restricts access

**Logout:**
- Clears pending approval flag

### Route Protection

#### `app/tutor/dashboard/page.tsx`

```typescript
useEffect(() => {
  // Check if tutor is pending approval
  const isPending = localStorage.getItem("ptlcDigitalCoach_pendingApproval")
  if (isPending === "true") {
    router.push("/tutor/pending-approval")
  }
}, [user])
```

## Admin Workflow

### Approving a Tutor

1. Go to `/admin/tutors`
2. Click "Pending" tab
3. Review tutor information
4. Click "Approve" button
5. System:
   - Updates `approved: true`
   - Records `approvedBy` and `approvedAt`
   - Sends notification to tutor
   - Removes from pending list

### Rejecting a Tutor

1. Go to `/admin/tutors`
2. Click "Pending" tab
3. Review tutor information
4. Click "Reject" button
5. Enter rejection reason (optional)
6. System:
   - Updates `rejected: true`
   - Records `rejectedBy`, `rejectedAt`, `rejectionReason`
   - Sends notification to tutor with reason
   - Moves to rejected list

### Batch Operations

Currently not supported, but could be added:
- Select multiple tutors
- Approve/reject in batch
- Bulk notifications

## Notifications

### Approval Notification
```
Title: "Account Approved!"
Message: "Your tutor account has been approved. You can now start accepting sessions."
Type: system
```

### Rejection Notification
```
Title: "Account Application Update"
Message: "Your tutor application was not approved. Reason: [reason]"
Type: system
```

## Security Considerations

### Access Control

1. **Unapproved tutors cannot:**
   - Access tutor dashboard
   - View or accept bookings
   - Message parents
   - Update availability
   - See earnings

2. **Unapproved tutors can:**
   - View pending approval page
   - Log out
   - Contact support

### Data Protection

- Approval status stored in Firestore
- Admin actions logged (approvedBy, rejectedBy)
- Timestamps recorded for audit trail

## Testing

### Test Scenarios

1. **New Tutor Signup**
   - Sign up as tutor
   - Verify redirected to pending page
   - Check cannot access dashboard

2. **Admin Approval**
   - Log in as admin
   - Go to tutors page
   - Approve pending tutor
   - Verify notification sent

3. **Tutor Login After Approval**
   - Log in as approved tutor
   - Verify full dashboard access
   - Check no pending flag

4. **Admin Rejection**
   - Reject a tutor with reason
   - Verify notification includes reason
   - Check tutor moved to rejected tab

## Future Enhancements

### Possible Improvements

1. **Email Notifications**
   - Send email when approved/rejected
   - Include next steps in email

2. **Document Upload**
   - Require tutors to upload credentials
   - Admin reviews documents before approval

3. **Verification Checklist**
   - Background check status
   - Credential verification
   - Reference checks

4. **Auto-Approval**
   - Set criteria for automatic approval
   - Manual review for edge cases

5. **Appeal Process**
   - Allow rejected tutors to appeal
   - Resubmit application with corrections

6. **Approval Workflow**
   - Multi-step approval process
   - Different admin roles (reviewer, approver)

7. **Analytics**
   - Track approval rates
   - Average approval time
   - Rejection reasons analysis

## Troubleshooting

### Tutor Stuck on Pending Page

**Problem**: Tutor approved but still sees pending page

**Solution**:
1. Check Firestore - verify `approved: true`
2. Clear localStorage
3. Log out and log in again
4. Check browser console for errors

### Admin Cannot See Pending Tutors

**Problem**: Pending tab is empty but tutors exist

**Solution**:
1. Check Firestore query
2. Verify `approved: false` in database
3. Check console for errors
4. Refresh the page

### Notification Not Received

**Problem**: Tutor approved but no notification

**Solution**:
1. Check notifications collection in Firestore
2. Verify userId matches
3. Check notification context is working
4. Manually add notification if needed

## Best Practices

### For Admins

1. **Review Promptly**: Aim for 24-48 hour turnaround
2. **Provide Reasons**: Always explain rejections
3. **Be Thorough**: Check credentials carefully
4. **Communicate**: Reach out if more info needed
5. **Document**: Keep notes on approval decisions

### For Development

1. **Test Both Paths**: Test approval and rejection flows
2. **Handle Edge Cases**: What if admin account is deleted?
3. **Audit Trail**: Log all approval actions
4. **Error Handling**: Graceful failures
5. **User Feedback**: Clear messages at each step

## Summary

The tutor approval system provides:
- ✅ Quality control for tutor onboarding
- ✅ Admin oversight of new tutors
- ✅ Clear communication with applicants
- ✅ Audit trail of approval decisions
- ✅ Flexible approval/rejection workflow
- ✅ Professional onboarding experience

This ensures only qualified, verified tutors can access the platform and interact with parents and students.
