# TalentSphere — Online Recruitment System (Full Stack)

TalentSphere is a **full-stack Online Recruitment System** built with **React, Vite, Node.js, Express, MongoDB (Mongoose), and Tailwind CSS**. It delivers an end-to-end recruitment platform with role-based access control for **Administrators/Recruiters** and **Job Applicants**.

---

## 🌟 Key Features

### 👑 Administrator Module
* **Real-Time Analytics Dashboard**: Live KPI metrics (Total Jobs, Active Openings, Total Applications, Candidate Count, Shortlisted, Selected) and interactive **Recharts** charts (Status breakdown, Top jobs by demand, Jobs by employment type).
* **Job Posting Management (CRUD)**: Create, edit, close/activate, and delete job postings with title, company, requirements, responsibilities, salary range, vacancies, and application deadlines.
* **Applicant Submissions & Pipeline**: Search and filter candidate applications by status or job. View full applicant dossiers, cover letters, and inspect/download uploaded resumes.
* **Pipeline Status Control**: Promote or update candidate status in real time (`Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview` ➔ `Selected` / `Rejected`).
* **Applicant Talent Database**: Searchable directory of registered candidates with qualification profiles and historical application counts.

### 👤 Applicant Module
* **Landing Page & Job Discovery**: Discover featured roles, search across keywords, locations, skills, and apply faceted filters (Employment Type, Experience, Salary Range, Sorting).
* **Detailed Job Specifications**: Full job descriptions, responsibilities, requirements, and live deadline alerts.
* **Interactive Job Application**: Submit applications pre-filled from your profile, attach customized cover letters, and upload resume files (**PDF**, **DOC**, **DOCX** up to 5MB).
* **Duplicate Application Prevention**: Backend database enforcement ensuring candidates cannot apply more than once to the same job opening.
* **Deadline Verification**: Strict backend enforcement rejecting applications for closed or expired job postings.
* **Application Tracker**: Visual multi-stage status progress timeline (`StatusTimeline`) to track review, interview, and selection progression.
* **Candidate Profile Manager**: Maintain contact information, skills chips, education history, work experience summary, and default resume document.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts, React Hot Toast |
| **Backend** | Node.js, Express.js (REST API, ES Modules) |
| **Database** | MongoDB with Mongoose ODM (Indexes, Aggregation pipelines, Unique Compound Indexes) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing, Role-based middleware |
| **File Uploads** | Multer (Multipart/form-data with mime-type & 5MB file-size validation) |

---

## 📁 Project Structure

```text
online-recruitment-system/
│
├── client/                      # Frontend React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # AdminLayout, AdminSidebar, StatsCard, Charts
│   │   │   ├── applicant/       # JobCard, StatusTimeline
│   │   │   └── common/          # Navbar, Footer, Button, Input, Modal, Loader, StatusBadge, Pagination
│   │   ├── context/             # AuthContext (JWT session management)
│   │   ├── pages/               # HomePage, JobListPage, JobDetailsPage, ApplyJobPage, MyApplicationsPage, etc.
│   │   │   └── admin/           # AdminDashboardPage, AdminJobsPage, AdminJobCreatePage, AdminApplicationsPage, etc.
│   │   ├── services/            # Axios API services (api, auth, job, application, applicant, profile)
│   │   ├── App.jsx              # Client router with role-based Route Guards
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind directives
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Backend REST API
│   ├── config/                  # MongoDB connection with embedded fallback
│   ├── controllers/             # authController, jobController, applicationController, dashboardController, etc.
│   ├── middleware/              # authMiddleware, uploadMiddleware, errorMiddleware
│   ├── models/                  # User, ApplicantProfile, Job, Application (Mongoose schemas)
│   ├── routes/                  # Express REST routes
│   ├── uploads/                 # Uploaded resumes and profile avatars
│   │   ├── resumes/
│   │   └── profiles/
│   ├── utils/                   # Seed data definitions
│   ├── seed.js                  # Database seeder script
│   ├── server.js                # Server entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                 # Root script orchestration
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

From the project root:

```bash
# Automated install for all packages (Root, Server, and Client)
npm run install:all
```

Or manually:

```bash
# Install root
npm install

