# MELO — Facebook Page, Instagram Business & WhatsApp Setup Guide (Jewellery, Gadgets & Lifestyle)

This guide walks you step-by-step through setting up your **Facebook Page + Messenger (`m.me`)**, **Instagram Business Page**, and **WhatsApp Business Account** for **MELO** as a multi-category store (curated jewellery, smart gadgets, tech accessories, and lifestyle essentials), connecting them to your **MELO Storefront & Admin Panel (`/admin`)**, and managing orders coming from social channels.

---

## 1. Facebook Page & Messenger (`m.me`) Setup

### 1.1 Create the Facebook Page (Multi-Category Friendly)
1. Visit [facebook.com/pages/create](https://www.facebook.com/pages/create).
2. Enter your page details so you can sell both **Jewellery** and **Gadgets / Lifestyle Products** under one brand:
   - **Page Name:** `MELO` or `MELO Bangladesh`
   - **Categories (You can select up to 3 on Facebook):**
     1. `Shopping & Retail`
     2. `E-commerce Website`
     3. `Jewelry/Watches` *(or `Electronics` / `Product/Service`)*
   - **Bio:**
     > *Where Little Wonders Light Up ✨ Curated light-luxury jewellery, smart everyday gadgets & lifestyle essentials. Cash on Delivery & bKash across Bangladesh.*
3. Upload your **MELO Logo** as the profile picture and a clean banner showcasing your featured products.

### 1.2 Set Your Custom `@username` (Required for Messenger `m.me` Link)
1. Switch into your new **MELO Facebook Page** profile.
2. Go to **Settings & Privacy → Settings → Page Setup → Name & Username**.
3. Set a clean username (for example: `melobangladesh` or `melo.bd`).
4. Once saved, Facebook automatically activates two direct links for your store:
   - **Facebook Page URL:** `https://facebook.com/melobangladesh`
   - **Direct Messenger Chat URL:** `https://m.me/melobangladesh`

### 1.3 Configure Action Button & Instant Reply
1. On your Facebook Page header, click **Add Action Button** → Choose **Send Message** (or **Send WhatsApp Message**).
2. Add your live website URL in the Page's **About → Contact and Basic Info** section.
3. Open [Meta Business Suite](https://business.facebook.com) → **Inbox → Automations → Instant Reply**, enable it for **Messenger** and **Instagram**, and set a welcome message that works for any product type (jewellery or gadgets):
   > *"Assalamu Alaikum & welcome to MELO! ✨ Browse our live-stock Jewellery, Gadgets & Lifestyle collection at [your website URL] — or send us the product name/screenshot along with your:
   > 1. Full Name
   > 2. Phone Number
   > 3. Full Delivery Address (Inside Dhaka ৳70 / Outside Dhaka ৳130)"*

---

## 2. Instagram Business Page Setup

### 2.1 Create & Convert to a Business Account
1. Create an Instagram account for your brand (e.g., `@melobangladesh` or `@shopmelo.bd` — avoid putting only "jewels" in the username so it fits gadgets and future categories too).
2. Go to **Profile → Edit Profile → Switch to Professional Account**.
3. Select **Business** and choose **`Shopping & Retail`** or **`Product/Service`** as your category (this covers both jewellery and gadgets).

### 2.2 Link Instagram to Your Facebook Page
1. In the Instagram app, go to **Edit Profile → Page → Connect or create** and select your **MELO Facebook Page**.
2. **Benefit:** Inside **Meta Business Suite Inbox** (on phone or desktop), both **Facebook Messenger** messages and **Instagram DMs/Comments** appear in one unified inbox.

### 2.3 Add Your Website & Bio
1. Go to **Edit Profile → Bio** and write:
   > *✨ Curated Jewellery • Smart Gadgets • Everyday Finds*
   > *🚚 Nationwide Delivery in Bangladesh (COD & bKash)*
   > *👇 Shop Live Inventory:*
2. Go to **Edit Profile → Links → Add External Link** and paste your live MELO website URL.
3. Your Instagram store URL is:
   - `https://instagram.com/melobangladesh` (replace with your chosen username)

---

## 3. WhatsApp Business Setup

### 3.1 Register WhatsApp Business
1. Download the **WhatsApp Business** app (Android / iOS) and verify your store phone number (e.g., `017XXXXXXXX`).
2. Go to **Settings → Business Tools → Business Profile** and fill in:
   - **Business Name:** `MELO`
   - **Category:** `Shopping & Retail`
   - **Description:** *"Where Little Wonders Light Up — Curated Jewellery, Smart Gadgets & Everyday Lifestyle Essentials. Nationwide Delivery in Bangladesh."*
   - **Website:** Your live MELO website URL

### 3.2 Add Quick Replies for Fast Order Taking
Go to **Settings → Business Tools → Quick Replies** and create shortcuts so you can reply to customers in 1 tap:

| Shortcut | Message Template |
| :--- | :--- |
| `/order` | *"To confirm your MELO order, please share: 1) Product/Gadget Name, 2) Full Name, 3) Phone Number, 4) Full Delivery Address (Inside Dhaka ৳70 / Outside Dhaka ৳130), and 5) Payment method (bKash or Cash on Delivery)."* |
| `/bkash` | *"You can send your bKash payment to our number and share the TrxID or last 4 digits. We will verify it immediately!"* |
| `/track` | *"Your MELO order is confirmed! ✨ You can track your live delivery status anytime on our website at /account using your phone number."* |

### 3.3 How Your WhatsApp Direct Link (`wa.me`) Works
- Standard format: `https://wa.me/88017XXXXXXXX` (`88` + your 11-digit Bangladesh number, no `+` or dashes).
- In the MELO Admin Panel (`/admin`), you can type either `017XXXXXXXX` or `https://wa.me/88017XXXXXXXX` — the website automatically converts `017XXXXXXXX` into `https://wa.me/88017XXXXXXXX`.

---

## 4. Connecting Your Links to the MELO Website

Your storefront's floating bottom-right **Chat with Us** widget (`src/shared/chat-widget/chat-widget.component.tsx`) and **Footer** social buttons (`src/shared/footer/footer.component.tsx`) automatically load their URLs from Supabase (`public.store_links`) via `storeLinkService` and `storeLinkRepository`.

### 4.1 One-Time Database Table Setup (Supabase)
If you haven't created the `public.store_links` table yet:
1. Open your **Supabase Dashboard → SQL Editor**.
2. Copy and run the SQL inside [`supabase/store_links.sql`](../supabase/store_links.sql).

### 4.2 Updating Links Live from `/admin`
1. Sign in to **`/admin`** on your website (`melo@gmail.com`).
2. Click the **`Chat & URLs`** tab:
   - **`whatsapp` (WhatsApp Concierge):** Enter your number (e.g., `017XXXXXXXX`) → Click **`Save URL`**.
   - **`messenger` (Facebook Messenger):** Enter your Page username (e.g., `melobangladesh` or `https://m.me/melobangladesh`) → Click **`Save URL`**.
   - **`facebook` (Facebook Page):** Enter `https://facebook.com/melobangladesh` → Click **`Save URL`**.
   - **`instagram` (Instagram):** Enter `https://instagram.com/melobangladesh` → Click **`Save URL`**.
3. You can also add any extra link (such as **TikTok**, **YouTube**, or **Telegram**) using the **Add Custom URL** form at the bottom of the **`Chat & URLs`** tab:
   - Choose **`Floating Chat Popup (chat)`** if you want it inside the bottom-right chat button.
   - Choose **`Footer Social Link (social)`** if you want it displayed in the website footer.
4. Click **`Sync to DB`** in the top bar to push all links to Supabase.

---

## 5. Adding "Gadgets" (or Any New Product Category) in `/admin`

Because your database uses the `public.product_types` table, you can add **Gadgets** (or any future category like **Smartwatches**, **Audio**, **Desk Accessories**, **Bags**) anytime without touching code:

1. Go to **`/admin`** → **`Catalogue`** tab.
2. At the top card (**Step 1 · Product Types Table (`public.product_types`)**):
   - Type **`Gadgets`** (or e.g., `Mini Gadgets`, `Tech Accessories`) in **New Product Type Name**.
   - Add an optional description (e.g., *"Smart everyday gadgets and portable electronics"*).
   - Click **`+ Add Product Type`**.
3. Now click **`+ Add New Piece`** (or **Import CSV**) and select **`Gadgets (gadgets)`** from the Product Type dropdown!
4. Your storefront `/shop` page and Navbar will automatically show the new **Gadgets** category tab alongside your existing categories.

---

## 6. Managing Social Orders (WhatsApp, Messenger & Instagram)

Whenever a customer orders a gadget or jewellery item through **WhatsApp**, **Facebook Messenger**, or **Instagram DM**:

1. Open **`/admin`** and click the green **`+ Manual Order (WA/FB)`** button.
2. Select the **Order Channel** (`WhatsApp Order` or `Facebook Messenger`).
3. Enter the customer's **Full Name**, **Phone Number**, **Full Delivery Address**, **Delivery Zone** (`Inside Dhaka ৳70` or `Outside Dhaka ৳130`), and **Payment Method** (`COD`, `bKash`, or `Card`).
4. Select the item(s) and quantities they bought, then click **`Create Order & Deduct Stock`**.

**What happens automatically:**
- Stock is deducted from `public.products` so your website inventory stays 100% accurate.
- The order is saved in `public.orders` with a `WHATSAPP` or `MESSENGER` channel badge.
- Once marked as **Delivered**, its revenue, per-unit cost (`costPriceCNY + shipping`), and net profit are automatically calculated under its category (e.g., `Gadgets`, `Earrings`, `Rings`) in your **`Profit & Analytics`** tab.
- Your customer can visit **`/account`** on your website and enter their phone number or Order ID (`MELO-...`) to track their order status live!
