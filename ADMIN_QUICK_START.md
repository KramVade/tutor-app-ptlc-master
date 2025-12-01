# Admin Account - Quick Start Guide

## Your Admin Account is Ready! 🎉

Since you've already created an admin account using Firebase Authentication, here's how to complete the setup and start using it.

## Step 1: Your Admin Account is Already Set Up! ✅

Since you created your admin account using Firebase Authentication, **you're already done!** The system now uses Firebase Authentication for admin login.

### Optional: Add Admin Profile to Firestore

You can optionally add additional profile information to Firestore:

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **ptlc-dc**
3. Go to **Firestore Database**
4. Click **"Start collection"** (or add to existing)
5. Collection ID: **`admins`**
6. Click **"Add document"**

**Add these fields (all optional):**
```
name: "Your Name"                     (string) - Optional, will use Firebase Auth name
email: "your-admin-email@example.com" (string) - Must match Firebase Auth email
phone: ""                             (string) - Optional
role: "admin"                         (string) - Optional
createdAt: "2024-12-01T00:00:00.000Z" (string) - Optional
```

7. Click **"Save"**

**Note:** The Firestore entry is optional. The system will work with just Firebase Authentication.

### Option B: Using the Script

See `ADMIN_SETUP_GUIDE.md` for detailed instructions on using the Node.js script.

## Step 2: Test Your Admin Login

1. Go to your app: `http://localhost:3000/login`
2. Select **"Admin"** role
3. Enter your email and password
4. Click **"Login"**
5. You should be redirected to `/admin/dashboard`

## Admin Dashboard Features

Once logged in, you have access to:

### 📊 Dashboard (`/admin/dashboard`)
- Platform statistics
- User metrics
- Revenue tracking
- Booking trends
- Quick actions

### 👥 User Management (`/admin/users`)
- View all users
- Manage parents and tutors
- User verification

### 🎓 Tutor Management (`/admin/tutors`)
- Approve/reject tutor applications
- Verify tutor credentials
- Manage tutor profiles

### 📅 Bookings (`/admin/bookings`)
- View all bookings
- Monitor booking status
- Handle disputes

### 📈 Analytics (`/admin/analytics`)
- Detailed platform insights
- Revenue reports
- User engagement metrics

### 💰 Payments (`/admin/payments`)
- Transaction history
- Payment processing
- Financial reports

### 🛡️ Moderation (`/admin/moderation`)
- Content reports
- User complaints
- Platform safety

## Current System Status

✅ **Admin authentication** - Fully functional
✅ **Admin dashboard** - Ready to use
✅ **Admin routes** - Protected and accessible
✅ **Firebase integration** - Connected
✅ **Real-time data** - All dashboards load from Firebase
✅ **Notifications** - Real-time notification system active

## What You Need to Do

1. **Add your admin account to Firestore** (Step 1 above)
2. **Test login** (Step 2 above)
3. **Explore the dashboard**
4. **Customize as needed**

## Admin Account Details

Your admin account should have:
- ✅ Firebase Authentication account (already created)
- ⏳ Firestore `admins` collection entry (needs to be added)
- ✅ Role: "admin"
- ✅ Access to all admin routes

## Security Notes

### Current Setup (Development)
- Passwords stored in plain text
- Simple email/password authentication
- Basic role-based access control

### Recommended for Production
- Use Firebase Authentication exclusively
- Implement proper password hashing
- Add two-factor authentication
- Set up admin activity logging
- Configure IP whitelisting for admin access

## Firestore Security Rules

The admin collection is protected:

```javascript
match /admins/{adminId} {
  allow read: if request.auth != null && 
    request.auth.uid == adminId;
  allow write: if request.auth != null && 
    request.auth.uid == adminId;
}
```

## Troubleshooting

### "User not found" error
- Make sure you added the admin document to Firestore
- Verify the email matches exactly (case-sensitive)
- Check that the `admins` collection exists

### Can't access admin routes
- Verify role is set to "admin" in Firestore
- Clear browser cache and localStorage
- Check browser console for errors

### Login works but dashboard is empty
- This is normal - the dashboard uses mock data initially
- Real data will populate as users interact with the platform

## Next Steps

After logging in as admin:

1. **Explore the dashboard** - Familiarize yourself with the interface
2. **Check user management** - See how to manage tutors and parents
3. **Review bookings** - Monitor platform activity
4. **Set up notifications** - Configure admin notification preferences
5. **Customize settings** - Adjust platform settings as needed

## Support Files

- `ADMIN_SETUP_GUIDE.md` - Detailed setup instructions
- `firebase/admin.js` - Admin Firebase service
- `app/admin/dashboard/page.tsx` - Admin dashboard component
- `firestore.rules` - Security rules including admin access

## Quick Commands

```bash
# Start development server
npm run dev

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Check Firebase project
firebase projects:list
```

## Important URLs

- **App**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Firebase Console**: https://console.firebase.google.com/project/ptlc-dc

---

**You're all set!** Just add your admin account to Firestore and you can start managing the platform. 🚀
