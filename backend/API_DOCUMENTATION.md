# Solace AI API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication Endpoints

### 1. Register New User
**POST** `/api/auth/register`

Creates a new user account with name, email, password, and about me information.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "about_me": "Software developer passionate about AI",
  "password": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "about_me": "Software developer passionate about AI",
  "id": "6952c620930a7c512e71c9e6",
  "is_active": true,
  "created_at": "2025-12-29T18:19:12.216000",
  "updated_at": "2025-12-29T18:19:12.216000"
}
```

**Error Response (400):**
```json
{
  "detail": "Email already registered"
}
```

### 2. Login
**POST** `/api/auth/login`

Authenticates user and returns JWT access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "about_me": "Software developer passionate about AI",
    "id": "6952c620930a7c512e71c9e6",
    "is_active": true,
    "created_at": "2025-12-29T18:19:12.216000",
    "updated_at": "2025-12-29T18:19:12.216000"
  }
}
```

**Error Response (401):**
```json
{
  "detail": "Incorrect email or password"
}
```

### 3. Get Current User Profile
**GET** `/api/auth/me`

Returns the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "about_me": "Software developer passionate about AI",
  "id": "6952c620930a7c512e71c9e6",
  "is_active": true,
  "created_at": "2025-12-29T18:19:12.216000",
  "updated_at": "2025-12-29T18:19:12.216000"
}
```

**Error Response (401):**
```json
{
  "detail": "Could not validate credentials"
}
```

### 4. Update Current User Profile
**PUT** `/api/auth/me`

Updates the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (all fields optional):**
```json
{
  "name": "Jane Doe",
  "about_me": "Updated bio information"
}
```

**Success Response (200):**
```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "about_me": "Updated bio information",
  "id": "6952c620930a7c512e71c9e6",
  "is_active": true,
  "created_at": "2025-12-29T18:19:12.216000",
  "updated_at": "2025-12-29T18:20:30.123000"
}
```

## Example Usage with cURL

### Register a user:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "about_me": "Software developer",
    "password": "securepassword123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Get profile (use token from login response):
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Example Usage with JavaScript/TypeScript

```typescript
// Register
const registerResponse = await fetch('http://localhost:8000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    about_me: 'Software developer',
    password: 'securepassword123'
  })
});
const user = await registerResponse.json();

// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123'
  })
});
const { access_token, user: userData } = await loginResponse.json();

// Get profile
const profileResponse = await fetch('http://localhost:8000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const profile = await profileResponse.json();
```

## Interactive API Documentation

Visit these URLs when the server is running for interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

