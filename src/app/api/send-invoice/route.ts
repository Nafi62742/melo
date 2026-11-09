import { NextResponse } from 'next/server';
import { Order } from '@/core/models/order.model';
import { generateInvoiceHtml } from '@/core/emails/invoice-template';

/**
 * POST /api/send-invoice
 * Sends a luxury HTML invoice to the customer upon order completion.
 *
 * NOTE: This feature is INACTIVE by default.
 * To activate:
 * 1. Add your Gmail credentials to .env.local:
 *    GMAIL_USER=your_email@gmail.com
 *    GMAIL_APP_PASSWORD=your_16_digit_app_password
 * 2. Set ENABLE_EMAIL_INVOICES=true in .env.local (and Vercel Environment Variables).
 */
export async function POST(request: Request) {
  try {
    const isFeatureActive = process.env.ENABLE_EMAIL_INVOICES === 'true';
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    // Feature Guard: If not active or credentials not yet set, exit gracefully without throwing
    if (!isFeatureActive || !gmailUser || !gmailAppPassword) {
      return NextResponse.json({
        success: true,
        active: false,
        message:
          'Email invoice feature is currently inactive. Add your Gmail credentials and set ENABLE_EMAIL_INVOICES=true to activate.',
      });
    }

    const { order }: { order: Order } = await request.json();

    if (!order || !order.customer) {
      return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
    }

    // Determine target recipient (Customer's email or store admin fallback)
    const customerEmail = order.customer.email?.trim();
    const adminNotificationEmail = process.env.STORE_NOTIFICATION_EMAIL || gmailUser;

    const recipient = customerEmail || adminNotificationEmail;

    if (!recipient) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'No recipient email available for this order.',
      });
    }

    const htmlContent = generateInvoiceHtml(order);

    // Create Gmail SMTP Transporter (dynamically loaded when feature is active)
    const { default: nodemailer } = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"MELO Orders" <${gmailUser}>`,
      to: recipient,
      bcc: customerEmail ? adminNotificationEmail : undefined,
      subject: `Order Confirmed: ${order.orderNumber} — MELO Bangladesh`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      active: true,
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    console.error('[Send Invoice Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
