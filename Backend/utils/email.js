// C:\FYP\backend\utils\email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"eAson" <${process.env.EMAIL_FROM || 'no-reply@eason.com.np'}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message, error.stack);
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
      <p><strong>New Status:</strong> <span style="font-weight: bold; color: $$   {statusColor};">   $${newStatus.toUpperCase()}</span></p>
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