# Install server
cd server && npm install

# Install client
cd ../client && npm install
```

---

### 2. Environment Configuration

In the `server/` directory, create a `.env` file (or use the provided `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/recruitment_db
JWT_SECRET=super_secret_recruitment_jwt_token_key_2026_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

> **Note on MongoDB**: TalentSphere automatically connects to your local or MongoDB Atlas instance specified in `MONGO_URI`. If no local MongoDB daemon is active, it seamlessly falls back to an embedded in-memory database (`mongodb-memory-server`) for instantaneous zero-config local testing.

---

### 3. Seed Sample Database Records

Populate the database with default administrator accounts, candidate profiles, active job listings, and sample applications:

```bash
npm run seed
```

---

### 4. Run the Application

Start both the backend server and frontend development server concurrently:

```bash
npm run dev
```

* **Frontend Client**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000/api`

---

## 🔑 Default Test Credentials

The seed script provides the following ready-to-test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123` |
| **Applicant 1** | `sarah.connor@example.com` | `Password@123` |
| **Applicant 2** | `alex.rivera@example.com` | `Password@123` |
| **Applicant 3** | `priya.sharma@example.com` | `Password@123` |

> *Tip: You can also use the "⚡ One-Click Demo Credentials" buttons on the Login page for instant login.*

---

## 📡 REST API Reference

### Authentication
* `POST /api/auth/register` — Register a new applicant or admin account
* `POST /api/auth/login` — Login & receive JWT bearer token
* `GET  /api/auth/me` — Fetch currently authenticated user profile
* `POST /api/auth/logout` — Invalidate user session

### Job Postings
* `GET    /api/jobs` — Retrieve jobs with search, filtering, sorting, and pagination
* `GET    /api/jobs/:id` — Retrieve full job details (includes user application state)
* `POST   /api/jobs` — [Admin] Create a new job posting
* `PUT    /api/jobs/:id` — [Admin] Update job specifications
* `DELETE /api/jobs/:id` — [Admin] Delete job posting and associated applications

### Applications
* `POST   /api/applications` — [Applicant] Submit application with resume file upload
* `GET    /api/applications/my` — [Applicant] Get logged-in applicant's submitted applications
* `GET    /api/applications` — [Admin] Get all applications with search and status filters
* `GET    /api/applications/:id` — [Admin/Applicant] Get single application with populated details
* `PUT    /api/applications/:id/status` — [Admin] Update application stage (`Applied`, `Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`)

### Applicant Directory & Profiles
* `GET  /api/applicants` — [Admin] Directory of registered applicants with application counts
* `GET  /api/applicants/:id` — [Admin] View candidate dossier and all submitted applications
* `GET  /api/profile` — Get logged-in user profile
* `PUT  /api/profile` — Update user profile details, avatar, or default resume

### Analytics & Dashboard
* `GET  /api/dashboard/stats` — [Admin] Aggregated recruitment statistics and chart distributions

---

## 🔒 Security & Quality Standards

* **Password Security**: Bcrypt salt-based password hashing with pre-save Mongoose middleware.
* **Compound Unique Constraints**: MongoDB `{ jobId: 1, applicantId: 1 }` prevents duplicate submissions.
* **Server-side Validation**: Strict verification of application deadlines, salary ranges, and file extensions.
* **Protected Routes**: Frontend navigation guards and backend Express authorization middlewares.
* **File Upload Constraints**: File size limits (5MB) and mime-type filters for resumes and profile images.

---

## 🌐 Production Deployment

* **Frontend**: Deploy to **Vercel** or **Netlify** by connecting your GitHub repository with root set to `client` and build command `npm run build`.
* **Backend**: Deploy to **Render**, **Railway**, or **AWS EC2** with start command `node server/server.js`.
* **Database**: Create a free cluster on **MongoDB Atlas** and set `MONGO_URI` in environment variables.

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
