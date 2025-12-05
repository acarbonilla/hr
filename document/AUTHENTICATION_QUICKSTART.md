# Quick Start Guide - Authentication Testing

## 🚀 Quick Start

### 1. Create Test User

```bash
cd backend
python manage.py create_test_user
```

This creates a test user with credentials:

- **Username:** testuser
- **Password:** TestPass123!
- **Email:** test@hirenow.com
- **Type:** recruiter

### 2. Start Backend Server

```bash
cd backend
python manage.py runserver
```

Server runs at: http://localhost:8000

### 3. Start Frontend (Optional)

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 🧪 Testing Options

### Option 1: Frontend UI Testing

1. Open browser: http://localhost:3000/login
2. Login with credentials:
   - Username: `testuser`
   - Password: `TestPass123!`
3. Should redirect to dashboard
4. Click logout button
5. Should redirect back to login

### Option 2: API Testing with cURL

**Login:**

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {...},
  "tokens": {
    "access": "eyJ0eXAiOiJKV1Q...",
    "refresh": "eyJ0eXAiOiJKV1Q..."
  }
}
```

**Check Auth (replace with your token):**

```bash
curl -X GET http://localhost:8000/api/auth/check/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Logout:**

```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

### Option 3: Python Test Script

```bash
cd backend
python test_auth.py
```

This runs a comprehensive test of all authentication endpoints.

---

## 📝 Available Endpoints

### Public (No Auth)

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Refresh access token

### Protected (Auth Required)

- `GET /api/auth/check/` - Check if authenticated
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/` - Update profile
- `PATCH /api/auth/change-password/` - Change password
- `POST /api/auth/logout/` - Logout

---

## 🔑 Test Credentials

**Default Test User:**

```
Username: testuser
Password: TestPass123!
Email: test@hirenow.com
User Type: recruiter
```

**Create Custom Test User:**

```bash
python manage.py create_test_user \
  --username=john \
  --password=John123! \
  --email=john@company.com \
  --user-type=hr_admin
```

**Create Superuser (Admin):**

```bash
python manage.py createsuperuser
```

---

## 🐛 Troubleshooting

**Issue: Cannot login**

- Check server is running: http://localhost:8000
- Verify credentials are correct
- Check browser console for errors

**Issue: Token expired**

- Tokens expire after 1 hour (access) or 7 days (refresh)
- Login again to get new tokens
- Use refresh endpoint to get new access token

**Issue: CORS errors**

- Make sure `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check `frontend` is running on port 3000

**Issue: 401 Unauthorized**

- Check token is included in Authorization header
- Format: `Authorization: Bearer <token>`
- Token might be expired - try refreshing

---

## 📚 Documentation

- **Full API Docs:** `document/AUTHENTICATION_API.md`
- **Implementation Details:** `document/LOGIN_LOGOUT_IMPLEMENTATION.md`

---

## ✅ What's Working

- ✅ User registration
- ✅ User login (returns JWT tokens)
- ✅ Token-based authentication
- ✅ Token refresh (extends session)
- ✅ Logout (blacklists tokens)
- ✅ Profile management
- ✅ Password change
- ✅ Frontend login page
- ✅ Frontend dashboard with logout
- ✅ Auto token refresh on expiry

---

## 🎯 Next Steps

1. Test login flow on frontend
2. Try API endpoints with cURL
3. Check token expiration/refresh
4. Test logout functionality
5. Verify token blacklisting works

**Ready to test!** 🚀
