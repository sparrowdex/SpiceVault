# Changelog

All notable changes to the SpiceVault project will be documented in this file.

## [3.0.0] - 2026-05-29: The Social Ecosystem & Mobile Overhaul

### 🌐 Social Ecosystem & Feed
- **The Culinary Feed:** Built a "Threads-like" social timeline (`/feed`) where users can scroll through updates from chefs they follow.
- **Rich Media Posts:** Extended the `UploadThing` router to support uploading videos (up to 32MB) alongside images for feed posts.
- **Automated System Posts:** Injected hooks into the ML and Recipe controllers. The system now automatically generates a post on the Feed whenever a chef publishes a new recipe or a user leaves a 5-star rating, complete with clickable "View Recipe" link cards.
- **Stories & Articles:** Implemented a horizontal "Chef Updates" (Stories) row for temporary updates, and a gorgeous, massive "Featured Articles" hero slideshow for deep-dive culinary content on the Homepage.
- **Social Data Layer:** Extended the Prisma Schema with `Follow`, `Story`, `Article`, and `FeedPost` models. Created a dedicated `social.controller.js` to handle following logic, feed fetching, and media uploads.
- **Dynamic Featured Articles:** Replaced hardcoded articles with a dynamic database fetch. Added an immersive, full-screen article reader modal to view the full content.
- **Instagram-Style Story Viewer:** Implemented a full-screen, tap-to-navigate story viewer overlay for both the Homepage and Feed. Added functionality for chefs to delete their own stories.
- **Automated Story Cleanup:** Added a background `node-cron` job to the Express server that runs hourly to permanently delete stories older than 24 hours from the database to save space.
- **Profile Picture Fallbacks:** Fixed broken image links across the social feed and stories by properly parsing local URLs and implementing a dynamic initial-based fallback for users without custom profile pictures.

### 📱 Mobile Responsiveness & UI/UX
- **Mobile Responsiveness:** Completed a massive overhaul of the app for smartphone viewports. Implemented a sleek, sliding glass-morphism sidebar drawer for mobile navigation. Dynamically scaled down recipe cards, filter buttons, and the "Add Recipe" form for smaller screens.
- **User Profile & Settings:** Completely modernized the UI. Embedded the **Chef Insights Dashboard** directly into the `UserProfile` as an exclusive tab. Extracted destructive actions (like Account Deletion) out of profile modals and into a brand new, dedicated **Settings** page.
- **Profile Customization:** Added a new `profile_picture` attribute to users, complete with a drag-and-drop `UploadThing` image uploader in the new Settings page.
- **User Profile Tab Bar:** Redesigned the layout to use a horizontal scrollable tab bar. Implemented CSS `snap-x` and hidden scrollbars to make the tabs feel like a native mobile swiping experience.
- **Dynamic Categories:** Replaced hardcoded meal categories with a dynamic database extraction system. The homepage dropdowns and Add Recipe form now automatically populate based on user-created categories, and chefs can type custom categories on the fly with real-time duplication warnings.
- **Upload UI Clarification:** Explicitly displayed the "Max file size: 4MB" limit on the Profile Picture uploader to prevent user confusion.

### 🔒 Security & Operations
- **Comprehensive Error Logging:** Built a professional error logging system (`utils/logger.js`) that writes detailed stack traces to a local `error.log` file for developers, while safely sanitizing error responses sent to users in production to prevent sensitive data leaks.

## [2.0.0] - 2026-05-27: The Great Modernization Refactor

This major release focused on modernizing the entire stack, drastically improving developer experience (DX), performance, and maintainability.

### 🚀 Frontend: Vite & Tailwind CSS Migration

#### **Why we did it:**
- **Create React App (CRA)** is officially deprecated by the React team and suffers from slow build times and sluggish hot-module replacement (HMR).
- **Custom CSS files** for every component (`home.css`, `viewrecipe.css`, etc.) were causing naming collisions, bloated file trees, and constant context-switching during development.

#### **How we did it:**
- Swapped `react-scripts` for **Vite**, moving `index.html` to the root and updating environment variables to use the `VITE_` prefix.
- Replaced all component-level CSS files with inline **Tailwind CSS** utility classes, leveraging a mobile-first approach (`sm:`, `md:` prefixes).
- Consolidated global styles, custom `@font-face` declarations (e.g., *ElegantWomanDemo*, *TropicalCalm*), and CSS custom properties into a single `index.css` file.

