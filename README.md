# TaskFlow

> A modern full-stack task management and productivity platform designed for seamless personal workflow, scheduling, and note-taking.

![React](https://img.shields.io/badge/React-18-blue?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css) ![Vite](https://img.shields.io/badge/Vite-Bundler-purple?logo=vite) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Overview

**TaskFlow** is an all-in-one productivity SaaS application that unifies task management, dashboard analytics, interactive calendar scheduling, and scratchpad notes into a unified, responsive interface. Inspired by modern tools like Linear, Notion, and Vercel Dashboard, TaskFlow delivers an intuitive experience with sleek animations, comprehensive search, and robust security.

---

## Features

### 🔐 Authentication & Security
- **Secure Registration & Login**: User onboarding with email verification via OTP (One-Time Password).
- **JWT-Based Authentication**: Secure token-based session handling with automatic token validation and auth header injection.
- **Password Reset Flow**: End-to-end "Forgot Password" workflow generating single-use, time-limited, SHA-256 hashed reset tokens delivered via transactional email with anti-enumeration protection.
- **Protected Routes**: Client-side navigation guards and server-side middleware preventing unauthorized access.
- **Logout Behavior**: Complete session teardown redirecting users directly to the public Landing Page (`/`).

### 📊 Dashboard & Analytics
- **Summary Metrics**: High-level statistical cards tracking **Total Tasks**, **Completed Tasks**, **Pending Tasks**, and **Overdue Tasks** with completion rate percentages.
- **Today's Tasks**: Dedicated overview of urgent tasks due on the current day.
- **Interactive Mini Calendar**: Quick date selector and visual task load overview right from the dashboard.
- **Quick Notes Preview**: Access and review pinned and recent notes directly without leaving the dashboard.
- **Quick Actions**: One-click modal triggers to create new tasks and notes instantly.

### ✅ Task Management
- **Full CRUD Operations**: Create, view, update, and delete tasks with detailed titles, descriptions, due dates, priority levels, and statuses.
- **Status & Priority Tracking**: Categorize by status (*Pending*, *In Progress*, *Completed*) and priority (*Low*, *Medium*, *High*).
- **Overdue Indicators**: Visual alerts identifying overdue tasks in real time.
- **Search & Filtering**: Real-time keyword filtering, status tabs, and priority sorting.

### 📅 Calendar Planning
- **Full Month Grid**: Interactive monthly calendar with seamless month/year navigation.
- **Today Selection**: Quick jump to today's date.
- **Task Day Indicators**: Visual badges and dots indicating scheduled tasks on specific days.
- **Day Inspector**: Click any calendar day to inspect scheduled tasks or create a task with that date prefilled.

### 📝 Notes & Scratchpad
- **Rich Note Management**: Create, edit, and organize unstructured ideas and quick reminders.
- **Color Accents**: Assign customizable color tags (Slate, Blue, Green, Amber, Purple, Rose) for easy visual scanning.
- **Pin to Top**: Keep critical thoughts and top priorities pinned at the top of the notes list.
- **Search & Filter**: Instant search across titles and content, with color tag filters.
- **Safe Modal Editing**: Non-destructive editing modal with explicit save/close actions to prevent accidental loss of work.

### 🎨 Design & Experience
- **Light & Dark Themes**: Comprehensive theme support with a smooth, polished 400ms theme morphing transition.
- **Global Search (`Cmd+K` / `Ctrl+K`)**: Unified modal search across Tasks, Notes, and Calendar events from any page.
- **Bottom-Right Toast Notifications**: Non-intrusive feedback toasts for login, task updates, note saving, and password resets.
- **Responsive Layout**: Mobile-first design with a collapsible sidebar, clean navigation, and accessible mobile controls.

---

## Main Pages

| Route | Page | Description | Access |
|---|---|---|---|
| `/` | **Landing Page** | Public SaaS product showcase, feature highlights, and pricing overview | Public |
| `/login` | **Login** | Secure account login with "Forgot password?" shortcut | Public |
| `/register` | **Register** | Account creation initiating email OTP verification | Public |
| `/verify-otp` | **Verify OTP** | 4-digit email verification code confirmation | Public |
| `/forgot-password` | **Forgot Password** | Request password reset link via registered email | Public |
| `/reset-password` | **Reset Password** | Token validation and new password submission | Public |
| `/dashboard` | **Dashboard** | Analytics cards, Today's agenda, Mini Calendar, and Quick Notes | Protected |
| `/tasks` | **Tasks** | Comprehensive task list, filtering, search, and status controls | Protected |
| `/tasks/:id` | **Task Details** | Dedicated view for single task inspection and editing | Protected |
| `/calendar` | **Calendar** | Monthly calendar view with scheduled task markers | Protected |
| `/notes` | **Notes** | Color-coded scratchpad with search, pinning, and quick editing | Protected |
| `/settings` | **Settings** | User profile info, notification preferences, and account controls | Protected |

---

## Dashboard Overview

The TaskFlow dashboard provides a centralized workspace command center:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Stats: [ Total Tasks ] [ Completed ] [ Pending ] [ Overdue Tasks ]   │
├───────────────────────────────────┬────────────────────────────────────┤
│  Today's Tasks                    │  Mini Calendar                     │
│  - Task items with status toggles │  - Month view with date selection  │
│  - Due date & priority tags       │                                    │
├───────────────────────────────────┼────────────────────────────────────┤
│  Quick Notes                      │  Recent Activity & Actions         │
│  - Pinned and recent notes        │  - "+ New Task" / "+ New Note"     │
│  - Color accents & quick edit     │  - Real-time progress percentage   │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## Notes & Scratchpad

The Notes module functions as a lightweight, flexible scratchpad:
- **Instant Creation**: Capture quick thoughts, checklists, or snippets.
- **Color Tagging**: Organize notes with distinct palette accents.
- **Pinning**: Toggle pin status to keep important notes at the top.
- **Smart Search**: Search across both note titles and body content.
- **Reliable Modal**: Modal remains open while editing until explicitly saved or cancelled.

---

## Authentication & Security

- **Password Hashing**: Passwords hashed using `bcryptjs` with salt rounds set to 12 before database persistence.
- **Stateless Tokens**: Signed JSON Web Tokens (JWT) with configurable expiration (`JWT_EXPIRE`).
- **Reset Token Security**: Reset tokens generated using `crypto.randomBytes(32)` and stored in MongoDB strictly as SHA-256 hashes (`select: false`).
- **Anti-Enumeration**: Password reset requests return a consistent success message regardless of whether the email is registered.
- **Token Invalidation**: Reset tokens are strictly single-use and cleared immediately upon successful password reset.

---

## UI / UX Architecture

TaskFlow is built on the **Nimbus UI** design system:
- **Color System**: Slate neutrals paired with indigo brand accents (`#4f46e5`).
- **Typography**: Clean hierarchy powered by the Inter font family.
- **Micro-Animations**: Subtle page transitions and modal popups using Framer Motion.
- **Theme Transitions**: Smooth CSS variables transition for background, borders, text, and cards without layout flickering.
- **Toast Notifications**: Positioned fixed in the bottom-right corner to never obstruct header controls.

---

## Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Validation**: [express-validator](https://express-validator.github.io/)
- **Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [cors](https://github.com/expressjs/cors)
- **Email Service**: [Brevo Transactional API](https://www.brevo.com/) with dev fallback

### Database
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (or in-memory MongoDB for offline development)
- **ODM**: [Mongoose](https://mongoosejs.com/)

### Deployment & Tooling
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render / Vercel
- **Version Control**: Git & GitHub

---

## Project Structure

```
TaskManager/
├── backend/
│   ├── config/               # Database connection (Atlas & in-memory dev)
│   ├── controllers/          # Route controller logic (auth, task, note, notification)
│   ├── middleware/           # Auth verification, error handling, validator middleware
│   ├── models/               # Mongoose schemas (User, Task, Note, Otp, PushSubscription)
│   ├── routes/               # Express route declarations (auth, task, note, notification)
│   ├── services/             # Notification service & push scheduler
│   ├── utils/                # JWT generator, Brevo email utility
│   ├── .env.example          # Backend environment template
│   ├── package.json
│   └── server.js             # Express server entry point
│
├── frontend/
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── components/       # Reusable components (TaskCard, NoteCard, Modal, Button, etc.)
│   │   ├── context/          # AuthContext & ThemeContext providers
│   │   ├── hooks/            # Custom hooks (useTasks, useTheme, etc.)
│   │   ├── layouts/          # DashboardLayout with Header & Sidebar
│   │   ├── pages/            # View components (LandingPage, Dashboard, Tasks, Calendar, Notes, Settings, Auth)
│   │   ├── routes/           # AppRoutes, ProtectedRoute & PublicRoute configuration
│   │   ├── services/         # Axios API instance and taskService / authService methods
│   │   ├── utils/            # Helper functions & formatting utilities
│   │   ├── App.jsx           # Root application component
│   │   ├── index.css         # Global Tailwind styles & theme variables
│   │   └── main.jsx          # React DOM entry point
│   ├── .env.example          # Frontend environment template
│   ├── package.json
│   ├── tailwind.config.js    # Tailwind configuration & color themes
│   └── vite.config.js        # Vite build configuration
│
├── API_DOCUMENTATION.md      # Detailed API endpoint reference
└── README.md                 # Project documentation
```

---

## Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB server)

### 1. Clone the Repository
```bash
git clone https://github.com/Pranav0331/TaskManager.git
cd TaskManager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Configure your `backend/.env` with your database and auth credentials (see [Environment Variables](#environment-variables)).

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
Configure your `frontend/.env` with the backend API URL.

### 4. Run Development Servers

**Start Backend Server:**
```bash
# In backend/ directory
npm run dev
# Server running at http://localhost:5001
```

**Start Frontend Development Server:**
```bash
# In frontend/ directory
npm run dev
# App running at http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
USE_IN_MEMORY_DB=false
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Email Configuration (Brevo HTTPS Transactional API)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=TaskFlow <your_verified_sender_email>

# Web Push Notifications (Optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

> ⚠️ **Security Notice**: Never commit `.env` files or expose API keys, database strings, or JWT secrets to version control.

---

## API Overview

All protected endpoints require the header: `Authorization: Bearer <token>`.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Initiate registration and dispatch OTP to email | Public |
| `POST` | `/api/auth/verify-otp` | Verify 4-digit OTP and complete account creation | Public |
| `POST` | `/api/auth/resend-otp` | Resend verification code | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | Public |
| `POST` | `/api/auth/forgot-password` | Generate & email password reset link | Public |
| `GET` | `/api/auth/verify-reset-token`| Validate reset token | Public |
| `POST` | `/api/auth/reset-password` | Set new password with valid token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Protected |

### Task Endpoints (`/api/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/tasks/stats` | Retrieve dashboard task counts and metrics | Protected |
| `GET` | `/api/tasks` | Get all user tasks (supports search & filters) | Protected |
| `GET` | `/api/tasks/:id` | Get single task details | Protected |
| `POST` | `/api/tasks` | Create a new task | Protected |
| `PUT` | `/api/tasks/:id` | Update an existing task | Protected |
| `DELETE` | `/api/tasks/:id` | Delete a task | Protected |

### Note Endpoints (`/api/notes`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notes` | Get all notes for authenticated user | Protected |
| `POST` | `/api/notes` | Create a new note | Protected |
| `GET` | `/api/notes/:id` | Get single note by ID | Protected |
| `PUT` | `/api/notes/:id` | Update note title, content, or color | Protected |
| `PATCH` | `/api/notes/:id/pin` | Toggle pinned state of note | Protected |
| `DELETE` | `/api/notes/:id` | Delete a note | Protected |

*For complete payload and response schemas, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).*

---

## Future Improvements

- [ ] Drag-and-drop Kanban board view for tasks.
- [ ] Task file attachments and rich text formatting.
- [ ] Recurring tasks (daily, weekly, monthly schedules).
- [ ] Team workspaces and task assignment sharing.
- [ ] Activity logs and task history tracking.

---

## Author

**TaskFlow** — Built as a full-stack development project.

---

## License

This project is licensed under the [MIT License](./LICENSE).
