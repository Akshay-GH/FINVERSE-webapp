import express from "express";
import userRouter from "./user.js";
import accountRouter from "./accounts.js";
import transactionRouter from "./transactions.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/accounts", accountRouter);
router.use("/transactions", transactionRouter);

export default router;
