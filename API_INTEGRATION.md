# API Integration Documentation

This document describes how the backend API has been integrated into the UJ AI Club frontend application.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [API Implementation](#api-implementation)
3. [Authentication System](#authentication-system)
4. [Protected Routes](#protected-routes)
5. [Error Handling](#error-handling)
6. [API Endpoints Usage](#api-endpoints-usage)

## Environment Configuration

### `.env.local`

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Replace with your actual backend API URL in production.

## API Implementation

### `/lib/api.js`

Central API utility providing:

- **Base API Request Handler**: Handles all HTTP requests with proper headers and authentication
- **Error Handling**: Custom `ApiError` class for structured error handling
- **Automatic Token Management**: Automatically includes auth tokens from localStorage
- **Status Code Handling**:
  - 401 (Unauthorized): Auto-redirects to login and clears tokens
  - 404 (Not Found): Returns proper error
  - Other errors: Structured error responses

### API Modules

#### Authentication API (`authApi`)

- `login(email, password)` - User login
- `signup(fullName, phoneNum, email, password)` - User registration

#### Leaderboard API (`leaderboardApi`)

- `getAll()` - Get all leaderboards (public)

#### Resources API (`resourcesApi`)

- `getAll()` - Get all resources (public)
- `getById(id)` - Get specific resource (public)

#### Challenges API (`challengesApi`) - **Requires Authentication**

- `getCurrent()` - Get current challenge
- `getLeaderboard()` - Get challenge leaderboard

#### User API (`userApi`) - **Requires Authentication**

- `getProfile()` - Get user profile with stats

#### Contact API (`contactApi`)

- `send(name, email, message)` - Send contact message

## Authentication System

### `/contexts/AuthContext.js`

Provides global authentication state management:

```javascript
const { user, token, loading, login, logout, isAuthenticated } = useAuth();
```

**Methods:**

- `login(userData, authToken)` - Store user data and token
- `logout()` - Clear auth data and redirect to login
- `isAuthenticated()` - Check if user is logged in

**State:**

- `user` - Current user object
- `token` - Authentication token
- `loading` - Loading state during initialization

### Usage in Components

```javascript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated()) {
    return <div>Welcome {user.fullName}</div>;
  }
  return <div>Please login</div>;
}
```

## Protected Routes

### `/components/ProtectedRoute.js`

Wrapper component for routes requiring authentication:

```javascript
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SecurePage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

**Features:**

- Auto-redirects to `/login` if not authenticated
- Shows loading state during auth check
- Prevents content flash before redirect

**Protected Pages:**

- `/arcade` - Challenges and leaderboard
- `/challanges` - Competition page

## Error Handling

### Global Error Boundary (`/app/error.js`)

Catches and displays unexpected errors with:

- Error message display
- Retry functionality
- Home navigation option

### 404 Not Found (`/app/not-found.js`)

Custom 404 page with navigation back to home.

### API Error Handling

All API calls include try-catch blocks:

```javascript
try {
  const data = await resourcesApi.getAll();
  setResources(data);
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 404) {
      setError("Resource not found");
    } else if (err.status === 0) {
      setError("Network error");
    } else {
      setError(err.message);
    }
  } else {
    setError("An unexpected error occurred");
  }
}
```

## API Endpoints Usage

### 1. Login Page (`/app/login/page.js`)

**Endpoint:** `POST /api/auth/login`

```javascript
const response = await authApi.login(email, password);
login(response.user, response.token);
router.push("/arcade");
```

**Features:**

- Form validation
- Error display
- Loading states
- Auto-redirect on success

### 2. Sign Up Page (`/app/signup/page.js`)

**Endpoint:** `POST /api/auth/signup`

```javascript
const response = await authApi.signup(fullName, phoneNum, email, password);
login(response.user, response.token);
router.push("/arcade");
```

### 3. Resources List (`/app/resources/page.js`)

**Endpoint:** `GET /api/resources`

```javascript
const data = await resourcesApi.getAll();
setResources(data);
```

**Features:**

- Search functionality
- Loading states
- Error handling
- Empty state display

### 4. Resource Detail (`/app/resources/[id]/page.js`)

**Endpoint:** `GET /api/resources/:id`

```javascript
const data = await resourcesApi.getById(params.id);
setResource(data);
```

**Features:**

- 404 handling
- Loading state
- Notion embed integration

### 5. Arcade Page (`/app/arcade/page.js`) - **Protected**

**Endpoints:**

- `GET /api/challenges/current`
- `GET /api/challenges/leaderboard`
- `GET /api/users/profile`

```javascript
// Switch between views
if (activeView === "challenges") {
  const data = await challengesApi.getCurrent();
} else if (activeView === "leaderboard") {
  const data = await challengesApi.getLeaderboard();
} else if (activeView === "profile") {
  const data = await userApi.getProfile();
}
```

### 6. Challenges Page (`/app/challanges/page.js`) - **Protected**

Similar to Arcade page with three views:

- Challenges
- Leaderboard
- Profile

### 7. Leaderboard Carousel (`/app/components/LeaderboardCarousel.js`)

**Endpoint:** `GET /api/leaderboards`

```javascript
const data = await leaderboardApi.getAll();
const transformedData = data.map((board, index) => ({
  id: board.id || index,
  title: board.title,
  entries: board.entries.map((entry, entryIndex) => ({
    rank: entryIndex + 1,
    name: entry.name,
    points: entry.points,
  })),
}));
```

### 8. Contact Section (`/app/components/ContactSection.js`)

**Endpoint:** `POST /api/contact`

```javascript
await contactApi.send(name, email, message);
setStatus({
  type: "success",
  message: "Message sent successfully!",
});
```

**Features:**

- Success/error feedback
- Form reset on success
- Loading state

### 9. Navbar (`/app/components/Navbar.js`)

**Features:**

- Displays user name when logged in
- Shows Login/Signup buttons when logged out
- Logout functionality

```javascript
const { user, isAuthenticated, logout } = useAuth();

{
  isAuthenticated() ? (
    <>
      <span>Welcome, {user.fullName}</span>
      <button onClick={logout}>Logout</button>
    </>
  ) : (
    <>
      <Link href="/login">Login</Link>
      <Link href="/signup">Sign Up</Link>
    </>
  );
}
```

## Testing the Integration

### 1. Start the Backend API

Ensure your backend server is running on the configured URL (default: `http://localhost:3001/api`)

### 2. Test Authentication Flow

1. Navigate to `/signup`
2. Create a new account
3. Should auto-login and redirect to `/arcade`
4. Try logging out (clears token)
5. Try accessing `/arcade` without login (should redirect to `/login`)

### 3. Test Public Routes

- `/resources` - Should load without authentication
- `/` - Home page with leaderboard carousel

### 4. Test Protected Routes

- `/arcade` - Requires login
- `/challanges` - Requires login

### 5. Test Error Scenarios

- Invalid login credentials (401)
- Network disconnection (network error)
- Invalid resource ID (404)
- Server errors (5xx)

## Common Issues and Solutions

### Issue: "Network error occurred"

**Solution:** Check that your backend API is running and the `NEXT_PUBLIC_API_URL` is correct.

### Issue: Constantly redirected to login

**Solution:** Check browser console for 401 errors. Token might be invalid or backend auth is failing.

### Issue: CORS errors

**Solution:** Configure your backend to allow requests from your frontend domain.

### Issue: Token not persisting

**Solution:** Check that localStorage is working. Some browsers block it in private mode.

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. Consider using httpOnly cookies for production.
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit.
3. **Token Expiration**: Implement token refresh logic for better UX.
4. **Input Validation**: All user inputs are validated on both client and server.
5. **XSS Protection**: React automatically escapes content, but be careful with `dangerouslySetInnerHTML`.

## Next Steps

1. Implement token refresh mechanism
2. Add remember me functionality
3. Implement password reset flow
4. Add email verification
5. Enhance error messages with more specific feedback
6. Add request retry logic for failed requests
7. Implement request caching for better performance
8. Add loading skeletons instead of basic loading text
