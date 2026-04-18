# 🔐 Authentication & Authorization Guide

## Overview

Complete authentication system with Supabase Auth including:
- ✅ Sign up & sign in
- ✅ Email verification
- ✅ Password reset
- ✅ Admin role protection
- ✅ Protected routes
- ✅ Middleware authentication

---

## 📁 Auth Pages Created

### **1. Login (`/auth/login`)**
```
Features:
✅ Email/password sign in
✅ Remember me option
✅ Forgot password link
✅ Redirect to signup
✅ Demo credentials display
✅ Error handling
✅ Loading states
✅ Success feedback
```

**File:** `app/auth/login/page.tsx`

### **2. Signup (`/auth/signup`)**
```
Features:
✅ Full name input
✅ Email validation
✅ Password strength check (8+ chars)
✅ Password confirmation
✅ User profile creation
✅ Email verification step
✅ Terms & privacy agreement
✅ Redirect to login
```

**File:** `app/auth/signup/page.tsx`

### **3. Verify Email (`/auth/verify-email`)**
```
Features:
✅ Email verification instruction
✅ Resend email link
✅ Spam folder warning
✅ 24-hour expiration notice
✅ Continue to dashboard button
```

**File:** `app/auth/verify-email/page.tsx`

### **4. Forgot Password (`/auth/forgot-password`)**
```
Features:
✅ Email input
✅ Reset link delivery
✅ Error handling
✅ Success confirmation
✅ 1-hour link expiration
```

**File:** `app/auth/forgot-password/page.tsx`

### **5. Reset Password (`/auth/reset-password`)**
```
Features:
✅ Token validation
✅ New password input
✅ Password confirmation
✅ Password strength validation
✅ Auto-redirect on success
✅ Invalid link handling
```

**File:** `app/auth/reset-password/page.tsx`

---

## 🔒 Middleware Protection

### **File:** `middleware.ts`

#### **Protected Routes**

```
/dashboard/*
  └─ Requires: Authenticated user
  └─ Redirects to: /auth/login

/admin/*
  └─ Requires: Authenticated user + admin role
  └─ Redirects to: /dashboard (if not admin)
  └─ Redirects to: /auth/login (if not authenticated)
```

#### **Auth Pages (Redirect)**

```
/auth/login  → /dashboard (if authenticated)
/auth/signup → /dashboard (if authenticated)
```

#### **Public Routes**

```
/ (home)
/campaigns
/about
/impact
/privacy
/terms
```

---

## 🎯 Authentication Flow

### **Sign Up Flow**
```
1. User visits /auth/signup
2. Enters name, email, password
3. Validation (password 8+ chars, match)
4. Supabase signs up user
5. User profile created
6. Email verification sent
7. Redirects to /auth/verify-email
8. User clicks email link
9. Redirects to /auth/login
10. User signs in
```

### **Sign In Flow**
```
1. User visits /auth/login
2. Enters email & password
3. Supabase authenticates
4. Session created
5. Redirects to /dashboard
6. Middleware allows access
```

### **Forgot Password Flow**
```
1. User visits /auth/forgot-password
2. Enters email
3. Reset link emailed (1 hour expiry)
4. User clicks link
5. Redirects to /auth/reset-password
6. Middleware validates token
7. User enters new password
8. Password updated
9. Redirects to /auth/login
```

---

## 🔐 Middleware Logic

```javascript
// 1. Check if credentials valid
if (!validCredentials) return response;

// 2. Get session from Supabase
const { session } = await supabase.auth.getSession();
const { user } = await supabase.auth.getUser();

// 3. Dashboard protection
if (pathname.startsWith("/dashboard")) {
  if (!session) {
    // Redirect to login
    return NextResponse.redirect("/auth/login");
  }
  // Allow access
  return response;
}

// 4. Admin protection
if (pathname.startsWith("/admin")) {
  if (!session) {
    // Redirect to login
    return NextResponse.redirect("/auth/login");
  }
  
  // Check admin role
  const isAdmin = user?.user_metadata?.role === "admin";
  if (!isAdmin) {
    // Redirect to dashboard
    return NextResponse.redirect("/dashboard");
  }
  
  // Allow access
  return response;
}

// 5. Redirect authenticated users from auth pages
if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")) {
  if (session) {
    // Redirect to dashboard
    return NextResponse.redirect("/dashboard");
  }
}
```

---

## 👥 User Roles

### **Regular User**
```
✅ Access: /dashboard
✅ Access: /campaigns, /impact, /about
❌ Access: /admin
```

### **Admin User**
```
✅ Access: /dashboard
✅ Access: /admin
✅ Access: /admin/campaigns
✅ Access: /admin/users
✅ Access: /admin/analytics
✅ Manage: campaigns, charities, draws
✅ Verify: winner proofs
✅ Process: payouts
```

---

## 🛠️ Admin Setup

### **Set User as Admin**

