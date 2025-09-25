import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: [true, "Password is required"], 
      minlength: 6 
    },
    Gender: { type: String, required: true },
    Age: { type: Number, required: true, min: 1 },
    Height: { type: String, required: true },
    Goal: { type: String, required: true },
    ActivityLevel: { type: String, required: true },
    Weight: { type: String, required: true },
    isPro: { type: Boolean, default: false },
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    googleId: { type: String }, // For Google-authenticated users
    // authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // Track auth method
  },
  { timestamps: true } // Adds createdAt & updatedAt automatically
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export { User };
