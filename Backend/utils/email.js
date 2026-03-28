// C:\FYP\backend\utils\email.js
import nodemailer from 'nodemailer';

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("======================================");
    console.log(`📧 [EMAIL BYPASS] No EMAIL_USER/EMAIL_PASS found in .env`);
    console.log(`Would have sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("======================================");
    return true;
  }

  try {
    const mailer = getTransporter();
    const info = await mailer.sendMail({
      from: `"eAson" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};

export const sendOrderConfirmation = async (order, user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #10b981; text-align: center;">Thank you for your order!</h2>
      <p>Hi ${user.fullName || 'Valued Customer'},</p>
      <p>Your order has been successfully placed with <strong>eAson</strong>.</p>
      
      <h3 style="margin-top: 24px;">Order Summary</h3>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</li>
        <li><strong>Total Amount:</strong> Rs ${order.totalAmount.toLocaleString('en-NP')}</li>
        <li><strong>Payment Method:</strong> Cash on Delivery</li>
        <li><strong>Status:</strong> ${order.status}</li>
        <li><strong>Shipping Address:</strong> ${order.shippingAddress}</li>
        <li><strong>Phone:</strong> ${order.phone}</li>
      </ul>
      
      <p style="margin-top: 24px;">We will notify you once your order is processed and shipped.</p>
      <p>If you have any questions, feel free to contact us on WhatsApp: <strong>+977-9801234567</strong></p>
      
      <p style="margin-top: 32px; font-size: 14px; color: #6b7280; text-align: center;">
        Thank you for choosing eAson – Nepal’s fastest-growing wholesale platform.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation – eAson #${order._id.toString().slice(-8)}`,
    html,
  });
};

export const sendOrderStatusUpdate = async (order, user, newStatus) => {
  const statusColor = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#10b981',
    delivered: '#059669',
    cancelled: '#ef4444',
  }[newStatus] || '#374151';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: ${statusColor}; text-align: center;">Order Status Updated</h2>
      <p>Hi ${user.fullName || 'Valued Customer'},</p>
      <p>Your order has been updated:</p>
      
      <h3 style="margin-top: 24px;">Order #${order._id.toString().slice(-8).toUpperCase()}</h3>
      <p><strong>New Status:</strong> <span style="font-weight: bold; color: ${statusColor};">${newStatus.toUpperCase()}</span></p>
      <p><strong>Total Amount:</strong> Rs ${order.totalAmount.toLocaleString('en-NP')}</p>
      <p><strong>Updated At:</strong> ${new Date().toLocaleString('en-NP')}</p>
      
      <p>Track your order or contact support if needed.</p>
      
      <p style="margin-top: 32px; font-size: 14px; color: #6b7280; text-align: center;">
        eAson – Built in Kathmandu, for Nepali businesses.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Update – eAson #${order._id.toString().slice(-8)} – ${newStatus.toUpperCase()}`,
    html,
  });
};

export const sendVerificationEmail = async (email, otp) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0d0d0d; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 0;">eAson<span style="color: #10b981;">.</span></h1>
      </div>
      
      <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px; text-align: center;">Verify your email address</h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
        You're almost there! We just need to verify your email address to secure your new eAson account. Enter the code below to complete your registration.
      </p>
      
      <div style="background-color: #f9fafb; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
        <span style="font-family: monospace; font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #10b981;">
          ${otp}
        </span>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; text-align: center; line-height: 1.5; margin-bottom: 0;">
        This code securely expires in 10 minutes.<br>
        If you didn't request this, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        &copy; ${new Date().getFullYear()} eAson Nepal. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'eAson - Email Verification Code',
    html,
  });
};