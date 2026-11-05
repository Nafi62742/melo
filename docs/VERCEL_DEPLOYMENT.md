# MELO — Vercel Hosting & Deployment Guide

This guide walks through deploying the MELO online store to **Vercel** on the 100% free Hobby tier, specifically configured to **only deploy when you push or merge to the `live` branch**.

---

## 🌟 What's Pre-Configured in the Codebase

1. **`vercel.json`**:
   * Pre-configured with edge CDN caching for all product images (`/products/*` cached for 1 year).
   * Production security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy`.
2. **`next.config.ts`**:
   * Configured for modern image formats (`avif` and `webp`).
   * Partial prefetching and component caching enabled.

---

## 🔒 Setup: Deploy ONLY on the `live` Branch

To ensure Vercel only deploys when you push or merge into the `live` branch (and completely ignores all other branches):

### Step 1: Create and Push the `live` Branch on GitHub
Run these commands in your project terminal:
```bash
# 1. Create and switch to the 'live' branch
git checkout -b live

# 2. Push the 'live' branch to GitHub
git push -u origin live
```

---

### Step 2: Set the Production Branch to `live` in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and select your **melo** project.
2. Click on **Settings** (top navigation tab) → **Git** (left sidebar).
3. Find the **Production Branch** section.
4. Change the branch name from `main` to **`live`**.
5. Click **Save**.

---

### Step 3: Tell Vercel to IGNORE All Other Branches
By default, Vercel builds "Preview Deployments" for every branch. To make sure Vercel **ONLY builds when changes hit `live`**:

1. In the same **Settings** → **Git** page, scroll down to **Ignored Build Step**.
2. Select **Custom**.
3. Paste the following command into the box:
   ```bash
   if [ "$VERCEL_GIT_COMMIT_REF" != "live" ]; then exit 0; else exit 1; fi
   ```
   *(How this works: in Vercel, `exit 0` tells Vercel to skip/ignore the build; `exit 1` tells Vercel to proceed. This guarantees that only commits to `live` trigger a build).*
4. Click **Save**.

---

## 🚀 Daily Workflow: How to Release Updates

1. **Do your development work on `main` or a feature branch:**
   * Test your changes locally (`npm run dev`, `npx jest ...`).
   * Pushing to `main` will **NOT** trigger a deployment.
2. **When you are ready to publish live to customers:**
   ```bash
   # Switch to live branch
   git checkout live

   # Merge your latest work from main
   git merge main

   # Push to live (this automatically triggers the Vercel production deployment)
   git push origin live
   ```
   Within 30–45 seconds, your updates will be live on your production URL!

---

## 🌐 Connecting a Custom Domain (e.g. `melobd.com`)

1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings** → **Domains**.
3. Type your domain name (e.g., `melobd.com`) and click **Add**.
4. Set the domain to point to your **Production Branch (`live`)**.
5. Copy the DNS records (`A` record pointing to `76.76.21.21` or a `CNAME`) into your registrar (Namecheap, Cloudflare, etc.).
6. Vercel automatically provisions a free SSL certificate (HTTPS) within 5 minutes.
