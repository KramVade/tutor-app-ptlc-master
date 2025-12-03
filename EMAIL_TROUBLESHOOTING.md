# Email Troubleshooting Guide

## Error: 500 Internal Server Error

This error typically means Gmail authentication is failing.

## Quick Fix Steps

### Step 1: Generate Gmail App Password

**This is the most common solution and is REQUIRED if you have 2-Factor Authentication enabled.**

1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", enable **2-Step Verification** (if not already enabled)
3. After enabling 2FA, go back to the Security page
4. Click on **"App passwords"** (you'll only see this after enabling 2FA)
5. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Name it: **PTLC Digital Coach**
6. Click **Generate**
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
8. Update your `.env.local` file:

```env
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

9. Restart your development server:
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 2: Verify Environment Variables

Check your `.env.local` file has:

```env
EMAIL_USER=kramvade21@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM_NAME=PTLC Digital Coach
```

### Step 3: Test the Connection

Try approving a test tutor and check the server console for detailed error messages.

## Common Error Messages

### "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:** You need an App Password (see Step 1 above)

### "Connection timeout"

**Solutions:**
- Check your internet connection
- Verify firewall isn't blocking SMTP (port 587)
- Try using port 465 instead (see Alternative Configuration below)

### "Missing credentials"

**Solution:** Make sure `.env.local` file exists and has EMAIL_USER and EMAIL_PASSWORD

### "Self signed certificate"

**Solution:** Add to transporter config:
```typescript
tls: {
  rejectUnauthorized: false
}
```

## Alternative Configuration

If the default configuration doesn't work, try this in `lib/email/email-service.ts`:

```typescript
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};
```

## Testing Email Manually

Create a test script `scripts/test-email.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'kramvade21@gmail.com',
    pass: 'your-app-password-here', // Use your app password
  },
});

transporter.sendMail({
  from: 'PTLC Digital Coach <kramvade21@gmail.com>',
  to: 'your-test-email@example.com',
  subject: 'Test Email',
  text: 'This is a test email from PTLC Digital Coach',
}, (error, info) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent:', info.messageId);
  }
});
```

Run it:
```bash
node scripts/test-email.js
```

## Still Not Working?

### Option 1: Enable Less Secure Apps (Not Recommended)

⚠️ **Warning:** This is less secure and not recommended.

1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn on "Allow less secure apps"
3. Try again

### Option 2: Use a Different Email Service

Consider using a dedicated email service:

#### SendGrid (Recommended for Production)

1. Sign up at: https://sendgrid.com
2. Get API key
3. Update transporter:

```typescript
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
};
```

#### Mailgun

1. Sign up at: https://www.mailgun.com
2. Get SMTP credentials
3. Update transporter with Mailgun settings

#### AWS SES

1. Set up AWS SES
2. Get SMTP credentials
3. Update transporter with SES settings

## Checking Server Logs

When you approve a tutor, check your terminal/console for:

```
✅ SMTP connection verified
✅ Email sent successfully: <message-id>
```

Or error messages like:

```
❌ Error sending email: ...
❌ Error code: ...
❌ SMTP response: ...
```

## Gmail Account Checklist

- [ ] 2-Factor Authentication enabled
- [ ] App Password generated
- [ ] App Password copied to `.env.local`
- [ ] Development server restarted
- [ ] IMAP/SMTP enabled in Gmail settings
- [ ] No suspicious activity blocks from Gmail

## Need More Help?

1. Check the full error message in server console
2. Verify Gmail account settings
3. Try the manual test script above
4. Consider using a dedicated email service for production

## Quick Reference

**Gmail SMTP Settings:**
- Host: smtp.gmail.com
- Port: 587 (TLS) or 465 (SSL)
- Security: TLS/SSL
- Auth: Username (email) + App Password

**Environment Variables:**
```env
EMAIL_USER=kramvade21@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=PTLC Digital Coach
```

**Restart Server:**
```bash
# Stop: Ctrl+C
# Start: npm run dev
```
