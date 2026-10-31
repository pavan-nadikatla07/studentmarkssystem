# Online Examination Result Portal (MERN Stack)

> Inspired by SIH 2025 – AI Smart Education Ecosystem  
> Official College Mini Project Implementation

A complete, full-stack web application built using MongoDB, Express.js, ReactJS, and Node.js (MERN Stack). This portal enables academic administrators to publish examination marks, automatically compute grades and SGPA, and generate statistical semester reports. Students can securely log in to review their subject-wise scores, check semester performance, and download official grade cards.

---

## 1. Problem Statement
Every semester, engineering colleges publish internal and semester examination results through static physical notice boards or large PDF documents. This practice makes it challenging for students to quickly find individual scores, track academic progression across semesters, or access historical records.

The **Online Examination Result Portal** addresses this by providing a centralized, secure digital solution with role-based access control, automated grading, and instant transcript downloads.

---

## 2. Key Features
- **Student Registration & JWT Authentication**: Secure login with salted bcrypt password hashing and token persistence.
- **Strict Role-Based Access Control (RBAC)**: Complete separation between Admin and Student roles on both backend APIs and frontend React Router guards.
- **Dynamic Grading & SGPA Calculation**: Automated grade mapping (10-point scale: O, A+, A, B+, B, P, F) and real-time SGPA calculation upon mark entry.
- **Semester Reports via MongoDB Aggregation**: Real-time statistical analytics calculating average marks, pass percentages, and subject-wise metrics directly in the database engine.
- **Downloadable / Printable Result Summary**: Official college grade sheet layout equipped with `@media print` styling for 1-click PDF download or printing.
- **Interactive Marks Management**: Admin CRUD interface with search, semester filtering, modal dialogs, and delete confirmation safeguards.
- **1-Click Demo Credentials**: Instant login autofill buttons on the login screen for seamless viva presentations.

---

## 3. User Roles & Capabilities

### Administrator
1. **Login**: Authenticated via JWT.
2. **Add Student Results**: Select student, enter course details and marks; grade is computed automatically.
3. **Update Marks**: Edit marks with automatic recalculation of grades and semester SGPA.
4. **Delete Results**: Remove result records with confirmation dialog and automatic SGPA refresh.
5. **View Result Reports & Semester Analytics**: MongoDB `aggregate()` pipeline reports showing averages and pass rates.
6. **Student Management**: Add and search enrolled candidates.

### Student
1. **Register**: Self-registration with roll number, department, semester, and section.
2. **Login**: Secure access to personal records only.
3. **Student Dashboard**: Overview of academic profile, current semester SGPA, and enrolled subjects.
4. **My Results**: Historical semester-wise performance cards.
5. **Subject-wise Marks**: Tabular course marks with grade points and pass/fail indicators.
6. **Download Result Summary**: Formatted transcript ready for digital saving or printing.

---

## 4. Technology Stack
- **Frontend**: ReactJS (v18), React Router (v6), Vite, Lucide React (icons), Vanilla CSS (Custom Design System).
- **Backend**: Node.js, Express.js (v4).
- **Database**: MongoDB (Local instance or MongoDB Atlas via Mongoose ODM).
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing.
- **API Testing**: Postman Collection (`postman/Online_Examination_Portal.postman_collection.json`).

---

## 5. Project Structure

```
MERNStack/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   ├── studentController.js  # Student CRUD operations
│   │   └── resultController.js   # Results CRUD, SGPA calculation & Aggregation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & RBAC guards
│   │   └── errorMiddleware.js    # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Users collection schema (userId, name, email, password, role)
│   │   ├── Student.js            # Students collection schema (studentId, rollNumber, etc.)
│   │   └── Result.js             # Results collection schema (resultId, marks, grade, SGPA, etc.)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/register, /api/login, /api/auth/me
│   │   ├── studentRoutes.js      # /api/students CRUD routes
│   │   └── resultRoutes.js       # /api/results CRUD & /reports/semester routes
│   ├── utils/
│   │   ├── grading.js            # Isolated grading scale and SGPA formula
│   │   ├── seed.js               # Demo data seeder script
│   │   └── e2e_test.js           # Automated end-to-end test suite
│   ├── .env                      # Environment variables
│   ├── .env.example              # Template for environment variables
│   ├── package.json
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx         # Notification alert component
│   │   │   ├── Footer.jsx        # Portal footer
│   │   │   ├── Modal.jsx         # Accessible modal dialog
│   │   │   ├── Navbar.jsx        # Header with navigation & role badges
│   │   │   ├── ProtectedRoute.jsx# RBAC route guard
│   │   │   ├── Sidebar.jsx       # Dashboard sidebar
│   │   │   └── StatCard.jsx      # Metric card component
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & JWT persistence
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page (Page 1)
│   │   │   ├── Register.jsx          # Student registration (Page 2)
│   │   │   ├── Login.jsx             # User login with demo buttons (Page 3)
│   │   │   ├── StudentDashboard.jsx  # Student dashboard (Page 4)
│   │   │   ├── MyResults.jsx         # Semester results (Page 5)
│   │   │   ├── SubjectWiseMarks.jsx  # Subject breakdown (Page 6)
│   │   │   ├── ResultSummary.jsx     # Downloadable grade card (Page 7)
│   │   │   ├── AdminDashboard.jsx    # Admin metrics & aggregate reports (Page 8)
│   │   │   └── ManageResults.jsx     # Admin CRUD & marks entry (Page 9)
│   │   ├── services/
│   │   │   └── api.js            # Centralized API client service
│   │   ├── utils/
│   │   │   └── gradingConfig.js  # Frontend grading & badge styles
│   │   ├── App.jsx               # Route definitions
│   │   ├── main.jsx              # React mounting
│   │   └── index.css             # Modern academic design system & print styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js            # Vite config with backend proxy
├── postman/
│   └── Online_Examination_Portal.postman_collection.json
├── POSTMAN_GUIDE.md              # Detailed API documentation
├── VIVA_GUIDE.md                 # 15 Viva Q&As and technology explanations
└── README.md
```

