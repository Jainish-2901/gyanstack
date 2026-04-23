# 🛡️ GyanStack — Admin & Moderator Panel

The GyanStack Admin Panel is the central governance hub for managing academic resources, overseeing community contributions, and maintaining platform security.

## 🌟 Key Features

### 📦 Content Lifecycle Management
- **Auto-Sync Uploads**: High-speed batch uploads (up to 20 files) that automatically create and sync folders on Google Drive.
- **Recursive Directory Control**: Full control over academic hierarchies (Semesters, Subjects, Units) with real-time backend verification.
- **Smart Metadata Editing**: Update titles and categories on the platform with automated physical file renaming on Google Drive.

### 🔍 System Health & Diagnostics
- **Drive Diagnostic Tool**: Built-in `verify_drive.js` script to instantly troubleshoot `invalid_grant` errors and connectivity issues.
- **Aggregated Analytics**: Real-time tracking of resource performance, user engagement, and download hotspots.
- **Credential Integrity**: Secure management of OAuth2 tokens and service accounts.

### 📬 Content Request Management
- **Request Tracker**: View all student content requests submitted via the AI Study Buddy or the Request Content page.
- **Status Updates**: Mark requests as `pending` or `fulfilled` directly from the admin panel.

### 👑 Governance & Security
- **Role-Based Access (RBAC)**: Fine-grained permissions for Admins, Moderators, and Super-Admins.
- **Professional UI Transitions**: Integrated **Framer Motion** for high-fidelity page entries.
- **Manual Verification**: Review and approve community-submitted resources before they go live.

### 📣 Announcement System (Overhauled — April 2026)
- **Draft & Request**: Admins compose announcements (`title`, `content`, optional `redirectLink`) and submit them as `pending` drafts.
- **Approve / Reject Pipeline**: SuperAdmins review all pending drafts and approve or reject via `PUT /:id/status`. Approval triggers an immediate FCM push broadcast to all subscribers.
- **Instant Broadcast**: SuperAdmins bypass the approval step — their announcements are auto-approved and broadcast in one action.
- **📊 Engagement Analytics**: `ManageAnnouncements` displays `sentCount` (push receipts) and `openCount` (detail-page opens) per announcement.
- **🔗 Redirect Links**: Each announcement supports a `redirectLink` field — push taps navigate directly to any internal route or external URL.
- **🔔 Custom Notification Sound**: `notification_ping.mp3` plays on push delivery across the platform.
- **Role-Based Edit / Delete**: SuperAdmins edit or delete any announcement at any status. Admins may only edit their own `pending` drafts and delete their own submissions.
- **My Announcements View**: Admins have a dedicated `MyAnnouncements` page listing their own requests and approval status.
- **Announcement Detail Page**: Full-detail view (`/announcements/:id`) with redirect link support and formatted content display.

## 🛠️ Tech Stack
- **Framework**: React 19 (Vite)
- **Animations**: Framer Motion
- **Styling**: Bootstrap 5 + Dynamic Admin CSS
- **Visualization**: Chart.js (Real-time Engagement Analytics)
- **Integration**: Google Googleapis (Drive v3), Cloudinary SDK
- **Backend Connectivity**: Express JWT-Guarded Endpoints

## 🚀 Getting Started

### 1. Backend Diagnostics
Before starting the admin panel, ensure your Google Drive connection is healthy:
```bash
cd backend
node scripts/verify_drive.js
```

### 2. Panel Installation
```bash
cd admin
npm install
npm run dev
```

---
*Built with ❤️ for the student community by Jainish.*

*Last Updated: April 16, 2026 — Content Request Management panel added; AI Study Buddy real request DB integration.*

*April 23, 2026 — Announcement System Overhaul: role-based draft/approve/reject pipeline, sentCount & openCount analytics, redirectLink per broadcast, custom notification_ping.mp3, My Announcements view, Announcement Detail page, mobile-first card layout upgrade across all admin pages.*