#### **Challenges & Resolutions:**
- **Problem:** Vite threw strict `[PARSE_ERROR] Unexpected JSX expression` errors.
  - **Resolution:** Vite native transpilers require files containing JSX to explicitly use the `.jsx` extension. Renamed all `.js` component files to `.jsx`.
- **Problem:** PostCSS threw `@import must precede all other statements` errors.
  - **Resolution:** Moved Google Fonts `@import` rules to the absolute top of `index.css`.
- **Problem:** `Failed to resolve import "tslib"` from UploadThing.
  - **Resolution:** Vite aggressively cached an incomplete dependency tree. Fixed by adding `tslib` to `optimizeDeps` in `vite.config.js` and clearing the hidden `.vite` cache folder.
- **Problem:** Global rankings podium layout stacked vertically on desktop screens.
  - **Resolution:** Corrected Tailwind responsive classes (swapped `md:flex-col` for `md:flex-row` on the podium container) to ensure a sleek horizontal layout on larger screens.
- **Problem:** Vite development server crashed with `[PARSE_ERROR] Unterminated regular expression`.
  - **Resolution:** Fixed an edge-case bug in Vite's new blazing-fast OXC parser by swapping escaped single quotes (`\'`) for double quotes (`"`) inside JSX template literals in `Home.jsx`.
- **Problem:** `GlobalRankingsPage` hid the complete rankings list for Daily/Weekly/Monthly tabs if no rating changes occurred.
  - **Resolution:** Removed the restrictive frontend conditional rendering, allowing the `LEFT JOIN` backend queries to properly display the current state of the leaderboard regardless of daily activity.
- **Problem:** Widescreen navbar broke when trying to implement the mobile hamburger menu.
  - **Resolution:** Decoupled the mobile and desktop navbars into completely separate DOM nodes. Used raw CSS media queries to guarantee the pristine widescreen layout renders flawlessly on desktop without interference from Tailwind's JIT compiler caching.

### 🎨 UI/UX & Feature Enhancements
- **Home Page:** Transformed the Popular Recipes section into a seamless, endless auto-sliding carousel. Replaced bulky arrows with sleek `lucide-react` Chevrons, added a "Clear Filters" button, and adjusted grid pagination to 10 items per page for better alignment.
- **Home Page Filtering:** Replaced the horizontal filter carousel with clean, intuitive dropdowns placed directly next to the search bar for immediate accessibility.
- **Navigation:** Grouped "Chef Certified", "Global Rankings", and "Popular Recipes" under a sleek new "Discover" dropdown.
- **Authentication UX:** Added a hard redirect to the homepage upon logout to ensure protected session data is completely cleared from the view.
- **Recipe Auto-Formatting:** Added a smart text formatter that automatically converts line-broken text in Ingredients and Instructions into beautiful bulleted/numbered lists. Added helpful 'i' tooltips to the Add Recipe form explaining this feature.
- **View Recipe:** Added client-side pagination (5 per page) and human-readable timestamps to the reviews section. Upgraded the Nutrition block to use stylish, wrapped pill-tags instead of raw stacked text.
- **Add Recipe Form:** Streamlined macronutrient inputs into a single compact horizontal row. Customized the UploadThing dropzone to visually match the SpiceVault branding and recommend a 4:3 aspect ratio. Added an automatic form reset on successful submission.
- **Recommendations Grid:** Removed descriptions from recommendation cards and truncated long titles to ensure perfectly aligned grid heights, keeping the focus on the Machine Learning insights.
- **Image Rendering:** Implemented smart image URL parsing across all recipe cards to gracefully render both legacy local files and new UploadThing cloud URLs without broken image tags.
- **Branding:** Replaced the generic React favicon and meta description in `index.html` with a custom `logo.svg` and professional SpiceVault branding.
- **Background Fix:** Fixed the `BackgroundGradient` cutting off on scrollable pages by switching `background-size: 100% 100vh` to `background-attachment: fixed`.

---

### 🗄️ Backend: Prisma ORM & UploadThing Integration

