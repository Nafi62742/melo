# MELO — Free Email Invoice System & Social Media Integration Plan

This document outlines the complete architectural, implementation, and operational strategy to set up a **100% free transactional email and customer invoice system** for **MELO**, integrated with our **social media channels (Facebook, Instagram, and WhatsApp)**.

---

## 1. System Architecture & Order Flow

```
Customer Places Order (Checkout Feature)
               │
               ▼
   Creates Order in System (MELO-XXXXXX)
               │
      ┌────────┴───────────────────────────┐
      ▼                                    ▼
[Email Pipeline]                  [Social & WhatsApp Pipeline]
• Resend / Brevo (Free API)        • 1-Tap "Send Invoice to WhatsApp"
• Sends Branded HTML Invoice       • Pre-filled Order Summary in DM
• Itemized BDT receipt + COD info  • Live tracking link at /account
      │                                    │
      └────────┬───────────────────────────┘
               ▼
Customer Receives Confirmation & Unboxing Call-To-Action
(Tag @melobangladesh on Instagram for 10% off next piece)
```

---

## 2. Free Email Provider Comparison for Next.js & Vercel

| Provider | Free Monthly Quota | Next.js / Vercel Integration | Custom Domain (DNS) | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Resend (Recommended #1)** | **3,000 emails/mo** (100/day) | ⭐ Native Vercel partner, Next.js server actions / API routes, React Email support | 3 TXT/MX records (SPF, DKIM, DMARC) | Modern React/Next.js e-commerce with custom HTML/React templates |
| **Brevo (formerly Sendinblue)** | **9,000 emails/mo** (300/day) | REST API & SMTP | Standard DNS records | High daily order volume with built-in drag-and-drop designer |
| **Gmail SMTP (Nodemailer)** | **15,000 emails/mo** (500/day) | Via `nodemailer` with Google "App Password" | Uses your `@gmail.com` without custom domain | Immediate zero-setup testing without owning a domain |
| **Cloudflare Email Routing** | Free unlimited forwarding | Incoming email routing | MX records | Receiving replies like `support@melo.com.bd` into your personal Gmail |

> [!TIP]
> **Recommendation:** Start with **Resend** (Free Tier: 3,000 emails/month). It provides the cleanest Next.js integration, near-perfect inbox deliverability (avoids Spam), and allows sending custom responsive luxury HTML invoices with zero monthly cost.

---

## 3. Step-by-Step Setup Guide (Resend Free Tier)

### Step 3.1: Create a Free Resend Account
1. Visit [resend.com](https://resend.com) and sign up with your email.
2. In the Resend Dashboard, go to **API Keys** → Click **Create API Key** (e.g. `melo-production-email`).
3. Copy the key (starts with `re_...`).

### Step 3.2: Verify Your Domain (or use test sandbox)
- **If you have a domain (e.g. `melo.com.bd` or `melo.store`):**
  1. Go to **Domains** → Click **Add Domain**.
  2. Add the 3 DNS records provided by Resend to your domain registrar (Namecheap, Cloudflare, or GoDaddy):
     - `TXT` (SPF)
     - `TXT` (DKIM)
     - `TXT` (DMARC)
  3. Verification takes 1–5 minutes. Once verified, you can send emails from `orders@yourdomain.com`.
- **If testing without a custom domain:**
  - Resend provides a free onboarding sandbox address: `onboarding@resend.dev` to verify order flows immediately.

### Step 3.3: Configure Environment Variables
Add your credentials to `.env.local` (and into **Vercel Project Settings → Environment Variables**):

```env
# Free Email Delivery (Resend)
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL=MELO Orders <orders@yourdomain.com>

# Store Notification Target (Optional: receive a copy of every order)
ADMIN_NOTIFICATION_EMAIL=melo@gmail.com
```

---

## 4. Next.js Invoice Implementation Blueprint

### 4.1 Next.js API Endpoint (`src/app/api/send-invoice/route.ts`)

This endpoint handles order invoice delivery automatically upon checkout submission:

```typescript
// src/app/api/send-invoice/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Order } from '@/core/models/order.model';
import { generateInvoiceHtml } from '@/core/emails/invoice-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { order }: { order: Order } = await request.json();

    if (!order || !order.customer) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    // Customer email (or fallback to admin if customer only gave phone)
    const recipientEmail = order.customer.email || process.env.ADMIN_NOTIFICATION_EMAIL;

    if (!recipientEmail) {
      return NextResponse.json({ message: 'No email address provided for customer' }, { status: 200 });
    }

    const emailHtml = generateInvoiceHtml(order);

    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'MELO Orders <orders@yourdomain.com>',
      to: [recipientEmail],
      bcc: [process.env.ADMIN_NOTIFICATION_EMAIL || 'melo@gmail.com'],
      subject: `Order Confirmed: ${order.orderNumber} — MELO Bangladesh`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send invoice email:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
```

### 4.2 Luxury Branded HTML Invoice Template (`src/core/emails/invoice-template.ts`)

```typescript
// src/core/emails/invoice-template.ts
import { Order } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';

export function generateInvoiceHtml(order: Order): string {
  const itemsRows = order.items
    .map(
      ({ product, quantity }) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E7E0D6; font-size: 13px; color: #1C1917;">
          <strong>${product.name}</strong>
          <div style="font-size: 11px; color: #78716C; text-transform: capitalize;">${product.category}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #E7E0D6; text-align: center; font-size: 13px; color: #78716C;">
          ${quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #E7E0D6; text-align: right; font-size: 13px; font-weight: 600; color: #1C1917;">
          ${formatBDT(product.priceBDT * quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${order.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 30px 15px; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E0D6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        
        <!-- Header -->
        <div style="background-color: #181512; padding: 24px 30px; text-align: center;">
          <h1 style="margin: 0; color: #FAF7F2; font-size: 26px; letter-spacing: 4px; font-weight: 700;">MELO</h1>
          <p style="margin: 4px 0 0 0; color: #C5A059; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
            Fine & Light Luxury • Dhaka, Bangladesh
          </p>
        </div>

        <div style="padding: 30px;">
          <!-- Order Confirmation Pill -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="background-color: #FAF7F2; border: 1px solid #C5A059; color: #8C6D32; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">
              ORDER CONFIRMED
            </span>
            <h2 style="margin: 16px 0 6px 0; font-size: 20px; color: #1C1917;">Thank you for your order!</h2>
            <p style="margin: 0; font-size: 13px; color: #78716C;">
              Order Ref: <strong style="color: #9A7B3E;">${order.orderNumber}</strong>
            </p>
          </div>

          <!-- Customer & Delivery Zone -->
          <div style="background-color: #FAF7F2; border: 1px solid #E7E0D6; border-radius: 12px; padding: 18px; margin-bottom: 24px; font-size: 12px; color: #44403C; line-height: 1.6;">
            <div><strong>Deliver To:</strong> ${order.customer.fullName} (${order.customer.phone})</div>
            <div><strong>Address:</strong> ${order.customer.address}</div>
            <div><strong>Delivery Zone:</strong> ${order.customer.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka (24–48h)' : 'Outside Dhaka (3–4 days)'}</div>
            <div><strong>Payment:</strong> <span style="text-transform: uppercase; font-weight: 600;">${order.paymentMethod}</span></div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #E7E0D6; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; text-align: left;">
                <th style="padding-bottom: 8px;">Item</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <div style="border-top: 1px solid #E7E0D6; padding-top: 12px; font-size: 13px; color: #78716C;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Subtotal:</span>
              <span style="color: #1C1917; font-weight: 600;">${formatBDT(order.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Delivery Fee:</span>
              <span style="color: #1C1917; font-weight: 600;">${formatBDT(order.deliveryFee)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px dashed #E7E0D6; font-size: 16px; color: #1C1917; font-weight: 700;">
              <span>Total Payable:</span>
              <span style="color: #9A7B3E;">${formatBDT(order.total)}</span>
            </div>
          </div>

          <!-- Direct Support Assistance -->
          <div style="margin-top: 28px; text-align: center; border-top: 1px solid #E7E0D6; padding-top: 20px;">
            <p style="font-size: 12px; color: #78716C; margin-bottom: 12px;">Need help with your order or ear clip sizing?</p>
            <a href="https://wa.me/8801700000000?text=Hi%20MELO!%20Inquiry%20regarding%20Order%20${order.orderNumber}"
               style="display: inline-block; background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 9px 18px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 8px;">
              WhatsApp Support
            </a>
            <a href="https://m.me/melobangladesh"
               style="display: inline-block; background-color: #0084FF; color: #FFFFFF; text-decoration: none; padding: 9px 18px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
              Messenger
            </a>
          </div>

          <!-- Social Engagement / Unboxing Prompt -->
          <div style="margin-top: 24px; background-color: #FAF7F2; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #1C1917; margin-bottom: 4px;">✨ Share Your Unboxing!</div>
            <div style="font-size: 11px; color: #78716C;">
              Tag <a href="https://instagram.com/melobangladesh" style="color: #9A7B3E; text-decoration: none; font-weight: bold;">@melobangladesh</a> on Instagram Stories for a <strong>10% OFF discount</strong> on your next order!
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #FAF7F2; padding: 16px; text-align: center; border-top: 1px solid #E7E0D6; font-size: 11px; color: #A8A29E;">
          © 2026 MELO Bangladesh. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}
```

---

## 5. Dual-Channel Invoice Strategy (Email + WhatsApp)

In the Bangladeshi market, approximately 40% of retail buyers do not check email regularly. Implementing a **Dual-Channel Invoice Strategy** ensures 100% confirmation rate:

### 5.1 One-Tap WhatsApp Invoice Sharing
On the Checkout Confirmation screen ([`checkout.feature.tsx`](file:///Users/xor01/Documents/Nafi/melo/src/features/checkout/checkout.feature.tsx)), provide an instant WhatsApp sharing button:

```typescript
const shareToWhatsApp = () => {
  const message = encodeURIComponent(
    `✨ *MELO Order Confirmed!*\n` +
    `• *Order Ref:* ${order.orderNumber}\n` +
    `• *Customer:* ${order.customer.fullName} (${order.customer.phone})\n` +
    `• *Delivery Address:* ${order.customer.address}\n` +
    `• *Total Payable:* ${formatBDT(order.total)} (${order.paymentMethod.toUpperCase()})\n\n` +
    `Track your delivery anytime: ${window.location.origin}/account`
  );
  window.open(`https://wa.me/8801700000000?text=${message}`, '_blank');
};
```

---

## 6. Social Media Growth & Promotion Plan

### 6.1 Content Pillars for Instagram & Facebook

```
┌────────────────────────────────────────────────────────┐
│               MELO Social Content Strategy             │
├────────────────────────┬───────────────────────────────┤
│ 40% Product Aesthetic  │ High-res macro photos of      │
│                        │ ear clips, rings, bracelets   │
├────────────────────────┼───────────────────────────────┤
│ 30% Behind-The-Scenes  │ Luxury packing, bubble wrap,  │
│                        │ handwritten thank-you cards   │
├────────────────────────┼───────────────────────────────┤
│ 20% Educational / Care │ How silicone cushions prevent │
│                        │ pain; ring sizing hacks       │
├────────────────────────┼───────────────────────────────┤
│ 10% Social Proof / UGC │ Real customer unboxings & DMs │
└────────────────────────┴───────────────────────────────┘
```

### 6.2 Weekly Social Posting Schedule

| Day | Platform | Format | Content Focus | Call-to-Action |
| :--- | :--- | :--- | :--- | :--- |
| **Monday** | Instagram & Facebook | Carousel Post | New Weekly Arrivals (Earrings / Rings focus) | *"Tap link in bio to shop live stock"* |
| **Wednesday** | Reels & TikTok | Short Video (15s) | Up-close sparkle & comfort demonstration of hypoallergenic clips | *"Order via WhatsApp in 1 tap"* |
| **Friday** | IG Stories & FB Post | Photo + Poll | Customer Favorite Stacks (e.g. Ring A vs Ring B) | *"DM us to reserve yours before stock ends"* |
| **Sunday** | Reels & IG Stories | Aesthetic Packing Reel | Fulfilling orders with gift pouches & order invoices | *"Order today for 24-48h Dhaka delivery"* |

### 6.3 Social DM-to-Order Conversion Workflow
When a customer sends a message on Facebook Messenger or Instagram DM asking: *"How to order?"* or *"Price please?"*:
1. **Never make them wait:** Use **Meta Business Suite Saved Replies** (Shortcut `/invoice`):
   > *"Assalamu Alaikum! ✨ This piece is in stock at ৳[Price]. You can complete your order directly with Cash on Delivery at [melo.com.bd/product/slug] or reply with your Name, Phone & Address and we will generate your invoice right here!"*
2. **Admin Order Injection:** Go to **`/admin` → Orders → Add Order** to manually record orders placed in DMs so inventory syncs in real-time.

---

## 7. Action Checklist to Go Live

- [ ] **Step 1:** Sign up at [resend.com](https://resend.com) and generate a free API key.
- [ ] **Step 2:** Add `RESEND_API_KEY` and `ADMIN_NOTIFICATION_EMAIL` to `.env.local` and Vercel.
- [ ] **Step 3:** Mount `/api/send-invoice` and wire it to call after checkout completion in `checkout.feature.tsx`.
- [ ] **Step 4:** Set up Meta Business Suite Instant Replies for Facebook & Instagram.
- [ ] **Step 5:** Test an order end-to-end (verify email inbox delivery & WhatsApp invoice link).