---

## 6. MongoDB Setup

### Option A: Local MongoDB (Default)
The project is configured by default to connect to local MongoDB at:
```
mongodb://127.0.0.1:27017/exam_portal
```
Ensure your local MongoDB service is running (e.g. `Get-Service MongoDB` on Windows).

### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. Under **Database Access**, create a database user with read/write privileges.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
4. Click **Connect** > **Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/exam_portal?retryWrites=true&w=majority
   ```
5. Update `MONGODB_URI` in `backend/.env`.

---

## 7. Environment Variables (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/exam_portal
JWT_SECRET=supersecret_exam_portal_jwt_token_key_2025
NODE_ENV=development
```

---

## 8. Installation & Setup

### Step 1: Clone or navigate to project directory
```bash
cd MERNStack
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Populate Demo Seed Data
```bash
npm run seed
```
*(This creates the Admin account, 3 students, and sample semester marks with auto-calculated grades and SGPA).*

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 9. Running the Application

### Start Backend Server (Port 5000)
```bash
cd backend
npm start
# Server starts at: http://localhost:5000
```

### Start Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
# App opens at: http://localhost:5173
```

---

## 10. Demo Credentials (For Presentation & Viva)

> 🎓 **SVES College Mail Standard**: All student emails follow the official format: `<rollNumber>@sves.org.in`. Students can sign in using **either** their college email or directly with their Roll Number!

| Role | Name | College Email / Roll No | Password | Roll Number |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Ramesh Kumar (Exam Controller) | `admin@sves.org.in` | `adminpassword123` | N/A |
| **Student 1** | Rahul Sharma | `2024cs001@sves.org.in` or `2024CS001` | `student123` | `2024CS001` |
| **Student 2** | Priya Patel | `2024cs002@sves.org.in` or `2024CS002` | `student123` | `2024CS002` |
| **Student 3** | Amit Verma | `2024ec015@sves.org.in` or `2024EC015` | `student123` | `2024EC015` |

> 💡 **Tip**: On the login page, you can click the **1-Click Demo Buttons** to autofill these credentials instantly!

---

## 11. REST API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Public | Register new student |
| `POST` | `/api/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |
| `GET` | `/api/students` | Authenticated | List all students |
| `POST` | `/api/students` | Admin | Create student record |
| `PUT` | `/api/students/:id` | Admin | Update student details (`updateOne`) |
| `DELETE`| `/api/students/:id` | Admin | Delete student (`deleteOne`) |
| `GET` | `/api/results` | Authenticated | View results (student scoped / admin filtered) |
| `POST` | `/api/results` | Admin | Add student result & auto-calculate SGPA |
| `PUT` | `/api/results/:id` | Admin | Update result marks (`updateOne`) |
| `DELETE`| `/api/results/:id` | Admin | Delete result record (`deleteOne`) |
| `GET` | `/api/results/reports/semester` | Admin | Semester reports via MongoDB `aggregate()` |

*Complete request/response documentation available in [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md).*

---

## 12. 7 Core Modules (from Project Specification)
1. **Module 1: Student Registration**: `/register` & `Register.jsx`
2. **Module 2: Login Authentication**: `/login` & `Login.jsx` (JWT, bcrypt)
3. **Module 3: Result Management**: `ManageResults.jsx` (Admin CRUD)
4. **Module 4: Marks Entry**: Marks modal with dynamic grade preview
5. **Module 5: Result Viewing**: `MyResults.jsx`, `SubjectWiseMarks.jsx`, `ResultSummary.jsx`
6. **Module 6: Student Dashboard**: `StudentDashboard.jsx`
7. **Module 7: Admin Dashboard**: `AdminDashboard.jsx` (Aggregate statistics)

---

## 13. Future Enhancements
- Automated PDF generation using server-side Puppeteer or PDFKit.
- Email / SMS notifications to students when semester results are published.
- Re-evaluation and mark re-verification request workflow.
- CSV / Excel bulk upload of marks for large examination batches.
- Analytics charts with Chart.js / Recharts for student performance trends across semesters.
