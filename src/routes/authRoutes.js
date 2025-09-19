import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/AuthSchema.js";
import { sendOTPEmail, generateOTP } from "../helper/emailService.js";

const router = express.Router();

// Utility: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Utility: Send error response
const sendError = (res, status, message) => {
  return res.status(status).json({ message });
};

// ------------------- Signup -------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, Gender, Age, Height, Goal, ActivityLevel, Weight } = req.body;

    // Check required fields
    if (!email || !password || !Gender || !Age || !Height || !Goal || !ActivityLevel || !Weight) {
      return sendError(res, 400, "All fields are required");
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "User already exists");
    }

    // Create new user
    const user = new User({ email, password, Gender, Age, Height, Goal, ActivityLevel, Weight });
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Login -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Check Email -------------------
router.post("/checkEmail", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, "Email is required");

    const existingUser = await User.findOne({ email });
    res.status(200).json({ exists: !!existingUser });
  } catch (error) {
    console.error("Check Email Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Forgot Password - Send OTP -------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, "User with this email does not exist");
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      return sendError(res, 500, "Failed to send OTP email");
    }

    res.status(200).json({
      message: "OTP sent to your email successfully",
      email: email
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Verify OTP -------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return sendError(res, 400, "Email and OTP are required");
    }

    // Find user with matching email and OTP
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() } // OTP not expired
    });

    if (!user) {
      return sendError(res, 400, "Invalid or expired OTP");
    }

    // Generate a temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes to reset password
    );

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken: resetToken
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Reset Password -------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return sendError(res, 400, "Reset token and new password are required");
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters long");
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password-reset') {
        return sendError(res, 400, "Invalid reset token");
      }
    } catch (error) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    // Find user and update password
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Google Sign-In (Existing Users) -------------------
router.post("/google-signin", async (req, res) => {
  try {
    const { email, googleId, name } = req.body;

    if (!email || !googleId) {
      return sendError(res, 400, "Email and Google ID are required");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, "User not found. Please sign up first.");
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Google sign-in successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

// ------------------- Google Sign-Up (New Users) -------------------
router.post("/google-signup", async (req, res) => {
  try {
    const { 
      email, 
      googleId, 
      name, 
      Gender, 
      Age, 
      Height, 
      Goal, 
      ActivityLevel, 
      Weight 
    } = req.body;

    // Check required fields
    if (!email || !googleId || !Gender || !Age || !Height || !Goal || !ActivityLevel || !Weight) {
      return sendError(res, 400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "User already exists. Please sign in instead.");
    }

    // Create new user with Google authentication
    // For Google users, we'll use a placeholder password since they authenticate via Google
    const user = new User({ 
      email, 
      password: `google_auth_${googleId}`, // Placeholder password for Google users
      Gender, 
      Age, 
      Height, 
      Goal, 
      ActivityLevel, 
      Weight,
      googleId,
      authProvider: 'google'
    });
    
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: "Google sign-up successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Google Sign-Up Error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

export default router;
