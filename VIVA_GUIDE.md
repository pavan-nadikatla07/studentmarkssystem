# MERN Stack Mini Project: Viva Preparation & Concept Guide

## 1. How Each MERN Technology is Used in this Portal

### MongoDB
- **Role**: NoSQL document-oriented database used to store flexible JSON-like documents.
- **In this Project**:
  - `Users` collection stores accounts with hashed passwords and roles (`admin` or `student`).
  - `Students` collection stores biodata (`rollNumber`, `department`, `semester`, `section`).
  - `Results` collection stores subject-wise grades, marks, and SGPA.
  - Used Mongoose ODM for schemas, validation, middleware hooks (`pre('save')`), query filtering (`find()`), atomic updates (`updateOne()`), deletions (`deleteOne()`), indexes (`createIndex`), and statistical aggregation (`aggregate()`).

### Express.js
- **Role**: Minimalist web application framework for Node.js to structure RESTful APIs.
- **In this Project**:
  - Handles HTTP routing (`/api/register`, `/api/login`, `/api/students`, `/api/results`).
  - Implements middleware pipelines (`express.json()`, CORS, authentication guard, role verification).
  - Centralizes error handling with custom 404 and global exception handlers.

### ReactJS
- **Role**: Component-based declarative frontend library for single-page applications (SPA).
- **In this Project**:
  - Manages client-side navigation without page reloads using **React Router v6**.
  - Implements state management using `useState()` and API lifecycles via `useEffect()`.
  - Shares authentication tokens and user sessions globally using **React Context API** (`AuthContext`).
  - Implements responsive UI components: Modals, Result Tables, Stat Cards, Grade Badges, and Print-ready marksheets.

### Node.js
- **Role**: Cross-platform JavaScript runtime environment executing JavaScript code server-side.
- **In this Project**:
  - Runs the Express API server and handles asynchronous non-blocking I/O operations.
  - Manages dependencies and script lifecycles via `npm` (`npm start`, `npm run dev`, `npm run seed`).

---

## 2. 15 Viva Questions & Targeted Answers

### Q1: What is the MERN stack and why did you choose it for this Examination Portal?
**Answer**: MERN stands for MongoDB, Express.js, ReactJS, and Node.js. It provides an end-to-end JavaScript ecosystem. For an Examination Portal, React delivers a responsive single-page interface for viewing grades, Express and Node provide high-throughput non-blocking REST APIs, and MongoDB offers flexible document schemas for diverse course subjects and semester records without rigid schema migrations.

### Q2: How is User Authentication and Authorization implemented?
**Answer**: Authentication is implemented using **JSON Web Tokens (JWT)** and **bcryptjs**. When a user logs in, their password is verified against the bcrypt hash. If valid, the backend signs a JWT containing `userId` and `role`. For subsequent requests, the frontend sends this token in the `Authorization: Bearer <token>` header. Our `authMiddleware` verifies the token, and the `adminOnly` / `studentOnly` middleware blocks unauthorized API requests (returning `403 Forbidden`).

### Q3: How do you ensure students cannot access Admin pages by typing the URL?
**Answer**: We use role-based authorization at both levels:
1. **Frontend**: Using a `ProtectedRoute` wrapper with `allowedRole="admin"`. If a student enters `/admin-dashboard`, React Router inspects `AuthContext` and redirects them to `/student-dashboard`.
2. **Backend**: Even if a user crafts a direct HTTP request to Admin endpoints (e.g. `POST /api/results`), the Express `adminOnly` middleware rejects it with HTTP `403 Forbidden`.

### Q4: What MongoDB methods are used in this project?
**Answer**:
1. `find()`: Retrieves filtered lists of students or results.
2. `updateOne()`: Modifies student details or updates marks for a specific result.
3. `deleteOne()`: Deletes a result or student record.
4. `aggregate()`: Powers the Admin Dashboard semester analytics, calculating total student entries, average marks, highest/lowest scores, and pass percentages grouped by semester.
5. `createIndex()`: Optimizes lookup speed on `rollNumber`, `studentId`, and `email`.

