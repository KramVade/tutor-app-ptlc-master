# Admin Login with Firebase Authentication

## Overview

The admin login now uses **Firebase Authentication** instead of Firestore-only authentication. This provides better security and session management.

## How It Works

### Admin Login Flow

1. **User enters credentials** on login page with "Admin" role selected
2. **System authenticates with Firebase Auth** using `signInWithEmailAndPassword()`
3. **Session is created** with Firebase Auth token
4. **User data is loaded** from Firestore (optional) or Firebase Auth profile
5. **User is redirected** to `/admin/dashboard`

### Key Differences from Tutor/Parent Login

| Feature | Admin | Tutor/Parent |
|---------|-------|--------------|
| Authentication | Firebase Authentication | Firestore only |
| Password Storage | Firebase (secure) | Firestore (plain text) |
| Session Management | Firebase Auth tokens | localStorage only |
| Security | High | Basic |
| Password Reset | Firebase built-in | Manual |

## Your Setup

Since you already created an admin account in Firebase Authentication, **you're ready to go!**

### What You Have

✅ Firebase Authentication account (email/password)
✅ Secure password storage (handled by Firebase)
✅ Session management (handled by Firebase)
✅ Automatic session restoration on page refresh

### What You Need to Do

**Nothing!** Just login with your Firebase Authentication credentials:

1. Go to `/login`
2. Select "Admin" role
3. Enter your Firebase Auth email and password
4. Click "Login"

## Optional: Add Admin Profile to Firestore

You can optionally add additional profile information to Firestore for richer admin profiles:

```javascript
// In Firestore, create document in 'admins' collection:
{
  email: "your-admin@example.com",  // Must match Firebase Auth
  name: "Your Name",                 // Display name
  phone: "+1234567890",              // Optional
  avatar: "https://...",             // Optional
  role: "admin",                     // Optional
  createdAt: "2024-12-01T00:00:00Z"
}
```

**Benefits of Firestore profile:**
- Custom display name
- Phone number
- Avatar image
- Additional metadata

**Without Firestore profile:**
- Uses Firebase Auth display name
- Uses Firebase Auth photo URL
- Still fully functional

## Authentication Code

### Login (auth-context.tsx)

```typescript
// For admin, use Firebase Authentication
if (role === "admin") {
  const { auth } = await import("@/firebase/config")
  const { signInWithEmailAndPassword } = await import("firebase/auth")
  
  // Authenticate with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Get optional admin data from Firestore
  let adminData = await getAdminByEmail(email)
  
  // Create user session
  const authenticatedUser = {
    id: userCredential.user.uid,
    email: userCredential.user.email,
    name: adminData?.name || userCredential.user.displayName,
    role: 'admin',
    // ...
  }
}
```

### Session Restoration

```typescript
// On app load, verify Firebase Auth session for admin
if (storedUser.role === 'admin') {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser && firebaseUser.email === storedUser.email) {
      setUser(storedUser) // Session valid
    } else {
      setUser(null) // Session expired
    }
  })
}
```

### Logout

```typescript
// Sign out from Firebase Auth
if (user?.role === 'admin') {
  await signOut(auth)
}
localStorage.removeItem("ptlcDigitalCoach_user")
```

## Security Features

### Firebase Authentication Provides

✅ **Secure password storage** - Passwords never stored in plain text
✅ **Session tokens** - Secure, expiring tokens for authentication
✅ **Automatic session refresh** - Tokens refresh automatically
✅ **Built-in security** - Protection against common attacks
✅ **Password reset** - Email-based password reset flow
✅ **Email verification** - Optional email verification
✅ **Multi-factor auth** - Can be enabled for extra security

### Session Management

- Sessions persist across page refreshes
- Sessions expire after inactivity (configurable)
- Invalid sessions are automatically cleared
- Logout properly cleans up Firebase Auth session

## Error Handling

### Common Errors

**"auth/user-not-found"**
- Admin account doesn't exist in Firebase Authentication
- Create account in Firebase Console → Authentication

