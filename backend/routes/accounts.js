import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { authMiddleware } from "../gate/middleware.js";
import { Account, User, Transaction, FraudLog } from "../db/dbSchema.js";
import {
  transferRequestSchema,
  transferOtpVerifySchema,
  transferOtpResendSchema,
  fraudLogQuerySchema,
} from "../zodSchema.js";
import { sendTransferOtpEmail } from "../utils/email.js";
import { evaluateFraudRisk } from "../utils/fraudScoring.js";

const router = express.Router();

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 10;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const TRANSFER_RATE_LIMIT = 10;
const TRANSFER_RATE_WINDOW_MS = 60 * 1000;
const OTP_RATE_LIMIT = 10;
const OTP_RATE_WINDOW_MS = 60 * 1000;

const transferRateMap = new Map();
const otpRateMap = new Map();

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function isRateLimited(map, key, limit, windowMs) {
  const now = Date.now();
  const entries = map.get(key) || [];
  const fresh = entries.filter((ts) => now - ts < windowMs);
  fresh.push(now);
  map.set(key, fresh);
  return fresh.length > limit;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || null;
}

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({ userId: req.userId });
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  const { balance } = account;
  if (balance === 0) {
    return res.status(200).json({ message: "zero balance", balance });
  }

  res.json({
    balance,
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  try {
    const result = transferRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "enter valid inputs", error: result.error.errors });
    }

    if (
      isRateLimited(
        transferRateMap,
        req.userId,
        TRANSFER_RATE_LIMIT,
        TRANSFER_RATE_WINDOW_MS,
      )
    ) {
      return res.status(429).json({ error: "Too many transfer requests" });
    }

    const { amount, to, deviceId } = result.data;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || null;

    const account = await Account.findOne({
      userId: req.userId,
    });

    if (!account) {
      return res.status(400).json({
        error: "Account not found",
      });
    }

    if (account.balance < amount) {
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    // Convert to ObjectId if it's a string
    const recipientUserId = mongoose.Types.ObjectId.isValid(to)
      ? new mongoose.Types.ObjectId(to)
      : to;

    if (String(recipientUserId) === String(req.userId)) {
      return res.status(400).json({ error: "Cannot transfer to yourself" });
    }

    const toAccount = await Account.findOne({
      userId: recipientUserId,
    });

    if (!toAccount) {
      return res.status(400).json({
        error: "Invalid account",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const recentTransferCount = await Transaction.countDocuments({
      userId: req.userId,
      createdAt: { $gte: tenMinutesAgo },
    });

    const dailyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          createdAt: { $gte: startOfDay },
          status: { $in: ["approved", "pending_otp"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const dailyTotal = dailyTotals[0]?.total || 0;
    const dailyTotalAfter = dailyTotal + amount;
    const isNewDevice = !user.knownDeviceIds?.includes(deviceId);

    const { riskScore, fraudFlags, decision } = evaluateFraudRisk({
      amount,
      isNewDevice,
      recentTransferCount,
      dailyTotalAfter,
      currentHour: now.getHours(),
    });

    if (decision === "require_otp") {
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      const transaction = await Transaction.create({
        userId: req.userId,
        toUserId: recipientUserId,
        amount,
        status: "pending_otp",
        decision,
        riskScore,
        fraudFlags,
        deviceId,
        ipAddress,
        userAgent,
        otpHash,
        otpExpiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
        otpAttempts: 0,
        otpLastSentAt: new Date(now),
      });

      await FraudLog.create({
        userId: req.userId,
        transactionId: transaction._id,
        amount,
        riskScore,
        fraudFlags,
        decision,
        status: "pending_otp",
        deviceId,
        ipAddress,
        userAgent,
      });

      try {
        await sendTransferOtpEmail({ to: user.username, otp });
      } catch (error) {
        console.error("Transfer OTP email error:", error);
      }

      return res.status(200).json({
        status: "otp_required",
        transactionId: transaction._id,
        riskScore,
        fraudFlags,
        message: "OTP required to complete transfer",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    await Account.updateOne(
      {
        userId: req.userId,
      },
      {
        $inc: {
          balance: -amount,
        },
      },
    ).session(session);

    await Account.updateOne(
      {
        userId: recipientUserId,
      },
      {
        $inc: {
          balance: amount,
        },
      },
    ).session(session);

    const transaction = await Transaction.create(
      [
        {
          userId: req.userId,
          toUserId: recipientUserId,
          amount,
          status: "approved",
          decision,
          riskScore,
          fraudFlags,
          deviceId,
          ipAddress,
          userAgent,
        },
      ],
      { session },
    );

    await FraudLog.create(
      [
        {
          userId: req.userId,
          transactionId: transaction[0]._id,
          amount,
          riskScore,
          fraudFlags,
          decision,
          status: "approved",
          deviceId,
          ipAddress,
          userAgent,
        },
      ],
      { session },
    );

    if (isNewDevice) {
      await User.updateOne(
        { _id: req.userId },
        { $addToSet: { knownDeviceIds: deviceId } },
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Transfer successful",
      status: "approved",
      riskScore,
      fraudFlags,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({
      error: "Transfer failed",
    });
  }
});

router.post("/transfer/verify-otp", authMiddleware, async (req, res) => {
  try {
    const result = transferOtpVerifySchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "enter valid inputs", error: result.error.errors });
    }

    if (
      isRateLimited(otpRateMap, req.userId, OTP_RATE_LIMIT, OTP_RATE_WINDOW_MS)
    ) {
      return res.status(429).json({ error: "Too many OTP attempts" });
    }

    const { transactionId, otp } = result.data;
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: req.userId,
    });

    if (!transaction || transaction.status !== "pending_otp") {
      return res.status(400).json({ error: "Invalid transaction" });
    }

    if (transaction.otpAttempts >= OTP_MAX_ATTEMPTS) {
      transaction.status = "blocked";
      await transaction.save();
      await FraudLog.updateOne(
        { transactionId: transaction._id },
        { status: "blocked" },
      );
      return res.status(429).json({ error: "Too many attempts" });
    }

    if (!transaction.otpExpiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (Date.now() > new Date(transaction.otpExpiresAt).getTime()) {
      transaction.status = "failed";
      transaction.otpHash = null;
      transaction.otpExpiresAt = null;
      await transaction.save();
      await FraudLog.updateOne(
        { transactionId: transaction._id },
        { status: "failed" },
      );
      return res.status(400).json({ error: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, transaction.otpHash || "");
    if (!isValid) {
      transaction.otpAttempts += 1;
      await transaction.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const account = await Account.findOne({ userId: req.userId }).session(
      session,
    );
    if (!account || account.balance < transaction.amount) {
      await session.abortTransaction();
      session.endSession();
      transaction.status = "failed";
      transaction.otpHash = null;
      transaction.otpExpiresAt = null;
      await transaction.save();
      await FraudLog.updateOne(
        { transactionId: transaction._id },
        { status: "failed" },
      );
      return res.status(400).json({ error: "Insufficient balance" });
    }

    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -transaction.amount } },
    ).session(session);

    await Account.updateOne(
      { userId: transaction.toUserId },
      { $inc: { balance: transaction.amount } },
    ).session(session);

    transaction.status = "approved";
    transaction.otpHash = null;
    transaction.otpExpiresAt = null;
    transaction.otpAttempts = 0;
    await transaction.save({ session });

    await FraudLog.updateOne(
      { transactionId: transaction._id },
      { status: "approved" },
    ).session(session);

    if (transaction.deviceId) {
      await User.updateOne(
        { _id: req.userId },
        { $addToSet: { knownDeviceIds: transaction.deviceId } },
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({ message: "Transfer successful", status: "approved" });
  } catch (error) {
    console.error("OTP verify error:", error);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

router.post("/transfer/resend-otp", authMiddleware, async (req, res) => {
  try {
    const result = transferOtpResendSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "enter valid inputs", error: result.error.errors });
    }

    const { transactionId } = result.data;
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: req.userId,
    });

    if (!transaction || transaction.status !== "pending_otp") {
      return res.status(400).json({ error: "Invalid transaction" });
    }

    if (
      transaction.otpLastSentAt &&
      Date.now() - new Date(transaction.otpLastSentAt).getTime() <
        OTP_RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({ error: "OTP resend cooldown active" });
    }

    if (
      isRateLimited(otpRateMap, req.userId, OTP_RATE_LIMIT, OTP_RATE_WINDOW_MS)
    ) {
      return res.status(429).json({ error: "Too many OTP requests" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOtp();
    transaction.otpHash = await bcrypt.hash(otp, 10);
    transaction.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    transaction.otpAttempts = 0;
    transaction.otpLastSentAt = new Date();
    await transaction.save();

    try {
      await sendTransferOtpEmail({ to: user.username, otp });
    } catch (error) {
      console.error("Transfer OTP resend error:", error);
    }

    return res.json({ message: "OTP resent" });
  } catch (error) {
    console.error("Transfer OTP resend error:", error);
    return res.status(500).json({ error: "Unable to resend OTP" });
  }
});

router.get("/fraud-logs", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const result = fraudLogQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs", error: result.error.errors });
  }

  const { userId, status, from, to } = result.data;
  const filter = {};
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const logs = await FraudLog.find(filter).sort({ createdAt: -1 }).limit(200);

  return res.json({ logs });
});

export default router;
