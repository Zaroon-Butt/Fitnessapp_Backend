# React Native Auth API Documentation

## Overview
A Node.js/Express API with MongoDB for React Native authentication with JWT tokens and forgot password functionality.

## Available Endpoints

### Authentication Routes

#### 1. Sign Up
- **URL:** `POST /api/auth/signup`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Sign In
- **URL:** `POST /api/auth/signin`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 3. Get Profile
- **URL:** `GET /api/auth/profile/:userId`
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-08-26T..."
  }
}
```

#### 4. Health Check
- **URL:** `GET /api/health`
- **Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-08-26T..."
}
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB service on your machine

3. Update the `.env` file with your configuration

4. Run the development server:
```bash
npm run dev
```

## Environment Variables

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/reactnative_auth
```

## React Native Usage Example

```javascript
// Sign Up
const signup = async (userData) => {
  const response = await fetch('http://your-server:4000/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return await response.json();
};

// Sign In
const signin = async (credentials) => {
  const response = await fetch('http://your-server:4000/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return await response.json();
};

// Get Profile
const getProfile = async (userId) => {
  const response = await fetch(`http://your-server:4000/api/auth/profile/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
```

## Session Management in React Native
Since we're not using JWT tokens, you'll need to manage user sessions in your React Native app:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save user data after successful login
const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Get user data
const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Clear user data on logout
const logout = async () => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
```
