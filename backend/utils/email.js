// Brevo Transactional Email API (HTTP)
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_NAME = process.env.SENDER_NAME || "Finverse";

function assertBrevoConfig() {
  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    throw new Error(
      "Missing Brevo API configuration (BREVO_API_KEY, SENDER_EMAIL)",
    );
  }
}

async function sendBrevoEmail({ to, subject, text }) {
  assertBrevoConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Brevo API error: ${response.status} ${response.statusText} ${errorBody}`,
      );
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendResetOtpEmail({ to, otp, appName = "Finverse" }) {
  const subject = `${appName} password reset OTP`;
  const text =
    `Your ${appName} password reset OTP is ${otp}.\n` +
    "It expires in 10 minutes. If you did not request this, ignore this email.";

  await sendBrevoEmail({ to, subject, text });
}

export async function sendTransferOtpEmail({ to, otp, appName = "Finverse" }) {
  const subject = `${appName} transfer verification OTP`;
  const text =
    `Your ${appName} transfer OTP is ${otp}.\n` +
    "It expires in 10 minutes. If you did not request this, contact support.";

  await sendBrevoEmail({ to, subject, text });
}
