# 🎓 GyanStack — Student Portal (Client)

The GyanStack Student Portal is a premium academic resource discovery platform built for the modern student. It provides a sleek, glassmorphism-inspired interface for browsing notes, PYQs, and assignments — plus a powerful **AI Study Buddy** for intelligent academic assistance.

## 🌟 Key Features

### 🤖 GyanStack AI — Study Buddy
The AI assistant is the centrepiece of the student experience:
- **🔍 Exact & Fuzzy Search**: Find any document by name — exact matches navigate instantly; partial matches show up to 5 clickable suggestions.
- **📝 Notes Generator**: "Make notes on [topic]" — generates structured study notes from available library content.
- **❓ Practice Questions**: "Generate practice questions for [topic]" — returns MCQ/short answer questions.
- **👤 Uploader Lookup**: "Who uploaded [content]?" — returns the contributor's name with a profile link.
- **📬 Content Requests**: "Request notes on [topic]" — actually saves a request to the admin database with a tracking link.
- **⚡ Quick-Action Chips**: One-click starters for all major capabilities.
- **📋 Copy & Clear**: Copy any AI message, or reset the chat with one click.

### 💎 Premium User Experience
- **Glassmorphism Design**: High-fidelity UI featuring translucent panels and blurred backgrounds.
- **Fluid Transitions**: Smooth page entries and scroll-triggered reveals powered by **Framer Motion**.
- **Smart Notifications**: `react-hot-toast` with Fault-Tolerant Cross-Device Sync.
- **📣 Announcement Detail**: Dedicated routes (`/announcements/:id`) for full-screen update reading. Opens are tracked server-side (`openCount`) on every visit.
- **✅ Mark-All-Read Sync**: The Announcements list page automatically calls `PUT /mark-all-read`, persisting `lastSeenAnnId` in your profile so the notification badge resets on every device.
- **🔔 Push Notification Sound**: Custom `notification_ping.mp3` plays on incoming FCM alerts. Tapping navigates directly to the announcement's `redirectLink` or the detail page.
- **Back-To-Top**: A floating glassmorphic button for instant home-view access.
- **🔗 Smart Social Sharing**: `react-helmet-async` dynamically sets `og:image` and `og:title` per route.

### 🧭 Intelligent Navigation
- **2×2 Mobile Grid**: Optimized folder display for mobile devices.
- **Breadcrumb Auto-Scroll**: Deep navigation paths automatically center themselves.
- **Smart Breadcrumbs**: Clickable navigation badges for instant deep-linking.
- **Uploader Profiles**: Every piece of content links to the contributor's profile at `/uploader/:id`.

### 📊 Resource Intelligence
- **Real-time Folder Stats**: Folders display sub-folder and item counts before you enter them.
- **Enriched Previews**: Real-time file metadata (Size, Type, Created Date) from the Google Drive API.
- **🗂️ Type-Aware Drive Previews**: DOCX opens in Google Docs viewer, PPTX in Slides viewer, XLSX in Sheets viewer — no more lock screens.
- **Dynamic Sorting**: Find materials by popularity, recency, or alphabetical order.

## 🛠️ Tech Stack
- **Framework**: React 19 (Vite)
- **Animations**: Framer Motion
- **Styling**: Bootstrap 5 + Custom Modern CSS
- **State Management**: TanStack Query
- **AI**: Groq SDK — `meta-llama/llama-4-scout-17b-16e-instruct`
- **Interactions**: React Hot Toast, Bootstrap Icons, FCM Push Notifications
- **SEO / Social**: `react-helmet-async` (Dynamic OG & Twitter Card meta per route)
- **Architecture**: HMR-Optimized Context Patterns for maximum dev speed
- **Storage Connectivity**: Google Drive API v3, Cloudinary
- **OG Banner**: Generated via **Sharp** — `node scripts/generate-og-banner.mjs`

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
*Built with ❤️ for the student community by Jainish.*

*Last Updated: April 16, 2026 — GyanStack AI Study Buddy (notes, questions, search, uploader lookup, real requests), Llama 4 Scout model, type-aware Google Drive previews.*

*April 23, 2026 — Announcement system: openCount tracking, mark-all-read cross-device sync, custom push notification sound (notification_ping.mp3), redirectLink-aware notification taps.*