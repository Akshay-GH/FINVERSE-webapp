import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  resetOtpHash: {
    type: String,
    default: null,
  },
  resetOtpExpiresAt: {
    type: Date,
    default: null,
  },
  resetOtpAttempts: {
    type: Number,
    default: 0,
  },
  resetOtpLastSentAt: {
    type: Date,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  knownDeviceIds: {
    type: [String],
    default: [],
  },
});

const bankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: { type: Number, default: 0 }, // always store lowest currency unit (like paise, cents)
});

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending_otp", "blocked", "failed"],
      required: true,
    },
    decision: {
      type: String,
      enum: ["approve", "require_otp", "block"],
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
    },
    fraudFlags: {
      type: [String],
      default: [],
    },
    deviceId: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    otpHash: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const fraudLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
    },
    fraudFlags: {
      type: [String],
      default: [],
    },
    decision: {
      type: String,
      enum: ["approve", "require_otp", "block"],
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending_otp", "blocked", "failed"],
      required: true,
    },
    deviceId: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", bankSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const FraudLog = mongoose.model("FraudLog", fraudLogSchema);

export { User, Account, Transaction, FraudLog };
