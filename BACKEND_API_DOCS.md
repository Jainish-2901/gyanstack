# GyanStack Backend API Documentation

Welcome to the documentation for the GyanStack Backend API. This document covers the system architecture, request processing pipeline, and a complete endpoint reference.

---

## 🏗️ System Architecture

The GyanStack Backend is a **Node.js/Express** application designed for the **MERN** stack. It connects to a **MongoDB Atlas** database via **Mongoose**.

### Key Technologies:
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Deployment**: Vercel (Serverless Functions)
- **Aggregator**: Custom parallel aggregator for multi-source data
- **Cloud Media**: Google Drive (Primary files), Cloudinary (Visual assets)
- **Authentication**: JWT (JSON Web Tokens)
- **Rate Limiting**: `express-rate-limit`
- **Email/Notifications**: NodeMailer, FCM (Firebase Cloud Messaging), Cross-Device Sync
- **AI Engine**: Groq SDK (`meta-llama/llama-4-scout-17b-16e-instruct`)

---

## 🌊 Request Processing Pipeline

### 1. Ingress & Traffic Management
- **Vercel Routing**: Gatekeeper for all incoming traffic.
- **CORS Handling**: `cors` middleware validates origins.
- **Body Parsing**: Standardized parsing (Limit: 50MB).

### 2. Connectivity & Layered Protection
- **DB Check**: Ensures MongoDB connectivity before logic execution.
- **Global Rate Limiter**: General abuse protection.
- **Auth/AI/Stats Shields**: Specialized rate limiters for sensitive endpoints.

### 3. Identity & Permissions
- **JWT Verification**: Validates the Bearer token.
- **Role Guards**: `adminMiddleware` and `superAdminMiddleware` enforce access control.

### 4. 🧠 Aggregator Pattern
For content detail requests, the backend uses a **Content Aggregator** that orchestrates parallel calls to:
- **MongoDB**: Primary metadata & relationship tracking.
- **Google Drive**: Real-time file metadata (size, created date, parent folder ID).
- **Cloudinary**: Rich media intelligence (color palettes, OCR text detection).

### 5. 🤖 AI Controller — Multi-Layer Intent Pipeline (April 2026)
The AI controller processes messages through a cascading intent system **before** calling Groq:

| Priority | Intent | Action |
|---|---|---|
| 1 | Exact title match | Navigate directly (no Groq call) |
| 2 | Find/search keywords | Fuzzy match (Dice coefficient) → top 5 suggestions |
| 3 | Uploader lookup | Search populated `uploadedBy` index → profile link |
| 4 | Content request | Save `Request` doc to DB, return tracking link |
| 5 | Notes/summary | Call Groq with content context → structured notes |
| 6 | Practice questions | Call Groq with content context → MCQ/short answer |
| 7 | General chat | Full Groq call with knowledge base |

### 6. 🔄 Cross-Device State Synchronization
- **Field**: `lastSeenAnnId` (stored in the User model).
- **Trigger**: Opening the notification bell on any device calls `PUT /mark-all-read`.
- **Propagation**: On next login, the frontend receives this ID, zeroing out the badge on all devices.

---

## 🚀 API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/stats` | Get public site statistics | Public |
| POST | `/login` | Login user (JWT) | Public |
| POST | `/google-login` | Google OAuth login | Public |
| GET | `/me` | Get current user profile | Auth |
| PUT | `/update-profile` | Update profile (incl. avatar, FCM Token) | Auth |
| PUT | `/sync-notification` | Update `lastReadAnnId` for sync | Auth |

### 🤖 AI Study Assistant (`/api/ai`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/chat` | Send message to Study Buddy AI. Multi-intent pipeline. | Public |
| GET | `/history/:sessionId` | Retrieve study conversation history | Auth |

**AI Chat Features** (via `/api/ai/chat`):
- `find [title]` — Exact or fuzzy search across all content titles
- `make notes on [topic]` — AI generates structured study notes
- `practice questions for [topic]` — AI generates MCQ/short-answer questions
- `who uploaded [content]` — Returns uploader info and profile link
- `request [topic]` — Saves a content request to MongoDB

### 📁 Content & Categories (`/api/content`, `/api/categories`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/content` | **Browse Content**. Supports dynamic sorting. | Public |
| POST | `/api/content` | Batch upload content (Max 20/req). | Admin |
| GET | `/api/content/:id` | **Get Details**. Returns Enriched Aggregated Data. | Public |
| PUT | `/api/content/:id` | Update content / Replace file. | Admin |
| DELETE | `/api/content/:id` | Delete content & cleanup Drive folder. | Admin |
| DELETE | `/api/content/bulk` | Bulk Delete materials. | Admin |

#### 🔍 Sorting Parameters (for `GET /api/content`)
- `sortBy`: `date` (Default), `views`, `likes`, `saves`, `downloads`, `title`.
- `order`: `desc` (Default for counts), `asc` (Default for title/A-Z).

#### 📦 Aggregated Detail Response (for `GET /api/content/:id`)
Returned in `externalMetadata`:
- **googleDrive**: `size`, `createdTime`, `mimeType`, `webViewLink`.
- **cloudinary**: `colors` (palette), `ocr` (detected text).

#### 🗂️ Google Drive Type-Aware Preview
The frontend uses `getDriveEmbedInfo()` to select the correct embed URL per MIME type:

| MIME Type | Embed URL Used |
|---|---|
| `wordprocessingml` (DOCX) | `docs.google.com/document/d/{id}/preview` |
| `spreadsheetml` (XLSX) | `docs.google.com/spreadsheets/d/{id}/preview` |
| `presentationml` (PPTX) | `docs.google.com/presentation/d/{id}/preview` |
| `pdf` | `drive.google.com/file/d/{id}/preview` |

#### 📁 Categories Data (for `GET /api/categories/nested`)
Returns a recursive structure where each category includes:
- `itemCount`: Total number of materials directly linked to this category.
- `children`: Array of sub-categories (recursive).

### 📢 Announcements (`/api/announcements`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get approved announcements (supports `limit`, `days`). | Public |
| PUT | `/mark-all-read` | Sync `lastSeenAnnId` (Requires `latestId`). Returns fresh profile. | Auth |
| POST | `/:id/track-open` | Increment interaction `openCount`. | Public |
| POST | `/` | Submit a new announcement request. | Admin |
| DELETE | `/:id` | Remove an announcement. | SuperAdmin |

### 📬 Content Requests (`/api/requests`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Submit a content request | Auth |
| GET | `/my` | Get current user's requests with status | Auth |

---

## 🛡️ Security Best Practices
1. **Rate Limiting**: Tiered limiting based on endpoint sensitivity.
2. **Environment Isolation**: Production secrets managed via Vercel env vars.
3. **Strict CORS**: Only trusted domains can communicate with the API.
4. **Data Sanitization**: Mongoose schemas and logic to prevent injection.
5. **AI Scrub**: Programmatic removal of leaked JSON, IDs, and raw paths from AI output.

---

*Built with ❤️ for the student community by Jainish.*

*Last Updated: April 16, 2026 — AI Study Buddy multi-intent pipeline, Llama 4 Scout model, type-aware Google Drive previews, real content request submission.*
