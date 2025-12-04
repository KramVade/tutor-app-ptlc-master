# System Architecture Diagram

## Tutoring Platform - High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Parent     │    │    Tutor     │    │    Admin     │              │
│  │  Dashboard   │    │  Dashboard   │    │  Dashboard   │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                    │                    │                      │
│         └────────────────────┴────────────────────┘                      │
│                              │                                           │
│                    ┌─────────▼─────────┐                                │
│                    │  Next.js Frontend │                                │
│                    │   (React/TSX)     │                                │
│                    └─────────┬─────────┘                                │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────────┐
│                      APPLICATION LAYER (Vercel)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js API Routes                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  /api/send-email  │  /api/moderate  │  /api/[other-routes]      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Context Providers                             │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  AuthContext  │  NotificationContext  │  Other Contexts          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Service Layer                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Email Service  │  Moderation Service  │  Payment Service        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────────┐
│                    FIREBASE BACKEND (Google Cloud)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐         ┌──────────────────────┐             │
│  │  Firebase Auth       │         │  Cloud Firestore     │             │
│  ├──────────────────────┤         ├──────────────────────┤             │
│  │ • User Management    │         │ Collections:         │             │
│  │ • Role-Based Access  │         │  • users             │             │
│  │ • Session Tokens     │         │  • tutors            │             │
│  └──────────────────────┘         │  • parents           │             │
│                                    │  • children          │             │
│  ┌──────────────────────┐         │  • bookings          │             │
│  │  Firebase Storage    │         │  • payments          │             │
│  ├──────────────────────┤         │  • messages          │             │
│  │ • Profile Images     │         │  • conversations     │             │
│  │ • Documents          │         │  • reviews           │             │
│  │ • Verification Files │         │  • notifications     │             │
│  └──────────────────────┘         │  • reports           │             │
│                                    │  • tutor-payouts     │             │
│                                    └──────────────────────┘             │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Firestore Security Rules                      │   │
│  │  (Role-based access control for data protection)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐         ┌──────────────────────┐             │
│  │   Gmail SMTP         │         │   Payment Gateway    │             │
│  ├──────────────────────┤         ├──────────────────────┤             │
│  │ • Nodemailer         │         │ • Transaction        │             │
│  │ • Approval Emails    │         │   Processing         │             │
│  │ • Notifications      │         │ • Payment Tracking   │             │
│  └──────────────────────┘         └──────────────────────┘             │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Authentication Flow
```
User Login → Firebase Auth → Auth Context → Role-Based Redirect → Dashboard
```

### 2. Booking Creation Flow
```
Parent → Booking Modal → API → Firestore (bookings) → Notification → Tutor
```

### 3. Payment Processing Flow
```
Parent Payment → Payment Service → Firestore (payments) → 
Tutor Earnings Update → Email Notification
```

### 4. Message Moderation Flow
```
User Message → Moderation Service → Content Check → 
Firestore (messages) → Real-time Update
```

### 5. Tutor Approval Flow
```
Tutor Signup → Pending Status → Admin Review → 
Approval/Rejection → Email Service → Status Update
```

## Key Components

### Frontend (Next.js/React)
- **Pages**: Role-specific dashboards, booking, messaging, payments
- **Components**: Reusable UI components (modals, cards, forms)
- **Contexts**: Global state management (auth, notifications)

### Backend (Firebase)
- **Authentication**: User identity and role management
- **Firestore**: NoSQL database for all application data
- **Storage**: File uploads and media storage
- **Security Rules**: Data access control

### Services
- **Email Service**: Automated notifications via Gmail SMTP
- **Moderation Service**: Content filtering and safety
- **Payment Service**: Transaction management and tracking

### External Integrations
- **Vercel**: Hosting and deployment platform
- **Gmail SMTP**: Email delivery service
- **Payment Gateway**: Financial transaction processing

## Security Layers

1. **Firebase Authentication**: User identity verification
2. **Firestore Rules**: Database-level access control
3. **API Route Protection**: Server-side authorization checks
4. **Role-Based Access**: Client-side route protection
5. **Content Moderation**: Message and content filtering
