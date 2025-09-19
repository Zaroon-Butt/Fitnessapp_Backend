# Backend API for React Native App

This is a Node.js/Express backend API with MongoDB for a React Native application featuring authentication and forgot password functionality.

## Features

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Password Encryption (bcrypt)
- ✅ Forgot Password with OTP
- ✅ Email OTP Verification
- ✅ Password Reset

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your_app_name

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration (Gmail example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=3000
NODE_ENV=development
```

### 3. Gmail Setup for OTP Emails
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS` (not your regular Gmail password)

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/checkEmail` - Check if email exists

### Forgot Password Flow
- `POST /api/auth/forgot-password` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get reset token
- `POST /api/auth/reset-password` - Reset password with token

## Forgot Password Implementation

The forgot password feature works in 3 steps:

### Step 1: Request OTP
```javascript
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### Step 2: Verify OTP
```javascript
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "resetToken": "temporary_token" }
```

### Step 3: Reset Password
```javascript
POST /api/auth/reset-password
Body: { "resetToken": "temporary_token", "newPassword": "newpass123" }
```

## React Native Integration

Here's how to implement this in your React Native app:

```javascript
// Forgot Password Screen
const ForgotPasswordScreen = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOTP = async () => {
    try {
      const response = await fetch('http://your-server:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (response.ok) {
        setStep(2);
        Alert.alert('Success', 'OTP sent to your email');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch('http://your-server:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const result = await response.json();
      
      if (response.ok) {
        setResetToken(result.resetToken);
        setStep(3);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://your-server:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Password reset successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  // Render UI based on current step
};
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **OTP Expiration**: OTPs expire after 10 minutes
- **Reset Token Expiration**: Reset tokens expire after 15 minutes
- **Input Validation**: Comprehensive validation on all endpoints
- **Email Verification**: Only existing users can request password reset

## Testing

Use the included test file to verify the forgot password functionality:

```bash
node test-forgot-password.js
```

Make sure to update the email addresses in the test file with real ones for testing.

## Project Structure

```
src/
├── config/
│   └── Database.js          # MongoDB connection
├── models/
│   └── AuthSchema.js        # User model with OTP fields
├── routes/
│   └── authRoutes.js        # Authentication & forgot password routes
├── helper/
│   └── emailService.js      # Email utilities for sending OTP
└── server.js               # Main server file
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT implementation
- **nodemailer**: Email sending
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
