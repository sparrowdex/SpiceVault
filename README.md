<h1 align="center">
  <span style="background: -webkit-linear-gradient(45deg, #ff6600, #ff8533); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
    SpiceVault
  </span>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/UploadThing-171717?style=for-the-badge&logo=vercel&logoColor=white" alt="UploadThing" />
</p>

---

## 🌟 Core Features

- **The Culinary Feed (Social Network):** A full "Threads/Instagram-style" social timeline where users can scroll through rich-media updates, articles, and automated recipe posts from the chefs they follow.
- **Instagram-Style Stories:** A full-screen, tap-to-navigate 24-hour story viewer for chefs to share temporary updates with auto-cleanup background cron jobs.
- **Machine Learning Recommendations:** A hybrid recommendation engine (Collaborative + Content-Based Filtering) that learns from your views, likes, saves, and ratings to provide highly personalized recipe suggestions.
- **Dynamic Content:** A gorgeous Featured Articles slideshow, Endless Auto-Sliding Recipe Carousels, and dynamic database-driven category filtering.
- **Chef Insights Dashboard:** Advanced analytics for content creators, featuring 6-month rating trend charts and AI-generated personalized profile tips.
- **Global Leaderboards:** Track the top-rated recipes across Daily, Weekly, Monthly, and All-Time categories.
- **Cloud Media Uploads:** Seamless drag-and-drop image and video uploading powered by UploadThing.

---

## Frontend Overview

The frontend is a responsive, user-friendly interface built to offer an engaging cooking experience:

- **Mobile-First Design:** Fully responsive UI with an animated glass-morphism sidebar for mobile devices.
- **Interactive Filtering:** Clean dropdowns, swiping carousels, and dynamic categories that extract themselves directly from the database.
- **Auto-Formatting text:** Automatically formats user-entered recipe instructions and ingredients into neat bulleted lists.
- **User Profiles:** A sleek, horizontal tab-bar interface to manage saved, liked, rated, and authored recipes.

---

##  Tech Stack

| Layer      | Technologies                           |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, Lucide React, UploadThing |
| Backend    | Node.js, Express.js, node-cron         |
| Database   | MySQL with Prisma ORM                  |
| ML Engine  | Custom algorithms using `ml-matrix` and `natural` |
| Version Control | Git & GitHub                     |
| Deployment | Vercel (Frontend), HuggingFace (Backend)    |

---

## Getting Started

### Prerequisites
- Node.js and npm installed
- MySQL installed and running
- Git installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sparrowdex/SpiceVault.git
   cd SpiceVault

### For running the app:

**Terminal 1 (Backend):**
cd backend
npm run dev

**Terminal 2 (Frontend):**
cd frontend
npm start

*(Note: The frontend now uses Vite, which starts almost instantly!)*

## 📄 License

This project is licensed under the [MIT License](LICENSE).
