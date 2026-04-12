# 🎓 GyanStack — Student Portal (Client)

The GyanStack Student Portal is a premium academic resource discovery platform built for the modern student. It provides a sleek, glassmorphism-inspired interface for browsing notes, PYQs, and assignments with real-time analytics and intelligent navigation.

## 🌟 Key Features

### 💎 Premium User Experience
- **Glassmorphism Design**: A high-fidelity UI featuring translucent panels, blurred backgrounds, and sleek shadows.
- **Smart Notifications**: Integrated `react-hot-toast` for real-time, non-blocking feedback during Likes, Saves, and Downloads.
- **Adaptive Typography**: Intelligent text handling that supports single-line headers on desktop and natural word-wrapping on mobile.

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
- **Styling**: Bootstrap 5 + Custom Modern CSS
- **State Management**: TanStack Query (React Query)
- **Interactions**: React Hot Toast, Bootstrap Icons
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
*Last Updated: April 12, 2026 (Premium Interaction Update)*