### Q5: How is SGPA calculated in this portal?
**Answer**: SGPA (Semester Grade Point Average) is calculated using a 10-point scale. Each subject's mark is mapped to a letter grade and grade point (e.g., 90-100 = 'O' / 10 pts, 80-89 = 'A+' / 9 pts, down to <40 = 'F' / 0 pts). The formula is:
$$\text{SGPA} = \frac{\sum (\text{Grade Points})}{\text{Total Enrolled Subjects}}$$
Whenever an admin creates, edits, or deletes a result, the backend automatically recalculates and updates the SGPA for all subjects of that student in that semester.

### Q6: Why did you use MongoDB Aggregation instead of calculating averages in JavaScript?
**Answer**: MongoDB Aggregation processes data directly on the database engine using optimized native C++ pipelines (`$match`, `$group`, `$project`). Calculating it in JavaScript would require fetching hundreds of records across the network into server RAM, which is slow and memory-intensive.

### Q7: Where is the grading scale configured?
**Answer**: Following clean architectural guidelines, grading logic is isolated in a single configuration file: `backend/utils/grading.js` (and mirrored in `frontend/src/utils/gradingConfig.js`). To adjust grade thresholds or add credit weighting, we only update this single module rather than modifying code throughout the project.

### Q8: How does password hashing work?
**Answer**: We use `bcryptjs`. We never store plain-text passwords. In `backend/models/User.js`, a Mongoose `pre('save')` hook intercepts new or updated passwords, generates a salt with 10 rounds (`bcrypt.genSalt(10)`), and hashes the password before writing it to MongoDB.

### Q9: How does the "Download Result Summary" feature work?
**Answer**: We created an official university mark-statement layout in `ResultSummary.jsx` and styled it using CSS `@media print` rules. When the student clicks "Download / Print Result Summary", it triggers `window.print()`, hiding navigation bars and sidebars, rendering the watermark and university header, allowing the student to save it directly as an official PDF.

### Q10: What is CORS and how is it configured?
**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that prevents web pages from making requests to a different domain or port than the one that served the web page. We used the `cors` package in `backend/server.js` and set up a proxy in `frontend/vite.config.js` to enable smooth communication between `localhost:5173` and `localhost:5000`.

### Q11: What HTTP status codes are used in your REST APIs?
**Answer**:
- `200 OK`: Successful GET, PUT, DELETE requests.
- `201 Created`: Successful POST requests (student registration, new result entry).
- `400 Bad Request`: Validation failure (e.g., marks > 100, duplicate email or roll number).
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Authenticated user lacks permission (student attempting admin operations).
- `404 Not Found`: Student or Result record not found.
- `500 Internal Server Error`: Unhandled server exceptions.

### Q12: How is state managed in the React frontend?
**Answer**: We use a hybrid approach:
- **Global state**: Authentication state (`user`, `student`, `token`, `login()`, `logout()`) is managed via React Context API (`AuthContext.jsx`) and persisted in `localStorage`.
- **Local component state**: Form data, modal toggles, search inputs, and filters are managed with `useState()` and data fetching is controlled with `useEffect()`.

### Q13: What happens when an administrator deletes a student?
**Answer**: In `studentController.js`, when a student is deleted via `Student.deleteOne()`, we also perform a cascade delete using `Result.deleteMany({ studentId: student.studentId })` to prevent orphaned result records in the database.

### Q14: How does the frontend handle API loading and error states?
**Answer**: Every page tracks `loading` and `error` states. When an API call is in flight, a CSS loading spinner or skeleton placeholder appears. If an error occurs, an accessible `Alert` banner is displayed with user-friendly messages rather than raw backend stack traces.

### Q15: Can you explain the schema design of the three collections?
**Answer**:
1. `Users`: `userId`, `name`, `email`, `password`, `role`.
2. `Students`: `studentId`, `rollNumber` (unique index), `studentName`, `department`, `semester`, `section`, `userId`.
3. `Results`: `resultId`, `studentId`, `subjectCode`, `subjectName`, `marks` (0-100), `grade`, `SGPA`, `semester`.
This mirrors the official project PDF requirements.
