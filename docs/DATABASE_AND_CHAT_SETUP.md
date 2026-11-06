# MELO — Quick Database, Manual bKash, Admin Login & Chat Setup

## 1. Admin Panel Login & Manual bKash `TrxID` Verification (`/admin`)

Since `/admin` is a public route, it is now gated behind an administrator login screen in [`AdminFeature`](../src/features/admin/admin.feature.tsx):

* **Admin ID (Email):** `melo@gmail.com`
* **Password:** `hippo#aurora`

### How the Manual bKash Workflow Works
1. **Set Your bKash Number:**
   * Sign in to **`/admin`** using the credentials above.
   * At the top of the dashboard, use the **"Manual bKash Collection Number"** bar to set your active bKash number (or set `NEXT_PUBLIC_BKASH_NUMBER` in `.env.local`).
2. **Customer Checkout ([`CheckoutFeature`](../src/features/checkout/checkout.feature.tsx)):**
   * Customers see your bKash number with a **Copy Number** button and the exact total (`৳`) to send.
   * After sending the money via their bKash app, they enter their **bKash Transaction ID (`TrxID`)** (required) and optional sender phone number.
   * The order is saved with `paymentStatus: 'pending'`.
3. **Manual Verification in `/admin`:**
   * Open **`/admin` → Orders & bKash Check**.
   * Check the customer's submitted **`TrxID`** and sender number against your bKash app.
   * Change the **Manual Payment Check** dropdown from `Pending Check` to **`Verified ✓`** (or `Invalid / Unpaid`) and update the **Order Status** to `Confirmed` / `Dispatched`.

---

## 2. Quick 5-Minute Process to Create & Connect Your Database (Supabase)

Your project is wired to [`supabaseService`](../src/core/services/supabase.service.ts), [`productService`](../src/core/services/product.service.ts), and [`orderService`](../src/core/services/order.service.ts).

1. **Create a Free Supabase Project:** Go to [https://supabase.com](https://supabase.com), create a new project (`melo-store`), and select the **Singapore (`ap-southeast-1`)** region.
2. **Run the SQL Schema:** In Supabase **SQL Editor → New Query**, paste [`supabase/schema.sql`](../supabase/schema.sql) and click **Run**.
3. **Add Keys to `.env.local`:** Copy [`.env.example`](../.env.example) to `.env.local` and paste your **Project URL** and **`anon` `public` key** from **Supabase → Project Settings → API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Seed & Manage Products in `/admin`:**
   * Sign in at **`/admin`** and click **"Sync to DB"** to push all 54 initial products to Supabase.
   * Click **"Add New Piece"** or **"Edit"** on any product row to add or update products live.

---

## 3. Floating Bottom-Right WhatsApp & Messenger Chat Setup

Implemented in [`ChatWidget`](../src/shared/chat-widget/chat-widget.component.tsx) and mounted in [`RootLayout`](../src/app/layout.tsx):
* Hovering over or clicking the bottom-right widget pops up **MELO Concierge** with direct **WhatsApp Chat** and **Facebook Messenger** buttons.
* Set your number and page username in `.env.local`:
  ```env
  NEXT_PUBLIC_WHATSAPP_NUMBER=88017XXXXXXXX
  NEXT_PUBLIC_MESSENGER_USERNAME=your_facebook_page_username
  ```
