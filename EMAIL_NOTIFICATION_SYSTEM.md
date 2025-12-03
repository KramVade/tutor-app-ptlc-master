# Email Notification System

## Overview

Implemented automated email notifications for tutor approval/rejection using Gmail SMTP with Nodemailer.

## Configuration

### Gmail Account
- **Email**: kramvade21@gmail.com
- **Display Name**: PTLC Digital Coach
- **Password**: w4l44k0p455

### Environment Variables

Add to `.env.local`:
```env
EMAIL_USER=kramvade21@gmail.com
EMAIL_PASSWORD=w4l44k0p455
EMAIL_FROM_NAME=PTLC Digital Coach
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Implementation

### 1. Email Service (`lib/email/email-service.ts`)

**Features:**
- Nodemailer transporter configuration
- Reusable email sending function
- Pre-built email templates
- HTML and text versions

**Functions:**
```typescript
sendEmail(options: EmailOptions)
emailTemplates.tutorApproved(tutorName)
emailTemplates.tutorRejected(tutorName, reason?)
```

### 2. API Route (`app/api/send-email/route.ts`)

**Endpoint:** `POST /api/send-email`

**Request Body:**
```json
{
  "type": "tutor_approved" | "tutor_rejected",
  "to": "tutor@example.com",
  "tutorName": "John Doe",
  "reason": "Optional rejection reason"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message-id-from-gmail"
}
```

### 3. Admin Integration

Updated `app/admin/tutors/page.tsx`:
- Sends email when approving tutor
- Sends email when rejecting tutor
- Includes in-app notification + email
- Graceful error handling (approval/rejection succeeds even if email fails)

## Email Templates

### Approval Email

**Subject:** "Welcome to PTLC Digital Coach - Your Account is Approved! 🎉"

**Content:**
- Congratulations message
- Login button/link
- Next steps checklist:
  - Complete profile
  - Set availability
  - Upload photo
  - Review guidelines
- What tutors can do now
- Payment information (90%, monthly payouts)
- Support contact info

**Design:**
- Professional gradient header
- Clean, readable layout
- Call-to-action button
- Responsive design
- Footer with contact info

### Rejection Email

**Subject:** "PTLC Digital Coach - Application Update"

**Content:**
- Polite rejection message
- Reason for rejection (if provided)
- What applicant can do:
  - Review requirements
  - Address concerns
  - Contact support
  - Reapply later
- Support contact info

**Design:**
- Neutral, professional tone
- Highlighted reason box (if provided)
- Helpful next steps
- Contact information

## Usage

### Approving a Tutor

```typescript
// In admin interface
await approveTutor(tutorId, adminId)

// Email automatically sent to tutor
// Subject: Welcome to PTLC Digital Coach...
// Content: Approval email with next steps
```

### Rejecting a Tutor

```typescript
// In admin interface
await rejectTutor(tutorId, adminId, reason)

// Email automatically sent to tutor
// Subject: Application Update
// Content: Rejection email with reason
```

## Gmail Setup

### Important: App Password Required

Gmail requires an "App Password" for third-party applications:

1. **Enable 2-Factor Authentication** on the Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords
   - Generate new app password
   - Use this password in EMAIL_PASSWORD

### Current Setup

The provided credentials should work if:
- 2FA is enabled on kramvade21@gmail.com
- The password is an app password (not regular password)
- "Less secure app access" is enabled (if using regular password)

### Troubleshooting Gmail

If emails aren't sending:

1. **Check Gmail Settings**:
   - 2FA enabled?
   - App password generated?
   - IMAP/SMTP enabled?

2. **Test Credentials**:
   ```bash
   # Try logging in to Gmail manually
   # Verify credentials work
   ```

3. **Check Error Logs**:
   - Server console for error messages
   - Gmail may block suspicious activity

4. **Alternative: Use App Password**:
   - More secure than regular password
   - Recommended by Google
   - Required for 2FA accounts

## Testing

### Test Email Sending

1. **Approve a Test Tutor**:
   - Create test tutor account
   - Log in as admin
   - Approve the tutor
   - Check tutor's email inbox

2. **Reject a Test Tutor**:
   - Create another test tutor
   - Log in as admin
   - Reject with reason
   - Check tutor's email inbox

3. **Check Logs**:
   ```
   ✅ Email sent: <message-id>
   ✅ Approval email sent to: tutor@example.com
   ```

### Manual API Test

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tutor_approved",
    "to": "test@example.com",
    "tutorName": "Test Tutor"
  }'
```

