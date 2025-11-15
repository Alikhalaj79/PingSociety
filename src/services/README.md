# API Service Documentation

## Overview

This directory contains the API service layer for the PingSociety application, providing a clean and professional interface to communicate with the backend API.

## Files Structure

### `api.ts`

Main API service class that handles all HTTP requests to the backend.

**Features:**

- Generic request method with timeout handling
- Automatic error handling and response formatting
- Support for GET, POST, PUT, DELETE methods
- Authentication token management
- TypeScript support with proper typing

**Usage:**

```typescript
import { apiService } from "@/services/api";

// Send OTP
const result = await apiService.sendOtp({ phone: "09123456789" });

// Verify OTP
const result = await apiService.verifyOtp({
  phone: "09123456789",
  otp: "123456",
});
```

### Configuration

API configuration is managed in `src/config/api.ts`:

- Base URL: `http://209.38.235.116:80`
- Timeout: 10 seconds
- Default headers for JSON requests

### Authentication

The service automatically handles authentication tokens:

- Tokens are stored in localStorage
- Automatically added to request headers
- Can be set/removed as needed

### Error Handling

All API calls return a standardized response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Available Endpoints

- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /user/profile` - Get user profile
- `PUT /user/update` - Update user profile
- `GET /events` - Get events list
- `GET /events/:id` - Get event details
- `GET /tickets` - Get user tickets
- `POST /tickets/purchase` - Purchase ticket

## Integration with React Components

The API service is integrated with React components through:

1. **useAuth Hook** (`src/hooks/useAuth.ts`) - Manages authentication state
2. **AuthContext** (`src/contexts/AuthContext.tsx`) - Provides auth state to components
3. **AuthProvider** - Wraps the app to provide authentication context

## Example Usage in Components

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { sendOtp, verifyOtp, isLoading, error } = useAuth();

  const handleSendOtp = async () => {
    const result = await sendOtp("09123456789");
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
}
```

## Error Messages

All error messages are in Persian/Farsi and user-friendly:

- Network errors: "خطا در ارتباط با سرور"
- Timeout errors: "درخواست زمان زیادی طول کشید. لطفاً دوباره تلاش کنید."
- Validation errors: Custom messages from backend
- Generic errors: "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید."
