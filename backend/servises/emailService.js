import nodemailer from "nodemailer";

// ✅ Use env vars if available, otherwise fallback to Ethereal test creds
const emailUser = process.env.EMAIL_USER || "jamison.hayes@ethereal.email";
const emailPass = process.env.EMAIL_PASS || "9m1Z73cQwN4wzChmFa";

console.log("📧 Email config:", {
  service: process.env.RESEND_API_KEY ? "Resend" : "Ethereal",
  userSet: !!emailUser,
});

// ✅ Transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: { user: emailUser, pass: emailPass },
});

// ✅ Send verification email
export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}&email=${email}`;

  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject: "Verify your VetConnect account",
    html: `<p>Click <a href="${link}">here</a> to verify your account.</p>`,
  });

  console.log("✅ Verification email sent to", email);
}

// ✅ Send password reset email
export async function sendPasswordResetEmail(email, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject: "Reset your VetConnect password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
  });

  console.log("✅ Password reset email sent to", email);
}