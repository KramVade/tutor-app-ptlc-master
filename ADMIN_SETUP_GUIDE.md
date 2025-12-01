# Admin Account Setup Guide

## Overview
This guide will help you set up the admin account in your Firebase Firestore database.

## Method 1: Using Firebase Console (Recommended)

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ptlc-dc`
3. Click on "Firestore Database" in the left sidebar

### Step 2: Create Admins Collection
1. Click "Start collection"
2. Collection ID: `admins`
3. Click "Next"

### Step 3: Add Admin Document
Add a document with the following fields:

**Document ID**: Auto-generate or use custom ID

**Fields**:
```
name: "Admin User"                    (string)
email: "admin@ptlc.com"              (string) - Use your admin email
password: "your-secure-password"      (string) - Use a secure password
phone: ""                             (string)
role: "admin"                         (string)
createdAt: "2024-01-01T00:00:00.000Z" (string) - Current timestamp
updatedAt: "2024-01-01T00:00:00.000Z" (string) - Current timestamp
avatar: ""                            (string) - Optional
```

### Step 4: Save the Document
Click "Save" to create the admin account.

### Step 5: Test Login
1. Go to your app login page
2. Select "Admin" role
3. Enter the email and password you set
4. Click "Login"

## Method 2: Using Firebase Admin SDK Script

### Prerequisites
```bash
npm install firebase-admin
```

### Step 1: Download Service Account Key
1. Go to Firebase Console → Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `scripts/serviceAccountKey.json`

### Step 2: Update Admin Details
Edit `scripts/create-admin.js` and update:
```javascript
const adminData = {
  name: 'Your Name',
  email: 'your-email@example.com',
  password: 'your-secure-password',
  // ... other fields
};
```

### Step 3: Run the Script
```bash
node scripts/create-admin.js
```

## Method 3: Using Firestore REST API

You can also add the admin using a simple HTTP request:

```bash
curl -X POST \
  'https://firestore.googleapis.com/v1/projects/ptlc-dc/databases/(default)/documents/admins' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "name": {"stringValue": "Admin User"},
      "email": {"stringValue": "admin@ptlc.com"},
      "password": {"stringValue": "your-password"},
      "phone": {"stringValue": ""},
      "role": {"stringValue": "admin"},
      "createdAt": {"stringValue": "2024-01-01T00:00:00.000Z"},
      "updatedAt": {"stringValue": "2024-01-01T00:00:00.000Z"}
    }
  }'
```

## Verify Admin Account

### Check in Firebase Console
1. Go to Firestore Database
2. Open `admins` collection
3. Verify your admin document exists

### Test Login
1. Open your app
2. Go to login page
3. Select "Admin" role
4. Enter credentials
5. Should redirect to `/admin/dashboard`

## Admin Dashboard Routes

The admin has access to these routes:
- `/admin/dashboard` - Main dashboard
- `/admin/tutors` - Manage tutors
- `/admin/parents` - Manage parents
- `/admin/bookings` - View all bookings
- `/admin/reports` - View reports and analytics

## Security Notes

### Password Security
⚠️ **IMPORTANT**: The current implementation stores passwords in plain text for development purposes.

**For Production**:
1. Use Firebase Authentication instead of custom auth
2. Or implement proper password hashing (bcrypt, argon2)
3. Never store plain text passwords

### Recommended Production Setup
```javascript
// Use Firebase Authentication
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);
```

### Firestore Security Rules
The admin account is protected by Firestore rules in `firestore.rules`:

```javascript
match /admins/{adminId} {
  allow read: if request.auth != null && 
    request.auth.uid == adminId;
  allow write: if request.auth != null && 
    request.auth.uid == adminId;
}
```

## Troubleshooting

### Admin Not Found Error
- Check that the `admins` collection exists in Firestore
- Verify the email matches exactly (case-sensitive)
- Check Firebase Console for any errors

### Login Fails
- Verify password is correct
- Check browser console for errors
- Ensure Firestore rules allow read access
- Check that role is set to "admin"

### Can't Access Admin Routes
- Verify user role is "admin" in localStorage
- Check that routes are protected properly
- Clear browser cache and try again

## Admin Account Management

### Change Password
1. Login as admin
2. Go to profile settings
3. Update password
4. Or manually update in Firestore Console

### Add Multiple Admins
Repeat the process above for each admin account.

### Remove Admin Access
1. Go to Firestore Console
2. Find the admin document
3. Delete the document
4. Or change the role field to something else

## Next Steps

After setting up the admin account:

1. ✅ Test login with admin credentials
2. ✅ Verify access to admin dashboard
3. ✅ Change default password
4. ✅ Set up proper authentication for production
5. ✅ Configure admin-specific features
6. ✅ Set up admin notification preferences

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify Firestore rules are deployed
4. Check that all required fields are present
