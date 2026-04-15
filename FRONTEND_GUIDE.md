# GyanStack Frontend Ecosystem Guide

This document outlines the workflows, architectures, and benefits of the three core frontend components in the GyanStack ecosystem: the **Client Application**, the **Admin Dashboard**, and the **SuperAdmin Panel**.

---

## 📱 1. Client Application (User Workflow)
The client frontend is optimized for seamless content discovery and a "premium" mobile-first experience.

### Key Workflows:
- **Browse & Explore**: Users navigate through a recursive folder structure (Categories -> Subcategories -> Resources). 
- **Dynamic Sorting**: Browse results can be sorted by "Recently Added", "Most Visited", "Likes", etc., for highly personalized discovery.
- **Resource Intelligence**: The detail view provides enriched metadata, showing real-time file sizes from Google Drive and visual profiles (color palettes) from Cloudinary.
- **Personalized Library**: Integrated "Like" and "Save" systems allowing users to build their own curated study list.
- **Announcement Detail View**: Dedicated high-fidelity routes (`/announcements/:id`) for full-screen update reading with independent state tracking.

### Technical Benefits:
- **TanStack Query Caching**: Ultra-fast navigation with smart data refetching.
- **Lazy Loading**: Code-splitting ensures heavy components (like the AI assistant) only load when needed, keeping the initial paint lightning fast.
- **PWA Installation**: Provides the convenience of downloading the website as a lightweight application for instant home-screen access.
- **Premium Notifications**: All user feedback is handled via **glassmorphism toast notifications** (via `react-hot-toast`), offering a non-blocking, modern experience.
- **Auto-Focus Navigation**: The breadcrumb bar automatically scrolls and centers the active folder.
- **Back-To-Top Utility**: A floating, transparent glassmorphism button appears during deep scrolling for instant home access.
- **Semantic Legal Icons**: Terms and Privacy pages use contextually relevant iconography (shields, graduation caps, bugs) for improved scannability.
- **Dynamic Social OG Tags**: `react-helmet-async` updates `og:image`, `og:title`, and Twitter Card tags per route. The home page (`/`) uses the full `og-banner.png` (1200×630) for rich link previews; all inner pages (browse, content detail, etc.) switch to `logo.png` for a clean, branded square icon on WhatsApp, Telegram, iMessage, and Twitter.

---

## 🛠️ 2. Admin Dashboard (Content Management)
A high-efficiency workspace for uploaders and content moderators.

### Key Workflows:
- **Batch Uploading**: Upload up to 10 files simultaneously with automated Google Drive placement and MERN database syncing.
- **Recursive Content Control**: Admins can manage materials within nested semesters and subjects, with the backend automatically creating corresponding Google Drive folders.
- **Live Syncing**: Updates to content titles or categories on GyanStack are automatically synced to the physical files on Google Drive.

### Technical Benefits:
- **Optimized Media Pipeline**: Automatic image compression (Sharp) and video transcoding (FFmpeg) happen during upload to ensure content is web-ready.
- **Analytics at a Glance**: Real-time tracking of most downloaded and viewed materials.

---

## 👑 3. SuperAdmin Panel (Governance)
The command center for system-wide control and community oversight.

### Key Workflows:
- **User Governance**: Promotion and demotion of users to/from Admin/Uploader status.
- **Global Content Manager**: A unified view to bulk-reassign or bulk-delete content across the entire platform.
- **Announcement Pipeline**: A specialized workflow for creating, approving, and broadcasting push notifications to the user base using Firebase Cloud Messaging (FCM).

---

## 🎨 Design Philosophy
Every component in the GyanStack ecosystem follows a **Glassmorphic / Modern Minimalist** design system.
- **Responsive-First**: Every button, dropdown, and card is optimized for "perfect alignment" on mobile devices. Folders utilize a smart **2x2 grid** on mobile views.
- **Rich Aesthetics**: High-quality iconography (Bootstrap Icons), modern typography (Plus Jakarta Sans), and sleek glassmorphism panels.
- **Accessible UI**: High contrast modes, single-line laptop headers, and natural-wrap mobile titles.

## 🎞️ Fluid Motion System
GyanStack utilizes **Framer Motion** for a "living" interface:
- **AnimatePresence Routing**: Uses unique `location` keys to ensure pages mount/unmount cleanly without blank artifacting.
- **Spring Physics**: All buttons and cards utilize spring-based transitions for a natural, high-performance tactile feel.
- **Scroll Reveals**: Legal sections and cards fade in dynamically as the user scrolls, creating a premium storytelling effect.

## ⚡ HMR Compatible Architecture
To maximize development velocity, GyanStack utilizes a **Vite-Optimized Context Pattern**:
- **Context/Hook Separation**: Context objects and Provider logic are decoupled from the consuming hooks if necessary to prevent HMR invalidation.
- **Strict Export Rules**: Files either export purely React components or purely hooks/logic to ensure **Fast Refresh** reliability.
- **Fault-Tolerant State Sync**: The `AuthContext` supports explicit `user` updates from children components (e.g., NotificationBell), ensuring real-time UI synchronization without full page reloads.

---

## 🖼️ OG Banner & Social Sharing
The `og-banner.png` (1200×630) is generated via **Sharp** (Node.js image compositing):
- Background: SVG-rendered dark teal glassmorphism with dot grid, mesh lines, and aurora blooms
- Logo: Real `logo.png` composited at full fidelity (no AI replacement)
- Text: GyanStack · College Study Partner · feature pill badges (Notes, Assignments, PYQs, NEP 2020)
- Regenerate: `node client/scripts/generate-og-banner.mjs`

| Route | `og:image` served |
|---|---|
| `/` (Home) | `og-banner.png` (wide banner, 1200×630) |
| `/content/:id` | `logo.png` + content title |
| `/browse` | `logo.png` + category name |
| All other pages | `logo.png` (default) |

---

*Built with ❤️ for the student community by Jainish.*

*Last Updated: April 15, 2026 (Dynamic OG Social Sharing & SEOHead Component)*
