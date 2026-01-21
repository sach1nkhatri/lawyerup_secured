# ⚖️ LawyerUp AI – Legal Assistant Platform for Nepal
> Complete civic-tech stack with AI chatbot, lawyer booking, and full admin control.

---

## 🧭 Overview

**LawyerUp AI** is a fullstack platform designed to bring legal access to Nepali citizens.  
It offers lawyer consultations, legal content, AI-based assistance, and secure multi-role access across users and admins — all built with scalable architecture and attention to real-world usability.

---

## 🧰 Technologies Used

### Frontend (Client)
- React + React Router
- Axios
- CSS Modules
- Toastify / SweetAlert2
- Socket.IO (Chat Client)
- Responsive Design with custom loaders

### Backend (API)
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO (Realtime Chat)
- PDF Upload & Access (RAG-ready)
- RESTful routing structure

### Admin Portal
- React + TypeScript
- Modular Dashboard Cards
- Analytics (Revenue/User Plan Breakdown)
- Lawyer Approval Management
- News Publishing & FAQ Editor
- PDF Uploader and Viewer
- Modal system and protected routes

---

## 💬 Features

### ✅ User Features
- 🔐 JWT-based Login & Signup
- 🧠 AI Chatbot trained on Nepali laws (Free/Paid tier limits)
- 📰 Legal News Feed + Like/Dislike/Comment
- 📄 PDF Library Viewer (RAG integration planned)
- 👨‍⚖️ Lawyer Directory + Appointment Booking
- 💬 Booking-based Real-time Chat with Lawyers (Socket.IO)
- 🎨 Settings Page: Dark Mode, Profile Edit, Plan View
- 🎯 Personalized recommendations via profile completeness

### ✅ Admin Features
- 📊 Dashboard with Plan Distribution & Revenue Insights
- 📰 Publish/Edit/Delete News Articles
- ✅ Approve & Manage Registered Lawyers
- 📥 Upload & Manage PDF Legal Resources
- ❓ FAQ Content Manager
- 🚨 View and Respond to User Reports

---

## 💡 System Design Insights

- Feature-based file structuring (clean architecture)
- Auth middleware + route protection across backend/admin
- Messages are scoped to Booking objects with room-based socket communication
- Plans handled visually and logically across settings + landing
- Settings persist theme, enable sweet alerts, and allow profile editing

---

## 🚀 Deployment

```bash
# Frontend
npm run build  # then deploy via Netlify/Vercel

# Backend
node server.js or pm2 start server.js  # deployed via Railway/Render/VPS

# Admin
npm run build  # or integrate as subdomain
```

---

## 📌 Status

- ✅ Web: Complete & modular
- ✅ Admin: Fully functional & styled
- 🔧 RAG AI (PDF search): Ready for integration
- 📱 Flutter Mobile App: Work in progress

---

## 📜 License & Notice

**© 2025 Sachin Khatri**  
Built independently as a civic-tech initiative.  
Reuse or commercial redistribution is **strictly prohibited** without permission.

---

🧠 *Built with real-world design logic, clean architecture, and the drive to build useful tech.*  
🧱 One dev. Multiple layers. Real functionality.
