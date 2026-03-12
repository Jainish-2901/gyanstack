# GyanStack — College Content Management & Analytics (MERN)

Small, maintainable MERN app to manage and consume academic resources (Notes, PYQs, Assignments) with admin productivity features and real-time analytics.

Badges
- Build / CI: TODO
- License: Add your preferred license (e.g., MIT)

Quick links
- Frontend: /frontend
- Backend: /backend

Key features
- Responsive admin dashboards (tables → vertical cards on mobile)
- Batch uploads (up to 20 files) stored on Cloudinary
- Cascading category filters on Browse page
- Role-based redirects after login (Student → /dashboard, Admin → /admin-panel, SuperAdmin → /super-admin-panel)
- Real-time analytics (Views, Likes, Saves, Downloads) with time filters (Week / Month / Year / All)
- Engagement tracking (Likes, Bookmarks, Downloads)
- FCM push notifications for approved announcements
- Dark mode, notification bell with unread counts, persistent footer & branding

Tech stack
- Frontend: React (Hooks, Context API), React Router, Vite
- Styling: Bootstrap 5.3 + custom CSS
- Charts: Chart.js, react-chartjs-2
- Backend: Node.js, Express
- Database: MongoDB / Mongoose
- Storage: Cloudinary
- Messaging: Firebase Cloud Messaging (FCM)

Prerequisites
- Node.js (LTS) & npm or pnpm
- MongoDB (local or Atlas)
- Cloudinary account
- Firebase project with Cloud Messaging enabled

Environment variables

Backend (backend/.env)
```env
MONGO_URI="YOUR_MONGO_CONNECTION_STRING"
JWT_SECRET="A_STRONG_SECRET_KEY"

CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"

FCM_SERVER_KEY="YOUR_FIREBASE_SERVER_KEY_FROM_CLOUD_MESSAGING"
PORT=5000
```

Frontend (frontend/.env) — Vite variables
```env
VITE_API_URL="http://localhost:5000/api"

VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"

VITE_VAPID_PUBLIC_KEY="YOUR_VAPID_PUBLIC_KEY_FROM_FIREBASE_CONSOLE"
```

Install & run (Windows)
1. Install dependencies
- Backend:
    cd backend
    npm install
- Frontend:
    cd ..\frontend
    npm install

2. Start servers (options)
- Start backend:
    cd backend
    npm run start
- Start frontend (Vite):
    cd ..\frontend
    npm run dev
- Start both from repo root (if you add a root script using concurrently / npm-workspaces):
    cd d:\web-apps\gyanstack-mern
    npm run start:all

Default URLs
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:5173

Project layout (high level)
- /backend — Express server, routes, controllers, models
- /frontend — React app (Vite)
- /docs — optional documentation / diagrams
- /scripts — helper scripts (db seeding, migrations)

Tips & troubleshooting
- Cloudinary: ensure credentials in backend/.env and that upload presets allow unsigned uploads if used.
- Firebase/FCM: backend needs server key; frontend needs VAPID public key. Test notifications with a real device or the Firebase console.
- MongoDB: if using Atlas, whitelist your IP or use 0.0.0.0/0 while testing (not recommended for production).

Contributing
- Create issues / PRs. Keep changes modular and include tests where applicable.
- Add clear commit messages and update this README when adding new features or environment variables.

License
- Add your preferred license (e.g., MIT) and include a LICENSE file in the repo.

If you'd like, I can:
- Add badges and a LICENSE file,
- Add a root package.json script to run frontend + backend concurrently,
- Include a sample .env.example for both frontend and backend.

Tell me which of the above to apply.