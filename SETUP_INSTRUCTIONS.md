# Firebase Setup Instructions

## Step 1: Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (or create a new one)
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click the `</>` icon to add one
6. Copy your Firebase configuration values

## Step 2: Update .env.local File

Open the `.env.local` file in your project root and replace the placeholder values with your actual Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Step 3: Verify Firestore Collections

Make sure your Firebase Firestore database has these collections:

- `tutors` - Stores tutor profiles
- `parents` - Stores parent profiles
- `admins` - Stores admin users
- `bookings` - Stores booking information
- `children` - Stores children profiles
- `payments` - Stores payment records
- `earnings` - Stores tutor earnings

## Step 4: Restart Development Server

After updating `.env.local`, restart your development server:

```bash
npm run dev
```

## Step 5: Test the Integration

1. Try to **sign up** as a new user (parent or tutor)
2. Check your Firebase Console → Firestore Database to see if the user was created
3. Try to **log in** with the credentials you just created
4. You should only be able to log in if the user exists in the database

## Expected Data Structure

### Tutors Collection
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "subjects": ["Math", "Physics"],
  "bio": "Experienced tutor",
  "hourlyRate": 50,
  "rating": 4.5,
  "available": true,
  "avatar": "",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Parents Collection
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "children": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Admins Collection
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Security Note

⚠️ **IMPORTANT**: The current implementation stores passwords in plain text. This is NOT secure for production!

For production, you should:
1. Use Firebase Authentication instead of manual password storage
2. Or implement proper password hashing (bcrypt, argon2, etc.)
3. Never store passwords in plain text

## Troubleshooting

### Error: "User not found"
- Check if the user exists in the correct Firestore collection
- Verify the email is exactly the same (case-sensitive)
- Make sure you selected the correct role (parent/tutor/admin)

### Error: "Firebase not initialized"
- Check if `.env.local` has the correct values
- Restart your development server after changing `.env.local`
- Verify your Firebase project is active

### Error: "Permission denied"
- Check your Firestore Security Rules
- For development, you can temporarily use test mode rules
- For production, implement proper security rules

## Next Steps

Once Firebase is connected:
1. Create some test users in Firestore manually
2. Test login with those users
3. Try creating new users through signup
4. Verify all data is being saved to Firebase