#### **Why we did it:**
- **Sequelize & Raw SQL:** The legacy backend relied on raw SQL string queries (`db.sequelize.query`), which lacked type safety, were prone to typos, and made complex table joins difficult to read and maintain.
- **Manual Image URLs:** Users previously had to manually paste hosted image URLs when adding recipes. We needed a robust, native cloud-storage solution.

#### **How we did it:**
- **Prisma ORM:** Replaced Sequelize entirely with Prisma. Created a clean `schema.prisma` file and replaced raw SQL with Prisma Client methods (`prisma.recipe.findMany()`, `prisma.$transaction()`).
- **UploadThing:** Integrated UploadThing SDK v7 to handle direct-to-cloud AWS S3 uploads, replacing text inputs with a drag-and-drop `<UploadDropzone />` component in React.

#### **Challenges & Resolutions:**
- **Problem:** Deleting a user account crashed the server due to strict MySQL Foreign Key constraints (orphaned recipes/reviews).
  - **Resolution:** Wrapped the user deletion logic in a Prisma `$transaction`. This cleanly cascades deletions, removing a user's recipes, reviews, interactions, and raw legacy table entries *before* deleting the user record.
- **Problem:** `P1012: Environment variable not found: DATABASE_URL`.
  - **Resolution:** The legacy `.env` file used separated variables (`DB_USER`, `DB_PASSWORD`). Wrote an auto-fallback script in `index.js` to dynamically stitch these into a Prisma-compatible `DATABASE_URL`.
- **Problem:** `P2022: Column 'createdAt' does not exist` on the `user_interactions` table.
  - **Resolution:** Added the missing `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP` column via raw SQL to allow ML recommendation tracking to function without crashing.
- **Problem:** `P2022: Column 'ingredients', 'calories', 'createdAt' do not exist`. "All Recipes" and "Chef Certified Recipes" pages crashed.
  - **Resolution:** The new Prisma schema introduced fields required for new ML features. Because `npx prisma db push` initially threatened to drop unmodeled legacy tables, `npx prisma db pull` was used to safely introspect the database reality. The remaining missing columns were safely appended using raw `ALTER TABLE` SQL queries to synchronize the database without data loss.
- **Problem:** "Invalid email or password" for legacy test users.
  - **Resolution:** Legacy test users had unhashed, plaintext passwords in the database, which `bcrypt.compare` rejected. Added a "legacy fallback" in the `auth.controller.js` to allow plaintext matches for older accounts.
- **Problem:** ML Recommendation Service crashed (`Cannot find module '../models'`).
  - **Resolution:** The background service was still attempting to use Sequelize. Completely refactored `mlRecommendationService.js` to use Prisma and optimized the content-based similarity algorithms.
- **Problem:** Authenticated users couldn't add or delete recipes (Payload read `user: undefined`).
  - **Resolution:** Fixed a property mismatch in the JWT payload (`userId` vs `user_id`). Standardized `req.user.userId` across `recipe.controller.js` and the auth middleware.
- **Problem:** UploadThing UI silently hung and failed to report successful uploads.
  - **Resolution:** Removed restrictive `allowedHeaders` from the Express `cors` configuration so UploadThing's custom headers weren't blocked. Configured a Vite proxy to correctly route `/api` requests and migrated to the v7 standard `UPLOADTHING_TOKEN`.

---

### 🔒 Security & Operations

#### **Why we did it:**
- `npm audit` reported multiple high-severity vulnerabilities in sub-dependencies (`effect`, `ws`, `uuid`) introduced by new packages.
- Hardcoded MySQL passwords were accidentally committed to git-tracked setup scripts.

#### **How we did it:**
- **NPM Overrides:** Used the `overrides` field in both `package.json` files to force modern, patched versions of vulnerable deep-dependencies without breaking the top-level packages.
- **Secret Management:** Sanitized the `setup-env.js` utility script to output placeholder passwords instead of real credentials, ensuring sensitive data stays securely inside the `.gitignore`-protected `.env` files. Generated a secure, 64-byte cryptographic hash for the `JWT_SECRET`.

---

## [1.0.0] - Initial Release

### Features
- Initial setup of SpiceVault using Create React App and Node.js/Express.
- MySQL database integration via Sequelize.
- Machine Learning recommendation endpoints (Collaborative, Content-Based, Hybrid filtering) implemented in Node.js.
- Basic authentication and user profile management.
- Global rankings and chef-certified recipe views.