# 🎓 GyanStack — Student Portal (Client)

The GyanStack Student Portal is a premium academic resource discovery platform built for the modern student. It provides a sleek, glassmorphism-inspired interface for browsing notes, PYQs, and assignments with real-time analytics and intelligent navigation.

## 🌟 Key Features

### 💎 Premium User Experience
- **Glassmorphism Design**: A high-fidelity UI featuring translucent panels and blurred backgrounds.
- **Fluid Transitions**: Smooth page entries and scroll-triggered reveals powered by **Framer Motion**.
- **Smart Notifications**: Integrated `react-hot-toast` with **Fault-Tolerant Cross-Device Sync**.
- **Announcement Detail**: Dedicated high-fidelity routes (`/announcements/:id`) for full-screen update reading.
- **Back-To-Top**: A floating glassmorphic button for instant home-view access.

### 🧭 Intelligent Navigation
- **2x2 Mobile Grid**: Optimized folder display for mobile devices to maximize vertical space.
- **Breadcrumb Auto-Scroll**: Deep navigation paths automatically center themselves to keep your current location in focus.
- **Smart Breadcrumbs**: Clickable navigation badges for instant deep-linking through the academic hierarchy.

### 📊 Resource Intelligence
- **Real-time Folder Stats**: Folders display exactly how many sub-folders and items they contain before you enter them.
- **Enriched Previews**: Real-time file metadata (Size, Type, Created Date) pulled directly from the Google Drive API.
- **Dynamic Sorting**: Effortlessly find materials by popularity, recency, or alphabetical order.

## 🛠️ Tech Stack
- **Framework**: React 19 (Vite)
- **Animations**: Framer Motion
- **Styling**: Bootstrap 5 + Custom Modern CSS
- **State Management**: TanStack Query
- **Interactions**: React Hot Toast, Bootstrap Icons, **FCM Push Notifications**
- **Architecture**: **HMR-Optimized Context Patterns** for maximum dev-speed.
- **Storage Connectivity**: Google Drive API v3

## 🚀 Getting Started

### 1. Environment Variables (`client/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_VAPID_PUBLIC_KEY="..."
```

### 2. Installation
```bash
cd client
npm install
npm run dev
```

---
*Last Updated: April 14, 2026 (Fluid Navigation Update)*