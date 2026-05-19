import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

function assertSmtpConfig() {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS configuration");
  }
}

function getTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendResetOtpEmail({ to, otp, appName = "Finverse" }) {
  assertSmtpConfig();
  const transporter = getTransporter();

  const subject = `${appName} password reset OTP`;
  const text =
    `Your ${appName} password reset OTP is ${otp}.\n` +
    "It expires in 10 minutes. If you did not request this, ignore this email.";

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
  });
}

export async function sendTransferOtpEmail({ to, otp, appName = "Finverse" }) {
  assertSmtpConfig();
  const transporter = getTransporter();

  const subject = `${appName} transfer verification OTP`;
  const text =
    `Your ${appName} transfer OTP is ${otp}.\n` +
    "It expires in 10 minutes. If you did not request this, contact support.";

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
  });
}
