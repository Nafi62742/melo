# MELO — Useful Commands Cheat Sheet

Quick reference of essential terminal commands to run, test, and maintain the MELO store.

---

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```
* **Storefront:** [http://localhost:3000](http://localhost:3000)
* **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

### Production Build & Run
```bash
npm run build
npm run start
```

---

## 🧪 Testing Commands

### Test a Single Feature / Service Only (Recommended)
```bash
npx vitest run src/core/services/product.service.test.ts
npx vitest run src/core/services/order.service.test.ts
npx vitest run src/core/utils/currency.util.test.ts
npx vitest run src/core/utils/slug.util.test.ts
```

### Run All Tests Once
```bash
npm test
```

### Interactive Test Watcher (Reruns on file save)
```bash
npm run test:watch
```

---

## 🧹 Code Quality & Linting

### Check Linter (Zero warnings policy)
```bash
npm run lint
```

---

## 🖼️ Image Conversion & Assets

### Convert Labeled Images to WebP
Converts all named product photos to lightweight `.webp` format and outputs them to `public/products/`:
```bash
npm run convert-images
```
*(Script source is located at `scripts/convert-to-webp.mjs`)*

---

## 🛠️ Handy Utility Commands

### Kill Process if Port 3000 is Busy
```bash
lsof -ti :3000 | xargs kill -9
```

### Clear Next.js Build Cache
```bash
rm -rf .next
```

### View Uncommitted File Changes (Git Status)
```bash
git status
```

