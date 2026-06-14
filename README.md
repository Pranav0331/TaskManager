# TaskFlow

A production-ready SaaS-style task management application built with the **Nimbus UI** design system. Inspired by Linear, Notion, Jira, and the Vercel Dashboard.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## Features

- **Authentication** — Register, login, logout with JWT & bcrypt password hashing
- **Dashboard** — Analytics cards with total, completed, pending tasks & completion %
- **Task Management** — Full CRUD with title, description, status, priority, due date
- **Advanced Filtering** — Search, filter by status/priority, sort by due date
- **Premium UI** — Dark mode, toast notifications, skeleton loaders, empty states
- **Animations** — Smooth Framer Motion micro-interactions throughout
- **Responsive** — Mobile-first layout with collapsible sidebar

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend  | Node.js, Express.js                 |
| Database | MongoDB Atlas                       |
| Auth     | JWT, bcryptjs                       |
| HTTP     | Axios, React Router DOM             |

## Project Structure

```
TaskManager/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas (User, Task)
│   ├── routes/          # API route definitions
│   ├── utils/           # JWT token generation
│   └── server.js        # Express app entry point
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route pages
│       ├── layouts/     # Dashboard layout
│       ├── hooks/       # Custom React hooks
│       ├── context/     # Auth & Theme providers
│       ├── services/    # API service layer
│       ├── utils/       # Constants & helpers
│       └── routes/      # Route configuration
├── API_DOCUMENTATION.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist your IP address (or `0.0.0.0/0` for development)
4. Copy the connection string to `MONGODB_URI` in `.env`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

### Backend — Render

1. Push your code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repository and set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables:
   ```
   MONGODB_URI=<your-atlas-connection-string>
   JWT_SECRET=<strong-random-secret>
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
5. Deploy and note your Render URL (e.g., `https://taskflow-api.onrender.com`)

### Frontend — Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://taskflow-api.onrender.com/api
   ```
5. Deploy

### Post-Deployment Checklist

- [ ] Update `CLIENT_URL` on Render to match your Vercel URL
- [ ] Verify MongoDB Atlas allows connections from Render's IP
- [ ] Test registration, login, and CRUD operations
- [ ] Confirm CORS is working between frontend and backend

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference.

## Design System — Nimbus UI

Nimbus UI is the custom design system powering TaskFlow:

- **Colors:** Slate-based neutrals with indigo brand accents
- **Typography:** Inter font family
- **Components:** Cards, badges, modals, skeleton loaders
- **Patterns:** Sidebar navigation, analytics cards, data tables
- **Motion:** Framer Motion page transitions and micro-interactions

## License

MIT
