import express from "express";
import { User, Account } from "../db/dbSchema.js";
import {
  userSchema,
  loginUserSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  userBulkQuerySchema,
} from "../zodSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
import { authMiddleware } from "../gate/middleware.js";
import { sendResetOtpEmail } from "../utils/email.js";

const userRouter = express.Router();

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 10;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Test endpoint to verify routing works
userRouter.get("/test", (req, res) => {
  res.json({
    message: "User router is working!",
    timestamp: new Date().toISOString(),
  });
});

userRouter.post("/signup", async (req, res) => {
  console.log("=== SIGNUP ROUTE HIT ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);

  try {
    // Logic for user signup
    //user inputs
    const result = userSchema.safeParse(req.body);
    console.log("Zod validation result:", result);

    if (!result.success) {
      console.log("Validation failed:", result.error);
      return res
        .status(400)
        .json({ message: "enter valid inputs ", error: result.error.errors });
    }
    const { username, password, firstName, lastName } = result.data;

    //puting data in db
    //checking user is already exist or not
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user

    try {
      let newUser = await User.create({
        username,
        password: hashedPassword,
        firstName,
        lastName,
      });

      await Account.create({
        userId: newUser._id,
        balance: Math.floor(Math.random() * 1000000), // initial balance between 0 to 10000 rs
      });

      await newUser.save();
    } catch (err) {
      return res
        .status(500)
        .json({ error: "error while saving user to db", message: err.message });
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("Signup error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  console.log("=== LOGIN ROUTE HIT ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);

  try {
    // Logic for user login
    const result = loginUserSchema.safeParse(req.body);
    console.log("Login validation result:", result);

    if (!result.success) {
      console.log("Login validation failed:", result.error);
      return res
        .status(400)
        .json({ message: "enter valid inputs ", error: result.error.errors });
    }
    const user = await User.findOne({ username: result.data.username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      result.data.password,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    if (user) {
      const token = jwt.sign(
        {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        SECRET_KEY,
        {
          expiresIn: "1h",
        },
      );
      res
        .status(200)
        .json({ message: "Login successful", token: "Bearer " + token });
      return;
    }

    res.status(411).json({
      message: "Error while logging in",
    });
  } catch (error) {
    console.log("Login error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

userRouter.post("/forgot-password", async (req, res) => {
  const result = forgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs", error: result.error.errors });
  }

  const { username } = result.data;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(200).json({
      message:
        "If an account exists for this email, an OTP has been sent to reset your password.",
    });
  }

  const now = Date.now();
  if (
    user.resetOtpLastSentAt &&
    now - new Date(user.resetOtpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
  ) {
    return res.status(200).json({
      message:
        "If an account exists for this email, an OTP has been sent recently. Please wait before requesting another.",
    });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  user.resetOtpHash = otpHash;
  user.resetOtpExpiresAt = new Date(now + OTP_EXPIRY_MS);
  user.resetOtpAttempts = 0;
  user.resetOtpLastSentAt = new Date(now);
  await user.save();

  sendResetOtpEmail({ to: username, otp }).catch((error) => {
    console.error("OTP email error:", error);
  });

  return res.status(200).json({
    message:
      "If an account exists for this email, an OTP has been sent to reset your password.",
  });
});

userRouter.post("/verify-otp", async (req, res) => {
  const result = verifyOtpSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs", error: result.error.errors });
  }

  const { username, otp } = result.data;
  const user = await User.findOne({ username });

  if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  if (user.resetOtpAttempts >= OTP_MAX_ATTEMPTS) {
    return res.status(429).json({ error: "Too many attempts" });
  }

  if (Date.now() > new Date(user.resetOtpExpiresAt).getTime()) {
    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    await user.save();
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const isValid = await bcrypt.compare(otp, user.resetOtpHash);
  if (!isValid) {
    user.resetOtpAttempts += 1;
    await user.save();
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  return res.status(200).json({ message: "OTP verified" });
});

userRouter.post("/reset-password", async (req, res) => {
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs", error: result.error.errors });
  }

  const { username, otp, newPassword } = result.data;
  const user = await User.findOne({ username });

  if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  if (user.resetOtpAttempts >= OTP_MAX_ATTEMPTS) {
    return res.status(429).json({ error: "Too many attempts" });
  }

  if (Date.now() > new Date(user.resetOtpExpiresAt).getTime()) {
    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    await user.save();
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const isValid = await bcrypt.compare(otp, user.resetOtpHash);
  if (!isValid) {
    user.resetOtpAttempts += 1;
    await user.save();
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtpHash = null;
  user.resetOtpExpiresAt = null;
  user.resetOtpAttempts = 0;
  user.resetOtpLastSentAt = null;
  await user.save();

  return res.status(200).json({ message: "Password reset successful" });
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  //.. i need to optionally update the data
  if (!password && !firstName && !lastName) {
    return res.status(400).json({ error: "please provide data to update" });
  }

  const userId = req.userId;

  const updateData = {};
  if (password) updateData.password = await bcrypt.hash(password, 10);
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;

  try {
    await User.findByIdAndUpdate(userId, updateData);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating user", message: error.message });
  }
});

userRouter.get("/bulk", authMiddleware, async (req, res) => {
  const result = userBulkQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs", error: result.error.errors });
  }

  const filter = result.data.filter || "";
  const page = result.data.page ?? 1;
  const limit = result.data.limit ?? 10;
  const skip = (page - 1) * limit;

  try {
    const query = {
      _id: { $ne: req.userId },
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    };

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ firstName: 1, lastName: 1 })
        .skip(skip)
        .limit(limit),
    ]);

    const items = users.map((user) => {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id,
      };
    });

    res.status(200).json({ items, total, page, limit });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching users", message: error.message });
  }
});

export default userRouter;
