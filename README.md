# 🚀 GyanStack: The Ultimate College Resource Hub

GyanStack is a premium, high-performance **MERN Stack** platform designed specifically for college students (BCA/MCA) to share, manage, and discover academic resources like Notes, Assignments, and Previous Year Question Papers (PYQs).

Built with a focus on modern aesthetics (Glassmorphism), speed, and offline capability (PWA), it serves as a centralized community-driven library.

### 🌐 Live Demo: [gyanstack.vercel.app](https://gyanstack.vercel.app/)

---

## ✨ Key Features

### 🤖 GyanStack AI — "Study Buddy" (Powered by Groq / Llama 4 Scout)
- **🔍 Exact & Fuzzy Document Search**: Type any document name — exact matches open instantly; partial matches return up to 5 clickable suggestions using Dice-coefficient similarity scoring.
- **📄 Direct Content Navigation**: AI can open any content detail page by name without the user having to manually browse.
- **📝 AI Notes & Summaries**: Ask the AI to "make notes on X" or "summarize Y" — it fetches available content and generates structured study notes via Groq.
- **❓ Practice Question Generator**: Ask "generate practice questions for Z" — returns MCQ/short answer questions from library content.
- **👤 Uploader Lookup**: Ask "who uploaded [topic]?" — AI returns the contributor's name and links to their profile page.
- **📬 Real Content Requests**: Asking AI to "request [topic]" actually saves a Request document to MongoDB and provides a tracking link — no more fake confirmations.
- **🛡️ Auth-Guarded**: Intelligently prompts login for protected actions while serving guests with quick-action chips.
- **⚡ Quick-Action Chips**: Contextual prompt starters for instant access to all Study Buddy features.
- **📋 Copy Button**: One-click copy on every AI message.

### 📚 Resource Management
- **Categorized Hub**: Quick-access categorized view on the homepage for recently uploaded materials.
- **Multi-Format Support**: Native handling of PDFs, Video lectures, External links, and Image-based notes.
- **🚀 Premium Interactions**: Real-time glassmorphism notifications for all user actions (Like, Save, Download).
- **📱 Mobile-First Library**: Intelligent 2×2 folder grid and responsive header titles.
- **🧭 Smart Navigation**: Breadcrumb auto-scrolling and direct category metadata links.
- **📊 Resource Intelligence**: Folders display real-time item counts before you click them.
- **🗂️ Google Drive Integration**: Type-aware preview — DOCX opens in Docs viewer, PPTX in Slides viewer, XLSX in Sheets viewer, PDF in Drive viewer. No more "Secure View" lock screens.

### 👤 User & Social Features
- **Contributor Ecosystem**: Real-time "Top Contributors" shelf highlighting community leaders.
- **Uploader Profile Pages**: Browse all content from any contributor at `/uploader/:id`.
- **Request Tracker**: Dedicated dashboard section to track the status of your content requests in real-time.
- **PWA Experience**: Fully installable as a mobile or desktop app with **Notifications**.
- **Cross-Device Sync**: Notifications read status and user preferences sync instantly between mobile and desktop.
- **📣 Announcement System**: Full-lifecycle announcement management — admins draft requests, superadmins approve/reject, system auto-broadcasts FCM push to all subscribers on approval.
- **📊 Announcement Analytics**: Each announcement tracks `sentCount` (push receipts) and `openCount` (detail page opens) for engagement insights in the Admin dashboard.
- **🔗 Smart Redirect Links**: Announcements support a custom `redirectLink` — push notification and "Read More" tap navigates directly to any URL (internal route or external link) instead of the generic announcements list.
- **🔔 Custom Notification Sound**: Platform-branded `notification_ping.mp3` plays on every incoming push notification (both Firebase SW and in-app).
- **✅ Mark-All-Read Sync**: Opening the Announcements page automatically marks all notifications as read server-side via `lastSeenAnnId`, with cross-device sync.
- **🛡️ Role-Based Announcement Control**: Superadmins can edit/delete any announcement at any status; Admins can only edit their own `pending` requests and delete their own submissions.
- **Universal Dark Mode**: Intelligent self-healing theme engineering for 100% visibility across light and dark modes.
- **🔗 Smart Social Sharing**: Dynamic per-route Open Graph meta tags — home page shares the full og-banner (1200×630), inner pages share the branded logo for clean WhatsApp/Telegram/Twitter previews.

### 🛡️ Hardened Security & Stability
- **Multi-Tier Rate Limiting**: Specialized shields for Global API (100req/15m), Authentication (10req/15m), and AI Services (20req/15m).
- **Database Watchdog**: Real-time Mongoose connection monitoring with auto-recovery.
- **Surgical AI Scrub**: Programmatic filtering of technical jargon, JSON leaks, and internal IDs from AI responses.
- **JWT & Cookie Security**: Secure persistent sessions with cross-origin protection.

---

## 🛠️ Technology Stack

| **Ecosystem** | React (Vite), Framer Motion, Bootstrap 5, Bootstrap Icons, React Hot Toast |
| **Backend** | Node.js, Express, MongoDB, Google Drive API v3 |
| **AI Brain** | Groq SDK (`meta-llama/llama-4-scout-17b-16e-instruct`) |
| **Social Gear** | Firebase Cloud Messaging (FCM), `react-helmet-async` (Dynamic OG Tags) |
| **Storage** | Google Drive API (Files), Cloudinary (Media/Profiles) |
| **Security** | AI interaction logging, JWT, BcryptJS, Express Rate Limit |
| **DevOps** | Vite-Plugin-PWA, Sharp (OG Banner), Dotenv, CORS, HMR-Optimized Context Architecture |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster
- Groq API Key
- Cloudinary Account
- Google Cloud Service Account (P12/JSON Key)

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/Jainish-2901/gyanstack.git
   cd gyanstack-mern
   npm install
   ```

2. **Backend Config**
   Create `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=your_atlas_uri
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_key
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   GOOGLE_DRIVE_CLIENT_EMAIL=...
   GOOGLE_DRIVE_PRIVATE_KEY=...
   ```

3. **Run Locally**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start

   # Terminal 2: Student Client
   cd client && npm run dev

   # Terminal 3: Admin Dashboard
   cd admin && npm run dev
   ```

---

## 🌐 Deployment Plan

### **Backend (Node/Express)**
- **Platform**: Render, Heroku or Railway.
- **Note**: Ensure `NODE_ENV=production` is set to activate production-grade security handlers and rate limits.

### **Frontend (Vite/React)**
- **Platform**: Vercel, Netlify or Firebase Hosting.
- **Process**: Run `npm run build` in `/client` and `/admin` directories and deploy the resulting `dist` folders.

---

## 📂 Project Structure

```text
├── admin/           # Admin React dashboard (Vite)
├── backend/          # Express API & DB Watchdog
│   ├── controllers/  # AI Logic, Auth, & Content Handling
│   ├── models/       # Hardened Mongoose Schemas
│   ├── routes/       # Protected & Public Endpoints
│   └── utils/        # AI Cleaning & Data Streamers
├── client/           # Student-facing PWA (Vite)
│   ├── public/       # Static assets (og-banner.png, logo.png, PWA icons)
│   └── scripts/      # Dev tools (generate-og-banner.mjs)
└── README.md
```

---

*Built with ❤️ for the student community by Jainish.*


*April 23, 2026 — Announcement System Overhaul: role-based CRUD (superadmin/admin), sentCount & openCount analytics, custom redirectLink per announcement, notification_ping.mp3 custom sound, mark-all-read cross-device sync, Firebase SW enhancements, and full Admin UI upgrade for announcement management.*
