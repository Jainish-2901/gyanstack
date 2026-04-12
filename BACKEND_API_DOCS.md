# GyanStack Backend API Documentation

Welcome to the documentation for the GyanStack Backend API. This document provides a detailed overview of the system architecture, its request processing pipeline (including the new Aggregator Pattern), and a complete list of endpoints.

---

## 🏗️ System Architecture

The GyanStack Backend is a **Node.js/Express** application designed for the **MERN** stack. It is hosted on **Vercel** and connects to a **MongoDB Atlas** database via **Mongoose**.

### Key Technologies:
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Deployment**: Vercel (Serverless Functions)
- **Aggregator**: Custom parallel aggregator for multi-source data.
- **Cloud Media**: Google Drive (Primary files), Cloudinary (Visual assets).
- **Authentication**: JWT (JSON Web Tokens)
- **Rate Limiting**: `express-rate-limit`
- **Email/Notifications**: NodeMailer, FCM (Firebase Cloud Messaging)

---

## 🌊 Request Processing Pipeline

Every request follows a structured flow to ensure security and performance.

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

### 4. 🧠 Aggregator Pattern (NEW: April 2026)
For content detail requests, the backend utilizes a **Content Aggregator** that orchestrates parallel calls to:
- **MongoDB**: Primary metadata & relationship tracking.
- **Google Drive**: Real-time file system metadata (Actual size, Created date, Parent folder ID).
- **Cloudinary**: Rich media intelligence (Color palettes, OCR text detection).

*This pattern ensures a "Live" view of the resource that automatically updates if the file changes on Drive/Cloudinary.*

### 5. Controller Logic & Response
- **Error Handling**: Global standardized error responses with stack traces in development.

---

## 🚀 API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/stats` | Get public site statistics | Public |
| POST | `/login` | Login user (JWT) | Public |
| POST | `/google-login` | Google OAuth login | Public |
| GET | `/me` | Get current user profile | Auth |
| PUT | `/update-profile` | Update profile (incl. avatar) | Auth |

### 📁 Content & Categories (`/api/content`, `/api/categories`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/content` | **Browse Content**. Supports dynamic sorting. | Public |
| POST | `/api/content` | Batch upload content (Max 20/req). | Admin |
| GET | `/api/content/:id` | **Get Details**. Returns Enriched Aggregated Data. | Public |
| PUT | `/api/content/:id` | Update content / Replace file. | Admin |
| DELETE| `/api/content/:id` | Delete content & cleanup Drive folder. | Admin |
| DELETE| `/api/content/bulk` | Bulk Delete materials. | Admin |

#### 🔍 Sorting Parameters (for `GET /api/content`)
- `sortBy`: `date` (Default), `views`, `likes`, `saves`, `downloads`, `title`.
- `order`: `desc` (Default for counts), `asc` (Default for title/A-Z).

#### 📦 Aggregated Detail Response (for `GET /api/content/:id`)
Returned in `externalMetadata`:
- **googleDrive**: `size`, `createdTime`, `mimeType`, `webViewLink`.
- **cloudinary**: `colors` (palette), `ocr` (detected text).

#### 📁 Categories Data (for `GET /api/categories/nested`)
Returns a recursive structure where each category includes:
- `itemCount`: The total number of materials directly linked to this category.
- `children`: Array of sub-categories (recursive).

---

## 🛡️ Security Best Practices
1. **Rate Limiting**: Tiered limiting based on endpoint sensitivity.
2. **Environment Isolation**: Production secrets managed via Vercel env vars.
3. **Strict CORS**: Only trusted domains can communicate with the API.
4. **Data Sanitization**: Mongoose schemas and logic to prevent injection.

---
*Last Updated: April 12, 2026 (UI/UX Optimization Update)*