## Email Content Customization

### Modify Templates

Edit `lib/email/email-service.ts`:

```typescript
export const emailTemplates = {
  tutorApproved: (tutorName: string) => ({
    subject: 'Your custom subject',
    html: `Your custom HTML content`,
  }),
}
```

### Add New Templates

```typescript
tutorWelcome: (tutorName: string) => ({
  subject: 'Welcome Email',
  html: `<html>...</html>`,
}),
```

### Styling Tips

- Use inline CSS (email clients don't support external CSS)
- Keep layout simple and table-based
- Test in multiple email clients
- Provide text alternative
- Use web-safe fonts

## Security Considerations

### Credentials

- ⚠️ **Never commit credentials to Git**
- ✅ Use environment variables
- ✅ Use app passwords (not regular passwords)
- ✅ Rotate passwords regularly

### Email Content

- ✅ Sanitize user input (names, reasons)
- ✅ Validate email addresses
- ✅ Rate limit email sending
- ✅ Log email activities

### Privacy

- ✅ Only send to intended recipient
- ✅ Don't include sensitive data
- ✅ Comply with email regulations (CAN-SPAM, GDPR)
- ✅ Provide unsubscribe option (if applicable)

## Production Deployment

### Environment Variables

Set in production environment:
```env
EMAIL_USER=kramvade21@gmail.com
EMAIL_PASSWORD=w4l44k0p455
EMAIL_FROM_NAME=PTLC Digital Coach
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Gmail Limits

- **Daily limit**: 500 emails/day (free Gmail)
- **Per minute**: ~20 emails/minute
- **Recommendations**:
  - Monitor usage
  - Implement rate limiting
  - Consider upgrading to Google Workspace for higher limits
  - Or use dedicated email service (SendGrid, AWS SES)

### Monitoring

- Log all email sends
- Track delivery rates
- Monitor bounce rates
- Alert on failures

## Alternative Email Services

If Gmail limits are insufficient:

### SendGrid
- Higher limits
- Better deliverability
- Email analytics
- Template management

### AWS SES
- Pay-as-you-go pricing
- High volume support
- Good deliverability
- AWS integration

### Mailgun
- Developer-friendly
- Good documentation
- Reasonable pricing
- Email validation

## Error Handling

### Email Fails But Approval Succeeds

```typescript
try {
  await sendEmail(...)
  console.log('✅ Email sent')
} catch (emailError) {
  console.error('❌ Email failed:', emailError)
  // Approval still succeeds
  // Admin can manually notify tutor
}
```

### Common Errors

1. **Authentication Failed**
   - Check credentials
   - Verify app password
   - Enable 2FA

2. **Connection Timeout**
   - Check internet connection
   - Verify SMTP settings
   - Check firewall rules

3. **Rate Limit Exceeded**
   - Wait before retrying
   - Implement queue system
   - Upgrade account

## Future Enhancements

### Possible Improvements

1. **Email Queue System**
   - Queue emails for batch sending
   - Retry failed emails
   - Better rate limit handling

2. **Email Templates UI**
   - Admin interface to edit templates
   - Preview before sending
   - A/B testing

3. **Email Analytics**
   - Track open rates
   - Track click rates
   - Delivery reports

4. **More Email Types**
   - Welcome emails
   - Password reset
   - Booking confirmations
   - Payment receipts
   - Monthly summaries

5. **Personalization**
   - Dynamic content
   - User preferences
   - Localization

## Support

### Common Questions

**Q: Why use Gmail instead of dedicated service?**
A: Gmail is free and easy to set up for small-scale use. For production with high volume, consider dedicated services.

**Q: What if email doesn't arrive?**
A: Check spam folder, verify email address, check server logs, verify Gmail credentials.

**Q: Can I use a different email provider?**
A: Yes! Update the transporter configuration in `email-service.ts` with your provider's SMTP settings.

**Q: How do I know if email was sent?**
A: Check server console logs for "✅ Email sent" message and message ID.

## Summary

The email notification system provides:
- ✅ Automated approval/rejection emails
- ✅ Professional HTML templates
- ✅ Gmail SMTP integration
- ✅ Graceful error handling
- ✅ Easy customization
- ✅ Production-ready setup

Tutors now receive professional email notifications when their accounts are approved or rejected, improving communication and user experience.
