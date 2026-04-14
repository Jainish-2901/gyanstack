# 🚀 GyanStack: The Ultimate College Resource Hub

GyanStack is a premium, high-performance **MERN Stack** platform designed specifically for college students (BCA/MCA) to share, manage, and discover academic resources like Notes, Assignments, and Previous Year Question Papers (PYQs). 

Built with a focus on modern aesthetics (Glassmorphism), speed, and offline capability (PWA), it serves as a centralized community-driven library.

### 🌐 Live Demo: [gyanstack.vercel.app](https://gyanstack.vercel.app/)

---

## ✨ Key Features

### 🤖 Spatial AI Assistant (Powered by Groq/Llama 3.3)
- **Contextual Intelligence**: Aware of the user's current page location to provide relevant, immediate help.
- **Universal Navigator**: Can instantly open any public page or dashboard section (Saved, Settings, Requests) via direct commands.
- **Auto-Request System**: Automatically detects if content is missing and allows users to submit formal requests to admin with one click.
- **Auth Guarded**: Intelligently requests login for protected sections while acting as a polite concierge for guests.
- **Interactive Buttons**: Dynamic selection pills for seamless content discovery without typing.

### 📚 Resource Management
- **Categorized Hub**: Quick-access categorized view on the homepage for recently uploaded materials.
- **Multi-Format Support**: Native handling of PDFs, Video lectures, External links, and Image-based notes.
- **🚀 Premium Interactions**: Real-time glassmorphism notifications for all user actions (Like, Save, Download).
- **📱 Mobile-First Library**: Intelligent 2x2 folder grid and responsive header titles.
- **🧭 Smart Navigation**: Breadcrumb auto-scrolling and direct category metadata links.
- **📊 Resource Intelligence**: Folders display real-time item counts before you click them.
- **🗂️ Google Drive Integration**: High-performance streaming and PDF previews with robust diagnostic tools.

### 👤 User & Social Features
- **Contributor Ecosystem**: Real-time "Top Contributors" shelf highlighting community leaders.
- **Request Tracker**: Dedicated dashboard section to track the status of your content requests in real-time.
- **PWA Experience**: Fully installable as a mobile or desktop app with **Offline Notifications**.
- **Cross-Device Sync**: Notifications read status and user preferences sync instantly between mobile and desktop using a **Fault-Tolerant AuthContext Sync** pattern.
- **Announcements**: Dynamic banner system with **High-Fidelity Detail Routes** (`/announcements/:id`) and mobile-optimized card designs.

### 🛡️ Hardened Security & Stability
- **Multi-Tier Rate Limiting**: Specialized shields for Global API (100req/15m), Authentication (10req/15m), and AI Services (20req/15m).
- **Database Watchdog**: Real-time Mongoose connection monitoring with auto-recovery and promise-based locking to prevent startup race conditions.
- **Surgical AI Scrub**: Programmatic filtering of technical jargon, JSON leaks, and internal IDs from AI responses.
- **JWT & Cookie Security**: Secure persistent sessions with cross-origin protection.

---

## 🛠️ Technology Stack

| **Ecosystem** | React (Vite), Framer Motion, Bootstrap 5, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express, MongoDB, Google Drive API v3 |
| **AI Brain** | Groq SDK (Llama 3.3 - 70b model) |
| **Social Gear** | Firebase Cloud Messaging (FCM), Cross-Device State Sync |
| **Storage** | Google Drive API(Files), Cloudinary (Media/Profiles) |
| **Security** | AI interaction logging, JWT, BcryptJS, Express Rate Limit |
| **DevOps** | Vite-Plugin-PWA, Dotenv, CORS, **HMR-Optimized Context Architecture** |

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
   npm install # Install base dependencies
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
└── README.md
```

---

*Built with ❤️ for the student community by Jainish.*

*Last Updated: April 14, 2026 (Sync & Animation Overhaul)*

