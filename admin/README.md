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
- **Announcement Pipeline**: Broadcast critical updates via Firebase Cloud Messaging (FCM).
- **Professional UI Transitions**: Integrated **Framer Motion** for high-fidelity page entries.
- **Manual Verification**: Review and approve community-submitted resources before they go live.

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