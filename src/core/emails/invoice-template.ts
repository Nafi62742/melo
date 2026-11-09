import { Order } from '../models/order.model';
import { formatBDT } from '../utils/currency.util';

/**
 * Generates a luxury, mobile-responsive HTML invoice for MELO customers.
 */
export function generateInvoiceHtml(order: Order): string {
  const itemsRows = order.items
    .map(
      ({ product, quantity }) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E7E0D6; font-size: 13px; color: #1C1917;">
          <strong style="display: block; font-size: 13px; color: #1C1917;">${product.name}</strong>
          <span style="font-size: 11px; color: #78716C; text-transform: capitalize;">${product.category}</span>
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

  const paymentMethodLabel =
    order.paymentMethod === 'cod'
      ? 'Cash on Delivery (Pay upon receiving)'
      : order.paymentMethod === 'bkash'
      ? `bKash ${order.trxId ? `(TrxID: ${order.trxId})` : ''}`
      : 'Card Payment';

  const zoneLabel =
    order.customer.deliveryZone === 'inside_dhaka'
      ? 'Inside Dhaka (24–48h Delivery)'
      : 'Outside Dhaka (3–4 Days Delivery)';

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderNumber}</title>
  </head>
  <body style="margin: 0; padding: 24px 12px; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E0D6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(28,25,23,0.05);">
      
      <!-- Luxury Brand Header -->
      <tr>
        <td style="background-color: #181512; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; color: #FAF7F2; font-size: 28px; letter-spacing: 5px; font-weight: 700; font-family: Georgia, serif;">
            MELO
          </h1>
          <p style="margin: 6px 0 0 0; color: #C5A059; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">
            Fine &amp; Light Luxury • Dhaka, Bangladesh
          </p>
        </td>
      </tr>

      <!-- Invoice Body -->
      <tr>
        <td style="padding: 28px 24px;">
          
          <!-- Order Confirmation Pill & Reference -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; background-color: #FAF7F2; border: 1px solid #C5A059; color: #8C6D32; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
              Order Confirmed ✓
            </span>
            <h2 style="margin: 14px 0 4px 0; font-size: 20px; color: #1C1917;">Thank you for your order!</h2>
            <p style="margin: 0; font-size: 13px; color: #78716C;">
              Order Reference: <strong style="color: #9A7B3E; font-size: 14px;">${order.orderNumber}</strong>
            </p>
          </div>

          <!-- Customer Delivery Card -->
          <div style="background-color: #FAF7F2; border: 1px solid #E7E0D6; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px; font-size: 12px; line-height: 1.7; color: #44403C;">
            <div style="font-weight: 700; color: #1C1917; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; font-size: 10.5px; color: #8C6D32;">
              Delivery Details
            </div>
            <div><strong>Recipient:</strong> ${order.customer.fullName} &bull; ${order.customer.phone}</div>
            <div><strong>Address:</strong> ${order.customer.address}</div>
            <div><strong>Region:</strong> ${zoneLabel}</div>
            <div><strong>Payment:</strong> ${paymentMethodLabel}</div>
            ${order.customer.notes ? `<div><strong>Instructions:</strong> ${order.customer.notes}</div>` : ''}
          </div>

          <!-- Items Table -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #E7E0D6; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; text-align: left;">
                <th style="padding-bottom: 10px;">Item</th>
                <th style="padding-bottom: 10px; text-align: center;">Qty</th>
                <th style="padding-bottom: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #E7E0D6; padding-top: 12px; font-size: 13px; color: #78716C;">
            <tr>
              <td style="padding: 4px 0;">Subtotal:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1C1917;">${formatBDT(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Delivery Fee:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1C1917;">${formatBDT(order.deliveryFee)}</td>
            </tr>
            ${order.paymentMethod === 'cod' ? `
            <tr>
              <td style="padding: 4px 0;">Cash on Delivery Fee:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1C1917;">+৳10</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0 4px 0; font-size: 15px; font-weight: 700; color: #1C1917; border-top: 1px dashed #E7E0D6;">Total Payable:</td>
              <td style="padding: 10px 0 4px 0; text-align: right; font-size: 16px; font-weight: 800; color: #9A7B3E; border-top: 1px dashed #E7E0D6;">${formatBDT(order.total)}</td>
            </tr>
          </table>

          <!-- Direct Support Assistance -->
          <div style="margin-top: 28px; text-align: center; border-top: 1px solid #E7E0D6; padding-top: 20px;">
            <p style="font-size: 12px; color: #78716C; margin: 0 0 12px 0;">Need any assistance with your order or ear clip sizing?</p>
            <a href="https://wa.me/8801522111036?text=Hi%20MELO!%20Inquiry%20regarding%20Order%20${order.orderNumber}"
               style="display: inline-block; background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 8px 18px; border-radius: 9999px; font-size: 11.5px; font-weight: 700; margin-right: 6px;">
              WhatsApp Support
            </a>
            <a href="https://www.facebook.com/profile.php?id=61596527274952"
               style="display: inline-block; background-color: #0084FF; color: #FFFFFF; text-decoration: none; padding: 8px 18px; border-radius: 9999px; font-size: 11.5px; font-weight: 700;">
              Facebook Page
            </a>
          </div>

          <!-- Social Unboxing Prompt -->
          <div style="margin-top: 24px; background-color: #FAF7F2; border: 1px solid #E7E0D6; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #1C1917; margin-bottom: 3px;">✨ Share Your Unboxing!</div>
            <div style="font-size: 11px; color: #78716C; line-height: 1.5;">
              Tag <strong style="color: #9A7B3E;">@melobangladesh</strong> on Instagram Stories for a <strong>10% OFF discount</strong> on your next piece!
            </div>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #FAF7F2; padding: 16px; text-align: center; border-top: 1px solid #E7E0D6; font-size: 11px; color: #A8A29E;">
          © 2026 MELO Bangladesh &bull; Discover. Love. Repeat.
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}
