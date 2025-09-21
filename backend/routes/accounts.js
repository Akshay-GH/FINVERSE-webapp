import express from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../gate/middleware.js";
import { Account } from "../db/dbSchema.js";

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const { balance } = await Account.findOne({ userId: req.userId });
  if (!balance) {
    return res.status(404).json({ error: "Account not found" });
  }

  res.json({
    balance,
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { amount, to } = req.body;

    // Validate input
    if (!amount || !to) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Amount and recipient are required",
      });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Amount must be positive",
      });
    }

    const account = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Account not found",
      });
    }

    if (account.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    // Convert to ObjectId if it's a string
    const recipientUserId = mongoose.Types.ObjectId.isValid(to)
      ? new mongoose.Types.ObjectId(to)
      : to;

    const toAccount = await Account.findOne({
      userId: recipientUserId,
    }).session(session);



    if (!toAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Invalid account",
      });
    }

    await Account.updateOne(
      {
        userId: req.userId,
      },
      {
        $inc: {
          balance: -amount,
        },
      }
    ).session(session);

    await Account.updateOne(
      {
        userId: recipientUserId,
      },
      {
        $inc: {
          balance: amount,
        },
      }
    ).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Transfer successful",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer error:", error);
    res.status(500).json({
      error: "Transfer failed",
    });
  }
});

export default router;
