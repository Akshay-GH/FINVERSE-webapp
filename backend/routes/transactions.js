import express from "express";
import { authMiddleware } from "../gate/middleware.js";
import { Transaction } from "../db/dbSchema.js";
import { transactionHistoryQuerySchema } from "../zodSchema.js";

const router = express.Router();

const FRAUD_STATUS_LABELS = {
  approve: "Approved",
  require_otp: "OTP Required",
  block: "Blocked",
};

function formatUser(user) {
  if (!user) {
    return { id: null, name: "Unknown", email: "" };
  }

  if (typeof user === "string") {
    return { id: user, name: "Unknown", email: "" };
  }

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const name = `${firstName} ${lastName}`.trim() || user.username || "Unknown";

  return {
    id: user._id ? String(user._id) : null,
    name,
    email: user.username || "",
  };
}

router.get("/history", authMiddleware, async (req, res) => {
  const result = transactionHistoryQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs", error: result.error.errors });
  }

  const page = result.data.page ?? 1;
  const limit = result.data.limit ?? 10;
  const type = result.data.type;
  const userId = req.userId;

  let filter = {
    $or: [{ userId }, { toUserId: userId }],
  };

  if (type === "credit") {
    filter = { toUserId: userId };
  }

  if (type === "debit") {
    filter = { userId };
  }

  const skip = (page - 1) * limit;

  try {
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username firstName lastName")
        .populate("toUserId", "username firstName lastName")
        .lean(),
    ]);

    const items = transactions.map((transaction) => {
      const sender = formatUser(transaction.userId);
      const receiver = formatUser(transaction.toUserId);
      const isCredit = receiver.id && receiver.id === String(userId);
      const direction = isCredit ? "credit" : "debit";
      let fraudStatus = FRAUD_STATUS_LABELS[transaction.decision] || "Unknown";

      if (transaction.decision !== "block" && transaction.riskScore >= 70) {
        fraudStatus = "High Risk - OTP Required";
      }

      return {
        id: String(transaction._id),
        sender,
        receiver,
        amount: transaction.amount,
        status: transaction.status,
        fraudStatus,
        direction,
        label: isCredit ? "Money Received" : "Money Sent",
        createdAt: transaction.createdAt,
      };
    });

    return res.json({
      page,
      limit,
      total,
      transactions: items,
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    return res.status(500).json({ error: "Unable to load transactions" });
  }
});

export default router;
