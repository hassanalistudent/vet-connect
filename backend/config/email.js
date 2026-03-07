import nodemailer from "nodemailer";

// ✅ Use Gmail credentials from Railway environment variables
const emailUser = process.env.EMAIL_USER || "hassan.ali.datanalyst@gmail.com";
const emailPass = process.env.EMAIL_PASS || "osxnsuysjvxswurg"; // no spaces

console.log("📧 Email config:", {
  service: "Gmail",
  userSet: !!emailUser,
});

// ✅ Gmail SMTP transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,   // 587 for TLS, 465 for SSL
  secure: false, // true if you use port 465
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export { emailUser };