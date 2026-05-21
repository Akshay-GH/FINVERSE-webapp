import nodemailer from "nodemailer";

// Brevo SMTP
const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = Number(process.env.BREVO_SMTP_PORT || 587);
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER;
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_NAME = process.env.SENDER_NAME || "Finverse";
const SMTP_FROM = SENDER_EMAIL ? `${SENDER_NAME} <${SENDER_EMAIL}>` : undefined;

function assertSmtpConfig() {
  if (!BREVO_SMTP_USER || !BREVO_SMTP_KEY || !SENDER_EMAIL) {
    throw new Error(
      "Missing Brevo SMTP configuration (BREVO_SMTP_USER, BREVO_SMTP_KEY, SENDER_EMAIL)",
    );
  }
}

function getTransporter() {
  return nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: BREVO_SMTP_PORT,
    secure: BREVO_SMTP_PORT === 465,
    requireTLS: BREVO_SMTP_PORT !== 465,
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_KEY,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
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
