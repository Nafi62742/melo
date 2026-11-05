# MELO — AI Assistant & Claude Instructions

This document outlines mandatory operational and development rules for any AI agent or assistant (including Claude) working on the MELO codebase.

---

## 1. Git & Version Control Rules

1. **NO Autonomous Commits or Pushes:**
   * **NEVER** run `git commit`, `git push`, or alter remote repository state.
   * Committing and pushing code to GitHub/remote is reserved strictly for the repository owner.
   * You may inspect git status (`git status`, `git diff`) to confirm file changes, but never commit them.

---

## 2. Testing Execution Rules

1. **Test Only Related Features:**
   * When developing or refactoring a feature, **ONLY run the specific test file** for that feature or service.
   * Example:
     ```bash
     npx jest src/core/services/product.service.test.ts
     ```
2. **Do NOT Run All Tests Arbitrarily:**
   * **Do NOT execute the full test suite (`npm test` or `npx jest`)** unless the user explicitly commands it (e.g. "run all tests").
   * Keep test feedback fast, targeted, and focused only on the files currently being modified.

---

## 3. Architecture & Code Quality Standards

1. **Maintain 3-Tier Layering:**
   * `src/core/`: Models, data layer, global services, i18n dictionaries, and utilities.
   * `src/shared/`: Reusable, presentation-only UI components (Navbar, Footer, ProductCard, CartDrawer).
   * `src/features/`: Feature modules and domain logic (Home, Catalog, ProductDetail, Checkout, Admin).
   * `src/app/`: Next.js App Router endpoints that simply mount and route to the corresponding feature.
2. **Strict TypeScript (No `any`):**
   * Never use `any`. Always declare explicit interfaces under `src/core/models/`.
3. **Zero Lint Warnings:**
   * Always verify that changes pass `npm run lint` with 0 errors and 0 warnings.
4. **Image Handling:**
   * Do not use raw iPhone `IMG_*` photos for production catalogue items.
   * Use web-optimized `.webp` images located in `public/products/`.
   * When adding new products, convert images using `npm run convert-images` (located in `scripts/convert-to-webp.mjs`).

