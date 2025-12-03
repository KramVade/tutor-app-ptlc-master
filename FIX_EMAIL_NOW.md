# Fix Email Error - Quick Guide

## The Problem

You're getting a 500 error when approving tutors because Gmail requires an **App Password** instead of your regular password.

## The Solution (5 minutes)

### Step 1: Generate Gmail App Password

1. **Open this link**: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow the setup wizard
   - Use your phone number for verification

3. **Generate App Password**:
   - Go back to Security page
   - Click "App passwords" (you'll see this after enabling 2FA)
   - Select:
     - App: **Mail**
     - Device: **Other (Custom name)**
   - Type: **PTLC Digital Coach**
   - Click **Generate**

4. **Copy the 16-character password**:
   - It looks like: `abcd efgh ijkl mnop`
   - Copy it (you won't see it again!)

### Step 2: Update .env.local

Open your `.env.local` file and update this line:

```env
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

Replace `abcd efgh ijkl mnop` with your actual app password.

### Step 3: Restart Your Server

Stop your development server (Ctrl+C) and start it again:

```bash
npm run dev
```

### Step 4: Test It

Run the test script:

```bash
node scripts/test-email-connection.js
```

This will verify your email configuration is working.

## That's It!

Now when you approve a tutor, they'll receive a professional welcome email automatically.

## Still Having Issues?

See `EMAIL_TROUBLESHOOTING.md` for detailed troubleshooting steps.

## Quick Reference

**Your Gmail Account:**
- Email: kramvade21@gmail.com
- Password: (your regular password - DON'T use this for SMTP)
- App Password: (the 16-character code you just generated - USE THIS)

**What Goes Where:**
```env
EMAIL_USER=kramvade21@gmail.com          ← Your email address
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx       ← Your APP PASSWORD (not regular password)
EMAIL_FROM_NAME=PTLC Digital Coach       ← Display name
```

## Why App Password?

Gmail requires App Passwords for security when third-party apps (like your website) send emails. It's more secure than using your regular password.

## Test Command

```bash
node scripts/test-email-connection.js
```

This will:
1. Check your environment variables
2. Test SMTP connection
3. Optionally send a test email
4. Show detailed error messages if something's wrong
