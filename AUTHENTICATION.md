# Authentication System Documentation

## Overview

The BRACU Alumni Network Portal features a comprehensive authentication system with role-based access control, email verification, and admin approval workflows.

## Features Implemented

### 1. User Registration & Authentication ✅

#### Registration Process

-   **Email-based registration** with validation
-   **Required fields**: firstName, lastName, email, password, graduationYear, degree, major
-   **Password requirements**: Minimum 8 characters
-   **Automatic role assignment**: New users get "ALUMNI" role by default
-   **Email verification**: Optional email verification flow (configurable via ENABLE_EMAIL_VERIFICATION)

#### Login System

-   **Email/password authentication**
-   **JWT token-based sessions**
-   **Secure password hashing** using bcryptjs
-   **Session persistence** with localStorage
-   **Automatic token refresh**

### 2. Role-Based Access Control ✅

#### User Roles

-   **ALUMNI**: Regular alumni users
-   **ADMIN**: Administrative users with elevated permissions

#### Role Permissions

-   **Alumni**: Can access directory, events, jobs (after email verification)
-   **Admin**: Full system access, user verification, content management
-   **Verified Alumni**: Enhanced features like messaging, premium directory access

#### Access Levels

1. **Public**: Landing page, registration, login
2. **Authenticated**: Basic dashboard access
3. **Email Verified**: Alumni features access
4. **Admin Verified**: Premium features access
5. **Admin Only**: Administrative functions

### 3. Password Reset Functionality ✅

#### Reset Process

1. **Request reset**: User enters email address
2. **Token generation**: Secure random token with 1-hour expiration
3. **Email delivery**: Password reset link sent via email
4. **Token validation**: Secure token verification
5. **Password update**: New password setting with confirmation

#### Security Features

-   **Time-limited tokens** (1 hour expiration)
-   **Single-use tokens** (marked as used after consumption)
-   **Email enumeration protection** (consistent responses)
-   **Secure token generation** using crypto.randomBytes

### 4. Email Verification System ✅

#### Verification Flow

1. **Registration trigger**: Verification email sent on user registration
2. **Token generation**: 24-hour expiration tokens
3. **Email delivery**: Verification link via email
4. **Verification confirmation**: Token validation and email marking
5. **Status update**: User emailVerified field updated

#### Resend Functionality

-   **Resend verification emails**
-   **Token cleanup**: Old tokens removed before new ones
-   **Rate limiting ready**: Infrastructure for preventing abuse

## API Endpoints

### Authentication Routes

```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/me                # Get current user info
POST /api/auth/reset-password    # Request password reset
POST /api/auth/reset-password/confirm # Confirm password reset
POST /api/auth/verify-email      # Request email verification
POST /api/auth/verify-email/confirm   # Confirm email verification
```

### Admin Routes

```
POST /api/admin/verify-user      # Admin user verification
GET  /api/admin/dashboard        # Admin dashboard data
```

## Frontend Components

### Pages

-   `/login` - User login form
-   `/register` - User registration form
-   `/auth/reset-password` - Password reset request
-   `/auth/reset-password/confirm` - Password reset confirmation
-   `/auth/verify-email` - Email verification page
-   `/auth/resend-verification` - Resend verification email

### Components

-   `AuthProvider` - Authentication context provider
-   `ProtectedRoute` - Route protection wrapper
-   `AuthStatus` - User verification status display
-   `Navigation` - Authentication-aware navigation

### Utility Functions

-   `AuthUtils` - Authentication helper functions
-   Role-based access checks
-   Profile completion tracking
-   Verification status messages

## Database Schema

### User Model

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String
  firstName       String
  lastName        String
  profilePicture  String?
  bio             String?
  graduationYear  Int
  degree          String
  major           String
  currentCompany  String?
  currentPosition String?
  location        String?
  linkedinUrl     String?
  githubUrl       String?
  website         String?
  role            Role     @default(ALUMNI)
  isVerified      Boolean  @default(false)
  emailVerified   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  // ... relations
}
```

### Token Models

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Verification Model

```prisma
model Verification {
  id           String   @id @default(cuid())
  userId       String   @unique
  documentKey  String
  verifiedById String?
  verifiedAt   DateTime?
  createdAt    DateTime @default(now())

  user       User  @relation(fields: [userId], references: [id])
  verifiedBy User? @relation("VerifiedBy", fields: [verifiedById], references: [id])
}
```

## Security Features

### Password Security

-   **bcryptjs hashing** with salt rounds of 12
-   **Minimum length enforcement** (8 characters)
-   **Password confirmation** during registration
-   **Secure reset process** with time-limited tokens

### JWT Security

-   **Configurable secret keys**
-   **Token expiration** (7 days default)
-   **Secure token verification**
-   **Automatic token refresh** on valid requests

### Route Protection

-   **Middleware-based protection** for sensitive routes
-   **Role-based access control**
-   **Authentication state verification**
-   **Automatic redirects** for unauthorized access

### Email Security

-   **Token-based verification**
-   **Time-limited tokens** (24 hours for verification, 1 hour for reset)
-   **Single-use tokens** to prevent replay attacks
-   **Email enumeration protection**

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your-32-char-secret"
NEXTAUTH_SECRET="your-32-char-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@alumni.bracu.ac.bd"

# Features
ENABLE_EMAIL_VERIFICATION="true"
APP_URL="http://localhost:3000"
```