**Option 1: Via SQL**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
WHERE email = 'admin@example.com';
```

**Option 2: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click on user
3. Scroll to "User Metadata"
4. Add: `{"role": "admin"}`
5. Save

**Option 3: Via Application**
(Requires admin function - not included yet)

### **Verify Admin Status**
```sql
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@example.com';
```

---

## 📊 Authentication Routes

| Route | Method | Public | Auth | Admin | Purpose |
|-------|--------|--------|------|-------|---------|
| /auth/login | GET | ✅ | ❌ | ❌ | Sign in form |
| /auth/signup | GET | ✅ | ❌ | ❌ | Sign up form |
| /auth/verify-email | GET | ✅ | ✅ | ✅ | Email verification |
| /auth/forgot-password | GET | ✅ | ✅ | ✅ | Password reset request |
| /auth/reset-password | GET | ✅ | ✅ | ✅ | Password reset form |
| /dashboard | GET | ❌ | ✅ | ✅ | User dashboard |
| /admin | GET | ❌ | ❌ | ✅ | Admin dashboard |

---

## 🔒 Security Features

### **Password Requirements**
- Minimum 8 characters
- No special requirements (Supabase handles strength)
- Confirmation on signup

### **Email Verification**
- Sent on signup
- 24-hour expiration
- Can resend

### **Session Management**
- Supabase Auth handles tokens
- Secure HTTP-only cookies
- Auto-refresh tokens

### **Password Reset**
- Reset link in email
- 1-hour expiration
- Token validated before allow change

### **Admin Role**
- Stored in JWT metadata
- Checked on every admin route access
- Verified in middleware

---

## 🧪 Testing

### **Test Sign Up**
1. Visit `/auth/signup`
2. Enter name, email, password (8+ chars)
3. Submit
4. Check email for verification link
5. Click link
6. Redirect to `/auth/verify-email`
7. Visit `/auth/login`
8. Sign in with credentials

### **Test Sign In**
1. Visit `/auth/login`
2. Enter demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123456`
3. Should redirect to `/dashboard`

### **Test Dashboard Protection**
1. Sign out (log out)
2. Visit `/dashboard`
3. Should redirect to `/auth/login`

### **Test Admin Protection**
1. Sign in as regular user
2. Visit `/admin`
3. Should redirect to `/dashboard`
4. Sign out
5. Make user admin (via SQL or dashboard)
6. Sign in again
7. Visit `/admin`
8. Should allow access

### **Test Forgot Password**
1. Visit `/auth/forgot-password`
2. Enter email
3. Should show success message
4. Check email for reset link
5. Click link
6. Should redirect to `/auth/reset-password`
7. Enter new password
8. Should show success
9. Sign in with new password

---

## ⚙️ Configuration

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Middleware Config**
```javascript
export const config = {
  matcher: [
    "/dashboard/:path*",  // Dashboard routes
    "/admin/:path*",      // Admin routes
    "/auth/login",        // Auth pages
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ],
};
```

---

## 🐛 Troubleshooting

### **Issue: Cannot sign in**
**Solution:**
1. Check credentials are correct
2. Verify user exists in Supabase
3. Check email is verified
4. Try password reset

### **Issue: Admin cannot access /admin**
**Solution:**
1. Verify `role='admin'` is set in user metadata
2. Sign out and sign in again (refresh JWT)
3. Check middleware config includes `/admin/:path*`

### **Issue: Redirects not working**
**Solution:**
1. Check middleware.ts is in root directory
2. Verify environment variables are set
3. Clear browser cache
4. Restart dev server

### **Issue: Password reset link not working**
**Solution:**
1. Check email for link
2. Verify link hasn't expired (1 hour)
3. Check NEXT_PUBLIC_APP_URL is correct
4. Try requesting new reset link

---

## 📚 Files Created

```
app/auth/
├── login/page.tsx              ✅ Sign in form
├── signup/page.tsx             ✅ Sign up form
├── verify-email/page.tsx       ✅ Email verification
├── forgot-password/page.tsx    ✅ Password reset request
└── reset-password/page.tsx     ✅ Password reset form

middleware.ts                   ✅ Route protection
```

---

## ✅ Checklist

```
Authentication
□ Sign up flow working
□ Sign in flow working
□ Email verification sent
□ Password reset working
□ Sessions persisting
□ Tokens refreshing

Authorization
□ /dashboard protected
□ /admin protected
□ Non-admin blocked from /admin
□ Authenticated redirected from /auth
□ Middleware working correctly

Admin Setup
□ Admin user created
□ Admin role verified in JWT
□ Admin can access /admin
□ Regular users blocked from /admin
```

---

## 🚀 Next Steps

1. ✅ Set up admin users
2. ✅ Test all auth flows
3. Create user profile completion page
4. Add OAuth (Google, GitHub)
5. Implement role-based API access

**Authentication system is complete!** 🔐
