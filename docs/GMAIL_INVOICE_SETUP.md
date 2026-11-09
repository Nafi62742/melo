# MELO — How to Activate Gmail Invoice Sending (Step-by-Step)

The automated email invoice infrastructure is fully built and wired into your checkout workflow, but is **currently inactive** (`ENABLE_EMAIL_INVOICES=false`) so no errors occur while you prepare your Gmail account.

Whenever you are ready to activate automated invoice delivery for customers, follow these 3 simple steps:

---

## Step 1: Create a Google App Password (2 Minutes)

Google requires an **App Password** (16 characters) instead of your regular Gmail account password:

1. Open your Google Account at [myaccount.google.com/security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned ON.
3. In the search box at the top, type **`App passwords`** (or go to **Security → 2-Step Verification → App passwords**).
4. For **App Name**, enter: `MELO Store` → Click **Create**.
5. Google will display a 16-character code (e.g. `abcd efgh ijkl mnop`). **Copy this code**.

---

## Step 2: Add Keys to `.env.local`

Create (or open) `.env.local` in the project root and add:

```env
# Activate the Email Invoice System
ENABLE_EMAIL_INVOICES=true

# Your Store's Gmail Address
GMAIL_USER=your_store_email@gmail.com

# The 16-character App Password generated in Step 1
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# (Optional) Personal email where you want a copy of every customer invoice
STORE_NOTIFICATION_EMAIL=your_personal_email@gmail.com
```

> [!NOTE]
> When deploying on Vercel, add these same 3 variables under **Vercel Project Settings → Environment Variables**.

---

## Step 3: Test an Order

1. Start your local server (`npm run dev`) or test on your Vercel deployment.
2. Add an item to your bag and go to `/checkout`.
3. Enter your email in the optional **Email Address** field.
4. Place the order.
5. Check your Gmail inbox: you will receive the luxury, branded HTML receipt with order reference (`MELO-XXXXXX`), item breakdown, and delivery details.

---

## How It Works Behind the Scenes
- **Endpoint:** [`/api/send-invoice`](../src/app/api/send-invoice/route.ts)
- **HTML Template:** [`src/core/emails/invoice-template.ts`](../src/core/emails/invoice-template.ts)
- **Safety Guard:** If `ENABLE_EMAIL_INVOICES` is `false` or credentials are missing, the checkout never fails or freezes; it simply records the order and skips sending.
