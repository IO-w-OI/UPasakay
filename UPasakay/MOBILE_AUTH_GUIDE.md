# Mobile Auth Endpoints - Setup and Testing Guide

## Overview
This guide documents the mobile auth endpoints implemented for the UPasakay mobile application.

## Implemented Endpoints

### 1. **POST /api/register** - Passenger Registration
Creates a new passenger account and returns an authentication token.

**Request:**
```json
{
  "email": "passenger@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Passenger account created successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "passenger@example.com"
    },
    "token": "1|abcdef..."
  }
}
```

**Validation Rules:**
- Email is required and must be a valid email address
- Email must be unique (no existing account)
- Password is required and must:
  - Be at least 8 characters long
  - Contain both uppercase and lowercase letters
  - Contain at least one number
  - Contain at least one special character
  - Be confirmed (password_confirmation field must match)

### 2. **POST /api/login** - Passenger Login
Authenticates a passenger with email and password, returning a new authentication token.

**Request:**
```json
{
  "email": "passenger@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "passenger@example.com"
    },
    "token": "2|abcdef..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {
    "email": ["The provided credentials are invalid."]
  }
}
```

**Note:** Login revokes all previous tokens for security.

**Validation Rules:**
- Email is required and must be a valid email address
- Password is required and must be at least 8 characters

### 3. **POST /api/logout** - Passenger Logout
Revokes the current authentication token.

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Note:** Requires valid authentication token.

### 4. **POST /api/revoke-all-tokens** - Revoke All Tokens
Revokes all authentication tokens for the authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "All tokens revoked successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Note:** Requires valid authentication token. Useful for logging out from all devices.

## Implementation Details

### Architecture
- **Controller:** [AuthController.php](app/Http/Controllers/Api/AuthController.php)
- **Form Requests:** 
  - [RegisterRequest.php](app/Http/Requests/Auth/RegisterRequest.php)
  - [LoginRequest.php](app/Http/Requests/Auth/LoginRequest.php)
- **Tests:** [PassengerAuthTest.php](tests/Feature/Auth/PassengerAuthTest.php)

### Key Features
1. **Token-based Authentication:** Uses Laravel Sanctum for API token generation and validation
2. **Password Security:** Passwords are hashed using bcrypt algorithm
3. **Input Validation:** Comprehensive validation with consistent error messages
4. **Token Management:** 
   - Tokens are automatically created on successful registration/login
   - Previous tokens are revoked on new login (security feature)
   - All tokens can be revoked with one endpoint (device logout)
5. **Passenger Profile Creation:** Auto-creates passenger profile with unique passenger number on registration
6. **CORS Support:** All endpoints are accessible from mobile app with proper CORS configuration

### Database Schema
The implementation uses existing Eloquent models:
- **User Model:** Stores email and hashed password
- **Passenger Model:** Stores passenger-specific information (passenger_number, course)
- **Personal Access Tokens (Sanctum):** Stores API tokens for authentication

## Setting Up Tests

### Prerequisites
The tests require one of the following database drivers:
- SQLite (with php-sqlite3 extension)
- PostgreSQL (with php-pgsql extension) - **Currently configured**
- MySQL (with php-mysql extension)

### Database Configuration for Testing

**For SQLite (if extension is available):**
Edit `phpunit.xml`:
```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value="storage/testing.sqlite"/>
```

**For PostgreSQL (current configuration):**
Edit `phpunit.xml`:
```xml
<env name="DB_CONNECTION" value="pgsql"/>
<env name="DB_HOST" value="localhost"/>
<env name="DB_PORT" value="5432"/>
<env name="DB_DATABASE" value="upasakay_test"/>
<env name="DB_USERNAME" value="postgres"/>
<env name="DB_PASSWORD" value=""/>
```

Setup test database:
```bash
createdb upasakay_test -U postgres
```

**For MySQL:**
Edit `phpunit.xml`:
```xml
<env name="DB_CONNECTION" value="mysql"/>
<env name="DB_HOST" value="127.0.0.1"/>
<env name="DB_PORT" value="3306"/>
<env name="DB_DATABASE" value="upasakay_test"/>
<env name="DB_USERNAME" value="root"/>
<env name="DB_PASSWORD" value=""/>
```

