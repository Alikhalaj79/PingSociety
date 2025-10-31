# Next.js SSR/SSG Authentication Guide

## Overview

This directory contains server-side authentication utilities for Next.js App Router, following the most professional and modern approach.

## Architecture

### **Server-Side Authentication (Recommended)**

1. **API Routes** (`src/app/api/auth/`)

   - `/api/auth/send-otp` - Server-side OTP sending
   - `/api/auth/verify-otp` - Server-side OTP verification
   - HTTP-only cookies for secure token storage

2. **Middleware** (`src/middleware.ts`)

   - Route protection
   - Automatic redirects
   - Token validation

3. **Server Components**
   - `getServerSideAuth()` for server-side auth checks
   - `getClientSideAuth()` for client-side auth checks

### **Why This Approach is Better:**

#### ✅ **Security Benefits:**

- HTTP-only cookies (XSS protection)
- Server-side validation
- No client-side token exposure
- CSRF protection

#### ✅ **Performance Benefits:**

- Server-side rendering
- Faster initial page loads
- Better SEO
- Reduced client-side JavaScript

#### ✅ **Professional Standards:**

- Industry best practices
- Enterprise-grade security
- Scalable architecture
- Maintainable code

## File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── send-otp/route.ts      # API route for OTP
│   │   └── verify-otp/route.ts    # API route for verification
│   ├── register/
│   │   ├── page.tsx              # Server Component
│   │   └── RegisterForm.tsx      # Client Component
│   └── otp/
│       ├── page.tsx              # Server Component
│       └── OTPForm.tsx           # Client Component
├── lib/
│   ├── auth.ts                   # Auth utilities
│   └── README.md                 # This file
└── middleware.ts                 # Route protection
```

## Usage Examples

### **Server Component (page.tsx)**

```typescript
import { redirect } from "next/navigation";
import { getClientSideAuth } from "@/lib/auth";

export default async function RegisterPage() {
  const auth = getClientSideAuth();

  if (auth.isAuthenticated) {
    redirect("/");
  }

  return <RegisterForm />;
}
```

### **API Route**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Server-side validation
  // Call backend API
  // Set HTTP-only cookie

  return NextResponse.json({ success: true });
}
```

### **Client Component**

```typescript
"use client";

export default function RegisterForm() {
  const handleSubmit = async (data) => {
    // Call API route instead of direct API
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };
}
```

## Security Features

### **HTTP-Only Cookies**

```typescript
nextResponse.cookies.set("auth_token", token, {
  httpOnly: true, // No JavaScript access
  secure: true, // HTTPS only
  sameSite: "lax", // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

### **Middleware Protection**

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/register", request.url));
  }
}
```

## Comparison: SSR vs React Query

| Feature           | Next.js SSR/SSG          | React Query              |
| ----------------- | ------------------------ | ------------------------ |
| **Security**      | ✅ HTTP-only cookies     | ❌ localStorage          |
| **Performance**   | ✅ Server-side rendering | ❌ Client-side only      |
| **SEO**           | ✅ Full SSR support      | ❌ Client-side rendering |
| **Initial Load**  | ✅ Faster                | ❌ Slower                |
| **Caching**       | ✅ Server-side           | ✅ Client-side           |
| **Real-time**     | ❌ Limited               | ✅ Excellent             |
| **Complex State** | ❌ Limited               | ✅ Excellent             |

## Best Practices

1. **Use Server Components** for initial data fetching
2. **Use API Routes** for server-side operations
3. **Use HTTP-only cookies** for token storage
4. **Use Middleware** for route protection
5. **Use Client Components** only when necessary
6. **Combine with React Query** for complex client-side state

## When to Use What

### **Use Next.js SSR/SSG when:**

- Security is critical
- SEO is important
- Initial page load speed matters
- Simple authentication flow
- Server-side validation needed

### **Use React Query when:**

- Complex client-side state
- Real-time updates needed
- Optimistic updates required
- Background refetching needed
- Complex caching requirements

## Hybrid Approach (Recommended)

For the best of both worlds:

1. **Server Components** for initial auth checks
2. **API Routes** for secure operations
3. **React Query** for client-side state management
4. **HTTP-only cookies** for token storage
5. **Middleware** for route protection

This gives you enterprise-grade security with modern UX patterns.


