### Feature Flags

-   `ENABLE_EMAIL_VERIFICATION`: Toggle email verification requirement
-   `ENABLE_RATE_LIMITING`: Enable API rate limiting
-   `NODE_ENV`: Environment configuration

## Usage Examples

### Protected Routes

```tsx
import ProtectedRoute, { AdminRoute, VerifiedAlumniRoute } from '@/components/auth/ProtectedRoute';

// Basic authentication required
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Admin only
<AdminRoute>
  <AdminPanel />
</AdminRoute>

// Verified alumni only
<VerifiedAlumniRoute>
  <PremiumFeatures />
</VerifiedAlumniRoute>
```

### Authentication Context

```tsx
import { useAuth } from "@/components/providers/AuthProvider";

function MyComponent() {
    const { user, login, logout, register, resendVerification } = useAuth();

    if (!user) {
        return <LoginForm onLogin={login} />;
    }

    return <UserDashboard user={user} onLogout={logout} />;
}
```

### Utility Functions

```tsx
import { AuthUtils } from "@/lib/auth-utils";

// Check permissions
const canMessage = AuthUtils.canMessageUser(currentUser, targetUser);
const isVerified = AuthUtils.isVerifiedByAdmin(user);
const completion = AuthUtils.getProfileCompletionPercentage(user);

// Display helpers
const displayName = AuthUtils.getDisplayName(user);
const initials = AuthUtils.getUserInitials(user);
const status = AuthUtils.getVerificationStatusMessage(user);
```

## Verification Workflow

### User Journey

1. **Registration**: User creates account with required information
2. **Email Verification**: User receives and clicks verification link (if enabled)
3. **Profile Completion**: User completes profile information
4. **Admin Review**: Admin reviews and verifies user account
5. **Full Access**: User gains access to all premium features

### Admin Workflow

1. **User Registration**: Receive notification of new user registration
2. **Profile Review**: Review user profile and graduation information
3. **Verification Decision**: Approve or reject user verification
4. **Status Update**: User notification and status change

## Testing

### Test Users

Create test users with different roles and verification statuses:

```typescript
// Admin user
const admin = {
    email: "admin@bracu.ac.bd",
    role: "ADMIN",
    isVerified: true,
    emailVerified: new Date(),
};

// Verified alumni
const verifiedAlumni = {
    email: "alumni@bracu.ac.bd",
    role: "ALUMNI",
    isVerified: true,
    emailVerified: new Date(),
};

// Unverified alumni
const unverifiedAlumni = {
    email: "newuser@bracu.ac.bd",
    role: "ALUMNI",
    isVerified: false,
    emailVerified: null,
};
```

## Future Enhancements

### Planned Features

-   **Social login** (Google, LinkedIn)
-   **Two-factor authentication**
-   **Advanced rate limiting**
-   **Audit logging**
-   **Session management**
-   **Account lockout** after failed attempts
-   **Email templates** customization
-   **Bulk user management** for admins

### Security Improvements

-   **Password strength requirements**
-   **Account recovery** questions
-   **Device tracking**
-   **Suspicious activity detection**
-   **GDPR compliance** features

## Troubleshooting

### Common Issues

#### Email Not Sending

1. Check SMTP configuration
2. Verify email credentials
3. Check spam folder
4. Validate environment variables

#### Database Connection

1. Verify DATABASE_URL
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Check database permissions

#### JWT Token Issues

1. Verify JWT_SECRET length (minimum 32 characters)
2. Check token expiration
3. Clear localStorage/cookies
4. Regenerate tokens

### Support

For issues or questions:

1. Check environment configuration
2. Review database schema
3. Verify email setup
4. Test with development tokens
5. Contact development team

## Conclusion

The authentication system provides a robust foundation for the BRACU Alumni Network Portal with comprehensive security features, role-based access control, and user verification workflows. The modular design allows for easy extension and customization as the platform grows.