### Running Tests

1. **Run all auth tests:**
```bash
php artisan test tests/Feature/Auth/PassengerAuthTest.php --testsuite=Feature
```

2. **Run specific test:**
```bash
php artisan test tests/Feature/Auth/PassengerAuthTest.php --filter=test_passenger_can_register_with_valid_credentials
```

3. **Run with verbose output:**
```bash
php artisan test tests/Feature/Auth/PassengerAuthTest.php --verbose
```

## Test Coverage

The test suite includes 20+ test cases covering:

### Registration Tests
- ✅ Successful registration with valid credentials
- ✅ Registration fails without email
- ✅ Registration fails with invalid email format
- ✅ Registration fails with duplicate email
- ✅ Registration fails without password
- ✅ Registration fails with mismatched password confirmation
- ✅ Registration fails with weak password (missing uppercase)
- ✅ Registration fails with weak password (missing numbers)
- ✅ Registration fails with weak password (missing special characters)

### Login Tests
- ✅ Successful login with valid credentials
- ✅ Login fails with non-existent email
- ✅ Login fails with incorrect password
- ✅ Login fails without email
- ✅ Login fails without password
- ✅ Login revokes previous tokens
- ✅ Returned token is usable for protected endpoints

### Logout & Token Management Tests
- ✅ Successful logout with valid token
- ✅ Logout fails without authentication
- ✅ Passenger can revoke all tokens
- ✅ Revoke all tokens fails without authentication

### Response Structure Tests
- ✅ Response structure is consistent across endpoints
- ✅ Validation errors are properly formatted

## Mobile App Integration

### Example: Registration (React Native)
```typescript
const register = async (email: string, password: string) => {
  const response = await fetch('https://api.upasakay.com/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: password,
    }),
  });

  if (!response.ok) throw new Error('Registration failed');
  const data = await response.json();
  
  // Store token securely
  await SecureStore.setItemAsync('auth_token', data.data.token);
  return data.data.user;
};
```

### Example: Authorized Request
```typescript
const makeAuthenticatedRequest = async (endpoint: string) => {
  const token = await SecureStore.getItemAsync('auth_token');
  
  const response = await fetch(`https://api.upasakay.com/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```

### Example: Logout
```typescript
const logout = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  
  await fetch('https://api.upasakay.com/api/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  // Clear stored token
  await SecureStore.deleteItemAsync('auth_token');
};
```

## Security Considerations

1. **Password Hashing:** All passwords are hashed using bcrypt before storage
2. **Token Validation:** Tokens are cryptographically secure random strings
3. **HTTPS Only:** All API calls should use HTTPS in production
4. **Token Expiration:** Current setup doesn't expire tokens; adjust `config/sanctum.php` if needed
5. **Rate Limiting:** Consider adding rate limiting to auth endpoints in production
6. **CORS Configuration:** Configure `config/cors.php` to allow only your mobile app domains
7. **Device Logout:** Users can revoke all tokens at once for security incidents

## Troubleshooting

### "Unauthorized" Error
- Verify token is being sent in `Authorization: Bearer {token}` header
- Check that token hasn't been revoked
- Ensure token is for the correct user

### "Invalid Credentials"
- Verify email is correct (case-sensitive)
- Verify password is correct
- Check that account exists

### Validation Errors
- Ensure password meets all requirements:
  - At least 8 characters
  - Contains uppercase and lowercase letters
  - Contains at least one number
  - Contains at least one special character
- Ensure password_confirmation matches password (registration only)

### Database Connection Errors
- Verify database credentials in `phpunit.xml`
- Ensure database server is running
- Check that test database exists

## Future Enhancements

Potential improvements for production:
1. Email verification for new accounts
2. Password reset functionality
3. Refresh token mechanism for better security
4. Multi-device session management
5. Two-factor authentication
6. Account lockout after failed login attempts
7. Detailed audit logs for auth events
