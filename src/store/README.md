# Redux Toolkit (RTK) Store Documentation

## Overview

This directory contains the Redux Toolkit store configuration and slices for the PingSociety application. RTK provides a more efficient and modern approach to state management compared to the traditional Context API.

## Files Structure

### `index.ts`

Main store configuration file that combines all reducers and configures middleware.

**Features:**

- Configured with Redux Toolkit's `configureStore`
- Includes serializable check configuration for persistence
- Exports typed `RootState` and `AppDispatch` types

### `hooks.ts`

Typed Redux hooks for TypeScript support.

**Exports:**

- `useAppDispatch`: Typed dispatch hook
- `useAppSelector`: Typed selector hook

### `slices/authSlice.ts`

Authentication slice containing all auth-related state and actions.

**Features:**

- Async thunks for API calls (`sendOtp`, `verifyOtp`, `initializeAuth`)
- Synchronous actions (`clearError`, `logout`, `setLoading`)
- Proper error handling and loading states
- Automatic token management

## State Structure

```typescript
interface AuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
```

## Available Actions

### Async Thunks (API Calls)

- `sendOtp(phone: string)` - Send OTP to phone number
- `verifyOtp({ phone, otp, otpId })` - Verify OTP code
- `initializeAuth()` - Initialize auth from localStorage

### Synchronous Actions

- `clearError()` - Clear error state
- `logout()` - Logout user and clear all auth data
- `setLoading(boolean)` - Set loading state

## Usage in Components

### Using the Custom Hook

```typescript
import { useAuthRTK } from "@/hooks/useAuthRTK";

function MyComponent() {
  const {
    sendOtp,
    verifyOtp,
    isLoading,
    error,
    isAuthenticated,
    user,
    logout,
  } = useAuthRTK();

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

### Using Redux Hooks Directly

```typescript
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendOtp, clearError } from "@/store/slices/authSlice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSendOtp = () => {
    dispatch(sendOtp("09123456789"));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };
}
```

## Provider Setup

The Redux store is provided to the entire application through:

1. **ReduxProvider** (`src/providers/ReduxProvider.tsx`) - Wraps the app with Redux Provider
2. **AuthInitializer** (`src/components/AuthInitializer.tsx`) - Initializes auth state on app load
3. **Layout** (`src/app/layout.tsx`) - Includes both providers

## Benefits of RTK over Context API

1. **Performance**: RTK uses optimized selectors and prevents unnecessary re-renders
2. **DevTools**: Full Redux DevTools support for debugging
3. **Middleware**: Built-in support for async operations and side effects
4. **TypeScript**: Better type safety and inference
5. **Scalability**: Easier to manage complex state as the app grows
6. **Time Travel**: Redux DevTools time travel debugging
7. **Predictable**: Clear data flow and state mutations

## Error Handling

All async thunks include comprehensive error handling:

- Network errors
- API response errors
- Validation errors
- Timeout errors

Error messages are in Persian/Farsi and user-friendly.

## Token Management

Authentication tokens are automatically managed:

- Stored in localStorage
- Added to API request headers
- Cleared on logout
- Restored on app initialization

## Middleware Configuration

The store includes:

- Serializable check for persistence compatibility
- Redux DevTools integration
- Optimized for production builds

## Best Practices

1. Use the custom `useAuthRTK` hook for auth-related operations
2. Use typed Redux hooks (`useAppDispatch`, `useAppSelector`) for direct store access
3. Keep async logic in thunks, not in components
4. Use proper error handling in all async operations
5. Clear errors when starting new operations
6. Use loading states to improve UX















