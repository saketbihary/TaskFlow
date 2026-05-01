════════════════════════════════════════════════════════════════
  TaskFlow — Team Task Manager
  Full-Stack Web Application
════════════════════════════════════════════════════════════════

PROJECT OVERVIEW
────────────────
TaskFlow is a production-ready Team Task Manager built with the
MERN stack (MongoDB, Express, React, Node.js). It features
role-based access control with JWT authentication, full project
and task management, a statistics dashboard, and team collaboration
tools.

TECH STACK
──────────
Frontend:
  - React 18 (with hooks, React Router v6)
  - Pure CSS (custom dark theme, no framework dependency)
  - Axios for API communication

Backend:
  - Node.js + Express 4
  - JWT authentication (jsonwebtoken)
  - bcryptjs for password hashing
  - Mongoose ODM

Database:
  - MongoDB (MongoDB Atlas for production)

Deployment:
  - Railway (both frontend and backend)

FEATURES
────────
✅ JWT Authentication (Signup / Login / Logout)
✅ Role-Based Access Control (ADMIN / MEMBER)
✅ Project Management (Create, Edit, Delete)
✅ Team Management (Add/Remove Members per project)
✅ Task Management (Full CRUD for Admin, status update for Member)
✅ Dashboard with Stats (Total, Completed, In-Progress, Todo, Overdue)
✅ Task Filters (by Status, Project, Assigned User)
✅ Overdue Task Detection
✅ User Management (Admin only)
✅ Protected Routes
✅ Responsive Design

PROJECT STRUCTURE
─────────────────
team-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with bcrypt
│   │   ├── Project.js       # Project schema
│   │   └── Task.js          # Task schema with virtual isOverdue
│   ├── routes/
│   │   ├── auth.js          # Register, Login, Me
│   │   ├── users.js         # User CRUD
│   │   ├── projects.js      # Project CRUD + member management
│   │   └── tasks.js         # Task CRUD + stats
│   ├── middleware/
│   │   └── auth.js          # protect() + restrictTo() middleware
│   ├── server.js            # Express app entry point
│   ├── seed.js              # Database seeding script
│   ├── .env.example         # Environment variable template
│   ├── package.json
│   └── railway.toml         # Railway deployment config
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js   # Global auth state
    │   ├── utils/
    │   │   └── api.js           # Axios instance with interceptors
    │   ├── components/
    │   │   └── AppLayout.js     # Sidebar + layout
    │   ├── pages/
    │   │   ├── LoginPage.js     # Login with demo fill
    │   │   ├── SignupPage.js    # Registration
    │   │   ├── DashboardPage.js # Stats + recent items
    │   │   ├── ProjectsPage.js  # Project list + create/edit
    │   │   ├── ProjectDetailPage.js  # Project + tasks + members
    │   │   ├── TasksPage.js     # Task table + filters + CRUD
    │   │   └── UsersPage.js     # User management (Admin)
    │   ├── App.js               # Router + protected routes
    │   ├── index.js             # React entry point
    │   └── index.css            # Global styles
    ├── package.json
    └── railway.toml

API ROUTES
──────────
Auth:
  POST /api/auth/register     Register new user
  POST /api/auth/login        Login + get JWT
  GET  /api/auth/me           Get current user (protected)

Users (Admin only except GET self):
  GET    /api/users           List all users
  GET    /api/users/:id       Get user by ID
  PUT    /api/users/:id       Update user
  DELETE /api/users/:id       Delete user

Projects:
  GET    /api/projects        List projects (filtered by role)
  POST   /api/projects        Create project (Admin)
  GET    /api/projects/:id    Get project detail
  PUT    /api/projects/:id    Update project (Admin)
  DELETE /api/projects/:id    Delete project + tasks (Admin)
  POST   /api/projects/:id/members        Add member (Admin)
  DELETE /api/projects/:id/members/:uid   Remove member (Admin)

Tasks:
  GET    /api/tasks           List tasks (filtered by role)
  POST   /api/tasks           Create task (Admin)
  GET    /api/tasks/stats     Dashboard statistics
  GET    /api/tasks/:id       Get task detail
  PUT    /api/tasks/:id       Update task (Admin: all, Member: status)
  DELETE /api/tasks/:id       Delete task (Admin)

LOCAL SETUP
───────────
Prerequisites:
  - Node.js 18+
  - MongoDB (local or Atlas)

1. Clone/unzip the project:
   cd team-task-manager

2. Backend setup:
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   node seed.js         # Seed demo data
   npm run dev          # Starts on http://localhost:5000

3. Frontend setup (new terminal):
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env: REACT_APP_API_URL=http://localhost:5000/api
   npm start            # Starts on http://localhost:3000

DEMO CREDENTIALS
────────────────
👑 Admin Account:
   Email:    admin@taskflow.com
   Password: admin123
   Access:   Full access — create projects, manage users, full task CRUD

👤 Member Account:
   Email:    member@taskflow.com
   Password: member123
   Access:   View assigned projects, update own task statuses

👤 Additional Members:
   bob@taskflow.com   / member123
   carol@taskflow.com / member123

RAILWAY DEPLOYMENT
──────────────────

Step 1: MongoDB Atlas
  1. Go to mongodb.com/atlas → Create free cluster
  2. Create database user with password
  3. Whitelist IP 0.0.0.0/0 (allow all)
  4. Copy connection string

Step 2: Deploy Backend on Railway
  1. Go to railway.app → New Project → Deploy from GitHub
  2. Select your repo, choose /backend folder
  3. Add environment variables:
     MONGO_URI = <your Atlas connection string>
     JWT_SECRET = <random 32+ char string>
     CLIENT_URL = <your frontend URL (add after deploying frontend)>
     PORT = 5000
  4. Deploy → Copy your backend URL (e.g., https://taskflow-api.up.railway.app)

Step 3: Deploy Frontend on Railway
  1. New Service → Deploy from same repo, choose /frontend folder
  2. Add environment variable:
     REACT_APP_API_URL = https://your-backend.up.railway.app/api
  3. Deploy → Copy your frontend URL

Step 4: Update Backend CORS
  1. Go back to backend service
  2. Update CLIENT_URL = https://your-frontend.up.railway.app
  3. Redeploy

Step 5: Seed Production Database
  After backend is live:
  1. SSH into Railway service OR
  2. Run locally with production MONGO_URI:
     MONGO_URI=<atlas_uri> node seed.js

LIVE URL
────────
  Frontend: https://YOUR-FRONTEND.up.railway.app
  Backend:  https://YOUR-BACKEND.up.railway.app

(Replace with actual URLs after deployment)

DEMO VIDEO GUIDE (2–5 min)
──────────────────────────
Record these steps:

1. (0:00) Open the app — show the login page
2. (0:15) Login as Admin (admin@taskflow.com / admin123)
3. (0:30) Walk through Dashboard — show stat cards
4. (1:00) Go to Projects — show existing projects, create a new one
5. (1:30) Open a project — show members, add/remove a member
6. (2:00) Go to Tasks — show task list with filters
7. (2:30) Create a new task with all fields
8. (3:00) Edit a task, then delete it
9. (3:30) Go to Users page — show role management
10. (4:00) Logout → Login as Member (member@taskflow.com)
11. (4:15) Show restricted view — no create/delete buttons
12. (4:30) Show member updating their task status only
13. (5:00) Wrap up — show Dashboard stats update

Recommended tools: Loom (free), OBS Studio, or QuickTime

════════════════════════════════════════════════════════════════
  Built with ❤️ for recruiter evaluation
  Stack: React + Node.js + Express + MongoDB + Railway
════════════════════════════════════════════════════════════════
