# 🚀 GyanStack: The Ultimate College Resource Hub

GyanStack is a premium, high-performance **MERN Stack** platform designed specifically for college students (BCA/MCA) to share, manage, and discover academic resources like Notes, Assignments, and Previous Year Question Papers (PYQs). 

Built with a focus on modern aesthetics (Glassmorphism), speed, and offline capability (PWA), it serves as a centralized community-driven library.

---

## ✨ Key Features

### 🤖 Smart AI Assistant
- **Study Buddy**: Integrated AI assistant powered by **Google Gemini** for instant academic guidance.
- **Context Aware**: Specialized knowledge about GyanStack's categories, notes, and study paths.
- **Resource Finder**: Help students find specific documents and topics through natural conversation.
- **Study Tips**: Get personalized suggestions on exam preparation and resource discovery.

### 📚 Resource Management
- **Categorized Library**: Multi-level category tree for organized navigation.
- **Multi-Format Support**: Handle PDF notes, Video links, Text notes, and Image assignments.
- **Smart Search**: Advanced search functionality with support for tags and **Uploader Mentions** (e.g., search `React @jainish`).
- **Batch Uploads**: Seamless integration with **Google Drive API** for large-scale file management.

### 👤 User & Social Features
- **Contributor Shelf**: Dedicated homepage section for Top Contributors based on upload counts.
- **Personal Dashboard**: Track your uploads, saved items, and account settings.
- **Request System**: Request specific content from the community through dedicated forms.
- **Uploader Profiles**: Detailed profiles showing all content shared by a specific user.

### 🛡️ Admin & Security
- **Role-Based Access**: Specialized views for Students, Admins, and Superadmins.
- **Content Moderation**: Approve, reject, or delete community-submitted resources.
- **JWT & Cookie Security**: Robust authentication system with secure persistent sessions.
- **Cloud Analytics**: Real-time stats on views, users, and content growth.

### 🍏 Modern UX/UI
- **Progressive Web App (PWA)**: Fully installable on Mobile and Desktop with **Offline Support**.
- **Dark Mode / Light Mode**: Seamless theme switching with persistent preferences.
- **Premium Design**: Clean, glassmorphic UI built with Vanilla CSS and Bootstrap 5.
- **Real-time Notifications**: Announcement system to keep users updated on new features or materials.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Bootstrap 5, Axios, React Router DOM |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **Storage** | Google Drive API, Cloudinary (for Media/Profiles) |
| **PWA** | Vite-Plugin-PWA |
| **AI Integration** | Google Gemini AI (`@google/generative-ai`) |
| **Security** | JWT, BcryptJS, Express Validator |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local)
- Google Cloud Service Account (for Drive integration)
- Cloudinary Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jainish-2901/gyanstack.git
   cd gyanstack-mern
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   GOOGLE_DRIVE_CLIENT_EMAIL=...
   GOOGLE_DRIVE_PRIVATE_KEY=...
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup (Client & Admin)**
   ```bash
   # In a new terminal for Client
   cd client
   npm install
   npm run dev

   # In a new terminal for Admin
   cd admin
   npm install
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── admin/          # Admin/Superadmin React dashboard (Vite)
├── backend/         # Express API & MongoDB Models
│   ├── controllers/ # Logic for Auth, Content, Categories
│   ├── models/      # Mongoose Schemas
│   ├── routes/      # API Endpoints
│   └── utils/       # Google Drive & File helpers
├── client/          # Student-facing React Application (Vite/PWA)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   └── pages/     # Public/Private routes
└── README.md
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built with ❤️ for the student community.*