**"auth/wrong-password"**
- Incorrect password
- Use password reset if forgotten

**"auth/too-many-requests"**
- Too many failed login attempts
- Wait a few minutes or reset password

**"auth/network-request-failed"**
- Network connection issue
- Check internet connection

### Error Messages

The system provides user-friendly error messages:
- "Invalid credentials" - Wrong email or password
- "User not found" - Account doesn't exist
- "Network error" - Connection problem

## Testing

### Test Admin Login

1. Open browser console (F12)
2. Go to `/login`
3. Select "Admin" role
4. Enter credentials
5. Watch console logs:

```
🔥 Starting login for: admin@example.com as admin
🔐 Using Firebase Authentication for admin...
✅ Firebase Authentication successful
💾 Saving admin session...
✅ Admin login complete!
```

### Test Session Persistence

1. Login as admin
2. Refresh the page
3. Should remain logged in
4. Check console:

```
✅ Admin session restored from Firebase Auth
```

### Test Logout

1. Click logout
2. Check console:

```
✅ Signed out from Firebase Auth
```

## Firebase Console Setup

### View Your Admin Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ptlc-dc`
3. Click "Authentication" in sidebar
4. Click "Users" tab
5. You should see your admin account listed

### Manage Admin Account

From Firebase Console → Authentication → Users:

- **Reset password** - Click three dots → Reset password
- **Disable account** - Click three dots → Disable user
- **Delete account** - Click three dots → Delete user
- **View details** - Click on user to see details

## Production Recommendations

### Security Best Practices

1. **Enable email verification**
   ```typescript
   await sendEmailVerification(user)
   ```

2. **Implement password requirements**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Not common passwords

3. **Add multi-factor authentication**
   - SMS verification
   - Authenticator app
   - Backup codes

4. **Set up password reset**
   ```typescript
   await sendPasswordResetEmail(auth, email)
   ```

5. **Monitor authentication events**
   - Failed login attempts
   - Successful logins
   - Password changes

6. **Configure session timeout**
   ```typescript
   auth.settings.appVerificationDisabledForTesting = false
   ```

### Additional Security

- **IP whitelisting** - Restrict admin access to specific IPs
- **Activity logging** - Log all admin actions
- **Role-based permissions** - Fine-grained access control
- **Audit trail** - Track changes made by admins

## Troubleshooting

### Can't login as admin

1. **Check Firebase Authentication**
   - Go to Firebase Console → Authentication
   - Verify your account exists
   - Check if account is enabled

2. **Check credentials**
   - Email must match exactly (case-sensitive)
   - Password must be correct
   - Try password reset if unsure

3. **Check browser console**
   - Look for error messages
   - Check network tab for failed requests

4. **Clear cache**
   - Clear browser cache
   - Clear localStorage
   - Try incognito mode

### Session not persisting

1. **Check localStorage**
   - Open DevTools → Application → Local Storage
   - Look for `ptlcDigitalCoach_user`

2. **Check Firebase Auth state**
   - Console should show auth state changes
   - Verify token is valid

3. **Check network**
   - Ensure stable internet connection
   - Check for firewall blocking Firebase

## Migration from Firestore Auth

If you previously had admin accounts in Firestore only:

### Option 1: Create Firebase Auth Account

1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Enter email and password
4. User can now login with Firebase Auth

### Option 2: Import Users

Use Firebase Admin SDK to import existing users:

```javascript
const users = [
  {
    email: 'admin@example.com',
    password: 'securePassword123',
    displayName: 'Admin User'
  }
];

admin.auth().importUsers(users);
```

## Summary

✅ **Admin login uses Firebase Authentication** - More secure than Firestore-only
✅ **Your account is ready** - Just login with Firebase Auth credentials
✅ **Session management** - Automatic session restoration and validation
✅ **Better security** - Passwords never stored in plain text
✅ **Built-in features** - Password reset, email verification, etc.

**You're all set!** Just login with your Firebase Authentication credentials and start managing the platform. 🚀
