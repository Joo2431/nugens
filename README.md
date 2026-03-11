# NuGens — Complete Career Ecosystem

> One account. Four platforms. Your complete professional lifecycle.

## 🗂 Project Structure

```
/NuGens
├── backend/                    # Node.js + Express API (deploy to Render)
│   ├── config/
│   │   └── database.js         # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   └── schema.sql          # Complete PostgreSQL schema
│   ├── routes/
│   │   ├── auth.js             # Register, login, refresh
│   │   ├── users.js            # Profile management
│   │   ├── subscriptions.js    # Plan management
│   │   ├── genE.js             # Resume, jobs, skill gap
│   │   ├── hyperX.js           # Courses, video upload (R2)
│   │   ├── digiHub.js          # Marketing tools, community
│   │   ├── units.js            # Bookings, production
│   │   └── ai.js               # Gen-E Mini per product
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Main entry point
│
├── frontend/                   # Static HTML/CSS/JS (deploy to Cloudflare Pages)
│   └── public/
│       ├── index.html          # Landing page
│       ├── register.html       # 4-step onboarding
│       ├── dashboard.html      # Unified CRM dashboard
│       ├── gen-e/
│       │   └── index.html      # Gen-E platform
│       ├── hyperx/
│       │   └── index.html      # HyperX platform
│       ├── digihub/
│       │   └── index.html      # DigiHub platform
│       ├── units/
│       │   └── index.html      # Units platform
│       └── _routes.json        # Cloudflare routing config
│
└── docs/
    ├── apiDocs/                # API documentation
    └── userFlow/               # User flow diagrams
```

---

## 🚀 Deployment Guide

### 1. Database — Render PostgreSQL

1. Create a new **PostgreSQL** database on [Render](https://render.com)
2. Copy the `DATABASE_URL` connection string
3. Run the schema: `psql $DATABASE_URL < backend/models/schema.sql`

### 2. Backend — Render Web Service

1. Push your code to GitHub
2. Create a new **Web Service** on Render
3. Connect your GitHub repo
4. Set root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add all environment variables from `.env.example`

**Your API will be at:** `https://nugens-api.onrender.com`

### 3. Video Storage — Cloudflare R2

For HyperX video hosting:

1. Go to Cloudflare Dashboard → R2
2. Create bucket: `nugens-hyperx-videos`
3. Create API token with R2 read+write permissions
4. Set a custom domain (e.g. `pub.nugens.com`) for public access
5. Add R2 credentials to backend `.env`

### 4. Frontend — Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Set root directory: `frontend/public`
4. Build command: (leave blank — static files)
5. Output directory: `.`
6. Your site will deploy to your custom domain

### 5. Connect Domain

In Cloudflare DNS:
- `nugens.com` → Cloudflare Pages
- `api.nugens.com` → Render backend (CNAME to your render URL)
- `pub.nugens.com` → R2 bucket public domain

---

## 🏗 Platform Overview

| Platform | Purpose | Key Features |
|----------|---------|--------------|
| **Gen-E** | AI Career Intelligence | Resume builder, ATS scorer, job matching, skill gap AI |
| **HyperX** | Experience-Based Learning | Video courses, certifications, R2 video storage |
| **DigiHub** | Marketing & Community | AI tools, job board, community, talent marketplace |
| **Units** | Visual Production | Photography/video booking, editing services |

---

## 🤖 Gen-E Mini (AI Assistants)

Each platform has a scoped AI assistant that only answers platform-specific questions:

- **NuGens AI** — Full ecosystem navigation
- **Gen-E Mini** — Career, resume, job search only
- **HyperX Mini** — Courses and learning paths only
- **DigiHub Mini** — Marketing and community only
- **Units Mini** — Production and bookings only

AI conversations are stored per user per product in `ai_conversations` table.

---

## 📦 Backend API Endpoints

```
POST /api/auth/register       Register new user (4-step flow)
POST /api/auth/login          Login
POST /api/auth/refresh        Refresh JWT token

GET  /api/users/me            Get current user + subscriptions
PATCH /api/users/me           Update profile

GET  /api/subscriptions       List user subscriptions
POST /api/subscriptions       Add product subscription

GET  /api/hyperx/courses      List all courses
GET  /api/hyperx/courses/:id  Course detail + lessons
POST /api/hyperx/courses/:id/enroll
POST /api/hyperx/upload/presign    Get R2 upload URL
POST /api/hyperx/upload/confirm    Register uploaded video
GET  /api/hyperx/lessons/:id/stream  Get signed stream URL
PATCH /api/hyperx/lessons/:id/progress

POST /api/ai/chat             Chat with product-specific AI
GET  /api/ai/history/:productId

GET  /health                  Health check
```

---

## 🔑 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML/CSS/JS, hosted on Cloudflare Pages |
| Backend | Node.js + Express, hosted on Render |
| Database | PostgreSQL (Render managed) |
| Video Storage | Cloudflare R2 |
| AI | Anthropic Claude API |
| Auth | JWT (bcryptjs) |
| Payments | Stripe |

---

## 🎨 Brand Colors

| Product | Color |
|---------|-------|
| NuGens | `#00e5ff` (Cyan) |
| Gen-E | `#00e5ff` (Cyan) |
| HyperX | `#f0b429` (Amber) |
| DigiHub | `#a78bfa` (Purple) |
| Units | `#f472b6` (Pink) |
