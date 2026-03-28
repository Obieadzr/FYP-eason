import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log("Testing with User:", process.env.EMAIL_USER);
console.log("Password length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  try {
    const info = await transporter.sendMail({
      from: `"eAson Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'eAson - SMTP Test',
      html: '<p>If you see this, your Gmail SMTP is working perfectly!</p>',
    });
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
}
test();
