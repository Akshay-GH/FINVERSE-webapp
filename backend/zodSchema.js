import zod from "zod";

const userSchema = zod.object({
  username: zod.email().min(3).max(30),
  password: zod.string().min(6),
  firstName: zod.string().max(50).trim(),
  lastName: zod.string().max(50).trim(),
});

const loginUserSchema = zod.object({
  username: zod.email().min(3).max(30),
  password: zod.string().min(6),
});

const forgotPasswordSchema = zod.object({
  username: zod.email().min(3).max(30),
});

const verifyOtpSchema = zod.object({
  username: zod.email().min(3).max(30),
  otp: zod.string().regex(/^\d{6}$/),
});

const resetPasswordSchema = zod.object({
  username: zod.email().min(3).max(30),
  otp: zod.string().regex(/^\d{6}$/),
  newPassword: zod.string().min(6),
});

const transferRequestSchema = zod.object({
  to: zod.string().min(1),
  amount: zod.number().positive(),
  deviceId: zod.string().min(8),
});

const transferOtpVerifySchema = zod.object({
  transactionId: zod.string().min(1),
  otp: zod.string().regex(/^\d{6}$/),
});

const transferOtpResendSchema = zod.object({
  transactionId: zod.string().min(1),
});

const fraudLogQuerySchema = zod.object({
  userId: zod.string().optional(),
  status: zod.enum(["approved", "pending_otp", "blocked", "failed"]).optional(),
  from: zod.string().optional(),
  to: zod.string().optional(),
});

const numberFromQuery = (min, max) =>
  zod.preprocess(
    (value) =>
      value === undefined || value === "" ? undefined : Number(value),
    zod.number().int().min(min).max(max).optional(),
  );

const transactionHistoryQuerySchema = zod.object({
  page: numberFromQuery(1, 100),
  limit: numberFromQuery(1, 50),
  type: zod.enum(["credit", "debit"]).optional(),
});

export {
  userSchema,
  loginUserSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  transferRequestSchema,
  transferOtpVerifySchema,
  transferOtpResendSchema,
  fraudLogQuerySchema,
  transactionHistoryQuerySchema,
};
