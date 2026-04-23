# GyanStack Frontend Ecosystem Guide

This document outlines the workflows, architectures, and design patterns of the three core frontend components in the GyanStack ecosystem: the **Client Application**, the **Admin Dashboard**, and the **SuperAdmin Panel**.

---

## 📱 1. Client Application (User Workflow)
The client frontend is optimized for seamless content discovery and a "premium" mobile-first experience.

### Key Workflows:
- **Browse & Explore**: Users navigate through a recursive folder structure (Categories → Subcategories → Resources).
- **Dynamic Sorting**: Browse results can be sorted by "Recently Added", "Most Visited", "Likes", etc.
- **Resource Intelligence**: The detail view shows enriched metadata — real-time file sizes from Google Drive and visual profiles (color palettes) from Cloudinary.
- **Personalized Library**: Integrated "Like" and "Save" systems letting users build their own curated study list.
- **Announcement Detail View**: Dedicated routes (`/announcements/:id`) for full-screen update reading. Opens are tracked server-side via `POST /:id/track-open` (`openCount`).
- **Mark-All-Read Sync**: Visiting `/announcements` auto-calls `PUT /mark-all-read`, persisting `lastSeenAnnId` in the user profile for cross-device badge sync.
- **Push Notifications**: Custom `notification_ping.mp3` plays on incoming FCM notifications. Tap navigates to the announcement's `redirectLink` (or detail page fallback).
- **Uploader Profiles**: Each content card links to the contributor's profile at `/uploader/:id` showing all their uploaded resources.

### 🤖 GyanStack AI — Study Buddy
The AI chatbot is the primary super-feature of the client. Key capabilities:

| Capability | How to use |
|---|---|
| **Find document** | "find Ohm's Law notes" or "search Cell Biology PDF" |
| **Make notes** | "make notes on Thermodynamics" |
| **Practice questions** | "generate practice questions for Integration" |
| **Find uploader** | "who uploaded Data Structures notes?" |
| **Request content** | "request notes on Operating Systems" |
| **Navigate** | "open browse", "go to dashboard", "open my saved" |

### Technical Benefits:
- **TanStack Query Caching**: Ultra-fast navigation with smart data refetching.
- **Lazy Loading**: Code-splitting ensures heavy components only load when needed.
- **PWA Installation**: Downloadable as a lightweight app for instant home-screen access.
- **Premium Notifications**: All user feedback via **glassmorphism toast notifications** (`react-hot-toast`).
- **Auto-Focus Navigation**: Breadcrumb bar automatically scrolls and centers the active folder.
- **Type-Aware Google Drive Previews**: DOCX/PPTX/XLSX open in their native Google viewer instead of showing a lock screen.

---

## 🛠️ 2. Admin Dashboard (Content Management)
A high-efficiency workspace for uploaders and content moderators.

### Key Workflows:
- **Batch Uploading**: Upload up to 10 files simultaneously with automated Google Drive placement and MERN database syncing.
- **Recursive Content Control**: Manage materials within nested semesters and subjects, with the backend automatically creating corresponding Google Drive folders.
- **Live Syncing**: Updates to content titles or categories are automatically synced to the physical files on Google Drive.
- **Announcement Drafting**: Submit new announcements via `POST /request`. Includes optional `redirectLink` field. SuperAdmins auto-approve and broadcast immediately.

### Technical Benefits:
- **Optimized Media Pipeline**: Automatic image compression (Sharp) and video transcoding (FFmpeg) during upload.
- **Analytics at a Glance**: Real-time tracking of most downloaded and viewed materials.
- **Mobile-First Card Layout**: Content management uses responsive card-based layout on mobile, table on desktop, with bulk-select and type-badge filtering.

---

## 👑 3. SuperAdmin Panel (Governance)
The command center for system-wide control and community oversight.

### Key Workflows:
- **User Governance**: Promotion and demotion of users to/from Admin/Uploader status.
- **Global Content Manager**: A unified view to bulk-reassign or bulk-delete content across the platform.
- **Announcement Pipeline**: Full lifecycle — Admins submit drafts (`POST /request`), SuperAdmins approve/reject (`PUT /:id/status`), system auto-broadcasts FCM push on approval. Each announcement supports a `redirectLink` so the notification tap can navigate to any URL.
- **Announcement Analytics**: The `ManageAnnouncements` page displays `sentCount` (push receipts) and `openCount` (detail page opens) per announcement for engagement insights.
- **Role-Based Edit/Delete**: SuperAdmins can edit or delete any announcement at any status. Admins can only edit their own `pending` drafts and delete their own submissions.
- **My Announcements View**: Admins see a personal `MyAnnouncements` page listing only their own submitted requests and their approval status.

---

## 🎨 Design Philosophy
Every component in the GyanStack ecosystem follows a **Glassmorphic / Modern Minimalist** design system.
- **Responsive-First**: Every button, dropdown, and card is optimized for mobile. Folders use a smart **2×2 grid** on mobile.
- **Rich Aesthetics**: High-quality iconography (Bootstrap Icons), modern typography (Plus Jakarta Sans), and sleek glassmorphism panels.
- **Accessible UI**: High contrast modes, single-line laptop headers, and natural-wrap mobile titles.

## 🎞️ Fluid Motion System
GyanStack uses **Framer Motion** for a "living" interface:
- **AnimatePresence Routing**: Unique `location` keys ensure pages mount/unmount cleanly.
- **Spring Physics**: Buttons and cards use spring-based transitions for a natural tactile feel.
- **Scroll Reveals**: Legal sections and cards fade in as the user scrolls.

## ⚡ HMR Compatible Architecture
- **Context/Hook Separation**: Context objects and Provider logic are decoupled from consuming hooks to prevent HMR invalidation.
- **Strict Export Rules**: Files export either purely React components or purely hooks/logic for **Fast Refresh** reliability.
- **Fault-Tolerant State Sync**: `AuthContext` supports explicit `user` updates from children without full page reloads.

---

## 🖼️ OG Banner & Social Sharing
The `og-banner.png` (1200×630) is generated via **Sharp** (Node.js image compositing):
- Background: SVG-rendered dark teal glassmorphism with dot grid, mesh lines, and aurora blooms
- Logo: Real `logo.png` composited at full fidelity
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

*Last Updated: April 16, 2026 — GyanStack AI Study Buddy capabilities, type-aware Google Drive previews, uploader profiles.*

*April 23, 2026 — Announcement system overhaul: role-based CRUD pipeline, sentCount/openCount analytics, redirectLink per announcement, custom notification_ping.mp3 sound, mark-all-read cross-device sync, mobile-first Admin UI upgrade.*
