# MELO — Vercel Hosting & Deployment Guide

This guide walks through deploying the MELO online store to **Vercel** on the 100% free Hobby tier.

---

## 🌟 What's Pre-Configured in the Codebase

1. **`vercel.json`**:
   * Pre-configured with edge CDN caching for all product images (`/products/*` cached for 1 year).
   * Production security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy`.
2. **`next.config.ts`**:
   * Configured for modern image formats (`avif` and `webp`).
   * Partial prefetching and component caching enabled.

---

## 🚀 Deployment Options

### Method 1: Automatic Deploy via GitHub (Recommended)

This is the standard, zero-maintenance setup:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial MELO store commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/melo.git
   git push -u origin main
   ```
2. **Connect to Vercel**:
   * Sign in to [vercel.com](https://vercel.com) (free account with GitHub).
   * Click **"Add New..."** → **"Project"**.
   * Select your `melo` repository from GitHub.
   * Framework Preset will automatically detect **Next.js**.
   * Click **"Deploy"**.
3. **Done!**
   * Vercel will build and assign you a live HTTPS URL (e.g. `melo-store.vercel.app`) in under 45 seconds.
   * Any future push to `main` will automatically build and deploy the update.

---

### Method 2: Direct Deploy via Terminal (No GitHub Needed)

You can also deploy directly from your local terminal:

1. **Deploy a Preview Version**:
   ```bash
   npx vercel
   ```
   *Follow the one-time interactive login prompt.*

2. **Deploy Directly to Production**:
   ```bash
   npm run deploy:prod
   ```
   *(or `npx vercel --prod`)*

---

## 🌐 Connecting a Custom Domain (e.g. `melobd.com`)

1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings** → **Domains**.
3. Type your domain name (e.g., `melobd.com`) and click **Add**.
4. Vercel will give you two DNS records (an `A` record pointing to `76.76.21.21` or a `CNAME`).
5. Copy these into your domain registrar (Namecheap, Cloudflare, BTCL, etc.).
6. Vercel automatically generates a free SSL certificate (HTTPS) within 5 minutes.

