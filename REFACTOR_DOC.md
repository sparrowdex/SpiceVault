# SpiceVault Refactoring Journey

This document outlines the major architectural, frontend, and backend modernizations applied to the SpiceVault project. The goal of this refactor was to transition the application from older, legacy paradigms into a highly performant, industry-standard modern web application.

## 1. Frontend Modernization

### Migrated to Vite
- **Previous State:** The React app was bundled using Create React App (CRA), which suffers from slow start times and is no longer officially recommended by the React team.
- **New State:** Migrated the build tool to **Vite**. The development server now boots in milliseconds, Hot Module Replacement (HMR) is instantaneous, and the overall developer experience is drastically improved.
- **Configuration:** Environment variables were updated from `REACT_APP_` to `VITE_`, and `tslib` was explicitly optimized in the `vite.config.js`.

### Refactored to Tailwind CSS
- **Previous State:** The UI was styled using dozens of scattered, component-specific CSS files (`home.css`, `viewrecipe.css`, `UserProfile.css`, etc.) leading to naming collisions and heavy maintenance overhead.
- **New State:** Fully migrated the application to **Tailwind CSS**. All component-specific CSS files were safely deleted. The UI is now powered entirely by utility classes directly inside the JSX, with complex responsive queries mapped to Tailwind's mobile-first `md:` and `sm:` prefixes.
- **Global CSS:** Centralized custom fonts (e.g., `ElegantWomanDemo`, `TropicalCalm`) and CSS custom properties (colors/gradients) into a single `index.css` file.

### Component Reorganization
- Implemented the standard `src/pages/` and `src/components/` architectural pattern.
- Merged isolated UI components (like `PopularRecipes` and `ChefCertifiedRecipes`) directly into their respective Page components to simplify the React tree and reduce file bloat.

## 2. Backend Modernization

### Replaced Sequelize with Prisma ORM
- **Previous State:** The backend relied on Sequelize and raw SQL string queries to communicate with MySQL, which was prone to typos, lacked autocomplete, and struggled with complex relationship mapping.
- **New State:** Fully migrated the application to **Prisma**.
  - Mapped the new Prisma schema to the legacy MySQL table names using the `@@map()` directive to prevent data loss.
  - Replaced hundreds of lines of legacy database queries across `recipe.controller.js`, `auth.controller.js`, and `user.controller.js` with clean, type-safe Prisma Client calls.

### Fixed Cascading Deletions
- **Bug Fix:** Previously, deleting a user account would crash due to strict MySQL Foreign Key constraints leaving orphaned reviews and recipes.
- **Solution:** Implemented Prisma `$transaction` blocks to cleanly cascade deletions through recipes, reviews, and interactions before deleting the primary user account.

### Integrated UploadThing
- **Previous State:** Adding a new recipe required the user to manually host an image somewhere else and paste a raw URL into a text input.
- **New State:** Integrated **UploadThing** (SDK v7) in both the Express backend and React frontend. Users now have a seamless, drag-and-drop zone in the UI that automatically uploads files to the cloud and injects the secure URL directly into the database payload.

## 3. Operations & Security

### Secure Dependency Management
- Addressed critical `npm audit` vulnerabilities by utilizing npm `overrides` in `package.json` to force deep dependencies (like `effect`, `ws`, and `uuid`) to update without breaking the top-level application code.

### Environment Fallbacks
- Enhanced the Node.js entry point (`index.js`) to gracefully stitch together legacy `DB_HOST`, `DB_USER`, and `DB_PASSWORD` variables into the newly required `DATABASE_URL` connection string for Prisma.
- Secured the JWT authentication layer by generating a true, 64-byte cryptographic secret.

---

*This refactor successfully decoupled the project from outdated tools, eliminated all duplicate CSS, and established a scalable, type-safe foundation for future Machine Learning and community features.*