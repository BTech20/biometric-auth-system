# API Documentation

## 📚 REST API Reference

Base URL: `http://localhost:5000/api` (Development)  
Production: `https://your-domain.com/api`

---

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Token expiry: 24 hours

---

## 📋 Endpoints

### 1. User Registration

**POST** `/api/register`

Register a new user with biometric enrollment.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "face_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "fingerprint_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user_id": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2026-01-12T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields or invalid data
- `409 Conflict`: Username or email already exists
- `500 Internal Server Error`: Server processing error

---

### 2. User Login

**POST** `/api/login`

Authenticate user with credentials.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_active": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account inactive

---

### 3. Biometric Verification

**POST** `/api/verify`

Verify identity using biometrics.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "face_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "fingerprint_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "threshold": 20
}
```

**Response (200 OK) - Success:**
```json
{
  "verified": true,
  "username": "john_doe",
  "user_id": 1,
  "face_distance": 8.5,
  "fingerprint_distance": 12.3,
  "combined_distance": 10.4,
  "threshold": 20,
  "confidence": 95.2,
  "timestamp": "2026-01-12T10:35:00Z"
}
```

**Response (200 OK) - Failure:**
```json
{
  "verified": false,
  "username": null,
  "face_distance": 45.2,
  "fingerprint_distance": 52.1,
  "combined_distance": 48.65,
  "threshold": 20,
  "message": "No matching user found",
  "reason": "Distance exceeds threshold"
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid images
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Processing error

---

### 4. Get User Profile

**GET** `/api/profile`

Retrieve current user's profile and recent activity.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "is_active": true,
  "created_at": "2026-01-10T08:00:00Z",
  "updated_at": "2026-01-12T10:35:00Z",
  "total_authentications": 15,
  "successful_authentications": 13,
  "success_rate": 86.7,
  "recent_logins": [
    {
      "id": 25,
      "auth_method": "biometric",
      "success": true,
      "hamming_distance": 10.4,
      "threshold": 20,
      "timestamp": "2026-01-12T10:35:00Z"
    },
    {
      "id": 24,
      "auth_method": "password",
      "success": true,
      "hamming_distance": null,
      "threshold": null,
      "timestamp": "2026-01-12T09:15:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: User not found

---

### 5. Get System Statistics

**GET** `/api/stats`

Retrieve system-wide statistics (admin/analytics).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "total_users": 150,
  "active_users": 142,
  "inactive_users": 8,
  "total_authentications": 2543,
  "successful_authentications": 2301,
  "failed_authentications": 242,
  "success_rate": 90.5,
  "biometric_authentications": 1876,
  "password_authentications": 667,
  "average_hamming_distance": 15.3,
  "stats_generated_at": "2026-01-12T10:40:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

### 6. Get Analytics Data

**GET** `/api/analytics`

Retrieve detailed analytics for research.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Filter from date (ISO 8601)
- `end_date` (optional): Filter to date (ISO 8601)
- `user_id` (optional): Filter by specific user

**Response (200 OK):**
```json
{
  "time_period": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-12T23:59:59Z"
  },
  "verification_metrics": {
    "total_attempts": 2543,
    "genuine_attempts": 2301,
    "impostor_attempts": 242,
    "FAR": 0.05,
    "FRR": 0.09,
    "EER": 0.07
  },
  "distance_distribution": {
    "0-10": 856,
    "11-20": 1445,
    "21-30": 142,
    "31-40": 54,
    "41-50": 28,
    "51+": 18
  },
  "threshold_analysis": [
    {
      "threshold": 10,
      "FAR": 0.01,
      "FRR": 0.25
    },
    {
      "threshold": 15,
      "FAR": 0.03,
      "FRR": 0.15
    },
    {
      "threshold": 20,
      "FAR": 0.05,
      "FRR": 0.09
    }
  ],
  "hourly_distribution": {
    "0": 45,
    "1": 32,
    "...": "...",
    "23": 67
  }
}
```

---

### 7. Update Profile

**PUT** `/api/profile`

Update user profile information.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "password": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "newemail@example.com",
    "updated_at": "2026-01-12T10:45:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Invalid or expired token
- `409 Conflict`: Email already in use

---

### 8. Re-enroll Biometrics

**POST** `/api/biometrics/re-enroll`

Update biometric templates.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "face_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "fingerprint_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (200 OK):**
```json
{
  "message": "Biometric templates updated successfully",
  "updated_at": "2026-01-12T10:50:00Z"
}
```

---

### 9. Logout

**POST** `/api/logout`

Invalidate current session token.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 10. Health Check

**GET** `/api/health`

Check API health status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-12T10:55:00Z",
  "services": {
    "database": "connected",
    "ml_models": "loaded",
    "storage": "available"
  }
}
```

---

## 📊 Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary unavailability |

---

## 🔒 Security Headers

All responses include security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📝 Request Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "face_image": "data:image/jpeg;base64,...",
    "fingerprint_image": "data:image/jpeg;base64,..."
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

**Verify:**
```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "face_image": "data:image/jpeg;base64,...",
    "fingerprint_image": "data:image/jpeg;base64,...",
    "threshold": 20
  }'
```

---

### JavaScript Examples

**Using Axios:**

```javascript
import axios from 'axios';

// Register
const register = async (userData) => {
  const response = await axios.post('/api/register', {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    face_image: userData.faceImage,
    fingerprint_image: userData.fingerprintImage
  });
  return response.data;
};

// Login
const login = async (username, password) => {
  const response = await axios.post('/api/login', {
    username,
    password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Verify
const verify = async (biometricData, threshold = 20) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/verify', {
    face_image: biometricData.faceImage,
    fingerprint_image: biometricData.fingerprintImage,
    threshold
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Get Profile
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
```

---

## ⚡ Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous requests:** 100 requests/hour
- **Authenticated requests:** 1000 requests/hour
- **Verification requests:** 100 requests/hour per user

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1705060800
```

---

## 🐛 Error Response Format

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": {
    "field": "username",
    "issue": "already exists"
  },
  "timestamp": "2026-01-12T11:00:00Z"
}
```

---

## 📦 Image Format

Biometric images should be:
- **Format:** JPEG or PNG
- **Encoding:** Base64 data URI
- **Size:** < 5MB
- **Resolution:** Minimum 224x224 pixels
- **Color:** RGB (face), Grayscale or RGB (fingerprint)

**Example:**
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/...
```

---

## 🔄 Webhook Support (Future)

Planned webhook endpoints for real-time notifications:

- `verification.success`
- `verification.failure`
- `user.registered`
- `account.locked`

---

**API Version:** 1.0  
**Last Updated:** January 2026  
**Base URL:** `/api/v1`
