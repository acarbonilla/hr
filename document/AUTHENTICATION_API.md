# Authentication API Documentation

## Overview

HireNowPro uses JWT (JSON Web Token) authentication for secure API access. The authentication system includes login, logout, registration, token refresh, and profile management.

## Authentication Endpoints

### Base URL

```
http://localhost:8000/api
```

---

## 1. User Registration

**Endpoint:** `POST /api/auth/register/`

**Description:** Register a new HR user account

**Authentication:** Not required (public endpoint)

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "user_type": "recruiter", // Optional: recruiter | hr_admin | system_admin
  "first_name": "John", // Optional
  "last_name": "Doe" // Optional
}
```

**Success Response (201 Created):**

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "recruiter",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "username": ["This field is required."],
  "password": ["Password fields didn't match."]
}
```

---

## 2. User Login

**Endpoint:** `POST /api/auth/login/`

**Description:** Authenticate user and receive JWT tokens

**Authentication:** Not required (public endpoint)

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "recruiter",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "non_field_errors": ["Invalid username or password"]
}
```

---

## 3. User Logout

**Endpoint:** `POST /api/auth/logout/`

**Description:** Logout user and blacklist refresh token

**Authentication:** Required (Bearer token)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response (200 OK):**

```json
{
  "message": "Logout successful"
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Logout failed",
  "error": "Token is invalid or expired"
}
```

---

## 4. Refresh Access Token

**Endpoint:** `POST /api/auth/token/refresh/`

**Description:** Get a new access token using refresh token

**Authentication:** Not required (uses refresh token)

**Request Body:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response (200 OK):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..." // New refresh token (if rotation enabled)
}
```

**Error Response (401 Unauthorized):**

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

## 5. Check Authentication Status

**Endpoint:** `GET /api/auth/check/`

**Description:** Verify if user is authenticated and get current user data

**Authentication:** Required (Bearer token)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "recruiter",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 6. Get User Profile

**Endpoint:** `GET /api/auth/profile/`

**Description:** Get current user's profile information

**Authentication:** Required (Bearer token)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "user_type": "recruiter",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## 7. Update User Profile

**Endpoint:** `PATCH /api/auth/profile/`

**Description:** Update current user's profile information

**Authentication:** Required (Bearer token)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "first_name": "Jonathan",
  "last_name": "Doe-Smith",
  "email": "jonathan@example.com"
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "jonathan@example.com",
  "user_type": "recruiter",
  "first_name": "Jonathan",
  "last_name": "Doe-Smith"
}
```

---

## 8. Change Password

**Endpoint:** `PATCH /api/auth/change-password/`

**Description:** Change user's password

**Authentication:** Required (Bearer token)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "old_password": "SecurePass123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirm": "NewSecurePass456!"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "old_password": ["Old password is incorrect"],
  "new_password": ["Password fields didn't match."]
}
```

---

## Token Details

### Access Token

- **Lifetime:** 1 hour
- **Usage:** Include in Authorization header for all protected endpoints
- **Format:** `Authorization: Bearer <access_token>`

### Refresh Token

- **Lifetime:** 7 days
- **Usage:** Use to obtain new access token when it expires
- **Rotation:** Enabled (new refresh token issued on each refresh)
- **Blacklisting:** Enabled (tokens blacklisted on logout)

---

## Frontend Integration Example

### Login Flow

```typescript
import { authAPI } from "@/lib/api";

// 1. Login
const response = await authAPI.login({
  username: "john_doe",
  password: "SecurePass123!",
});

// 2. Store tokens
localStorage.setItem("authToken", response.data.tokens.access);
localStorage.setItem("refreshToken", response.data.tokens.refresh);
localStorage.setItem("user", JSON.stringify(response.data.user));

// 3. Tokens automatically added to requests via axios interceptor
```

### Logout Flow

```typescript
// 1. Get refresh token
const refreshToken = localStorage.getItem("refreshToken");

// 2. Call logout endpoint
await authAPI.logout(refreshToken);

// 3. Clear local storage
localStorage.removeItem("authToken");
localStorage.removeItem("refreshToken");
localStorage.removeItem("user");
```

### Automatic Token Refresh

```typescript
// Axios interceptor handles 401 errors automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await authAPI.refreshToken(refreshToken);

        // Update access token
        localStorage.setItem("authToken", response.data.access);

        // Retry original request
        error.config.headers.Authorization = `Bearer ${response.data.access}`;
        return api.request(error.config);
      } catch {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Error Codes

| Status Code | Description                          |
| ----------- | ------------------------------------ |
| 200         | Success                              |
| 201         | Created (registration successful)    |
| 400         | Bad Request (validation errors)      |
| 401         | Unauthorized (invalid/expired token) |
| 403         | Forbidden (insufficient permissions) |
| 404         | Not Found                            |
| 500         | Internal Server Error                |

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (localStorage for web, secure storage for mobile)
3. **Never expose tokens** in URLs or logs
4. **Implement CORS properly** (already configured)
5. **Use refresh tokens** to minimize access token exposure
6. **Logout on suspicious activity** (token rotation helps detect stolen tokens)
7. **Set strong password requirements** (min 8 chars, enforced by validators)

---

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

### Check Auth

```bash
curl -X GET http://localhost:8000/api/auth/check/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "<your_refresh_token>"}'
```

---

## User Types

| Type           | Description           | Permissions                        |
| -------------- | --------------------- | ---------------------------------- |
| `recruiter`    | Standard HR recruiter | View interviews, manage applicants |
| `hr_admin`     | HR administrator      | Full HR access, manage users       |
| `system_admin` | System administrator  | Full system access                 |

---

## Support

For issues or questions:

- Backend: Check `backend/accounts/views.py` for implementation
- Frontend: Check `frontend/lib/api.ts` for API client
- Database: Token blacklist tables in PostgreSQL
