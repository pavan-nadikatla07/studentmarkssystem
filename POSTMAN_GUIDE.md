# Postman API Testing Guide & Specification

This guide documents every REST API endpoint for the **Online Examination Result Portal**, including HTTP methods, endpoints, request headers, request bodies, authentication requirements, and expected responses.

The ready-to-import Postman collection is located at:
📁 `postman/Online_Examination_Portal.postman_collection.json`

---

## Environment Setup in Postman
Create an environment in Postman with the following variables:
- `baseUrl`: `http://localhost:5000`
- `token`: (leave empty initially; will be filled with JWT received after login)

---

## 1. Authentication APIs

### 1.1 Student Registration
- **Method**: `POST`
- **Endpoint**: `{{baseUrl}}/api/register`
- **Auth Required**: No (Public)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Vikas Gupta",
  "email": "vikas@student.edu",
  "password": "student123",
  "role": "student",
  "rollNumber": "2024CS099",
  "department": "Computer Science & Engineering",
  "semester": 4,
  "section": "A"
}
```
- **Expected Status**: `201 Created`
- **Response Sample**:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "USR-123456",
    "name": "Vikas Gupta",
    "email": "vikas@student.edu",
    "role": "student"
  },
  "student": {
    "studentId": "STU-123456",
    "rollNumber": "2024CS099",
    "studentName": "Vikas Gupta",
    "department": "Computer Science & Engineering",
    "semester": 4,
    "section": "A"
  }
}
```

---

### 1.2 User Login (Admin & Student)
- **Method**: `POST`
- **Endpoint**: `{{baseUrl}}/api/login`
- **Auth Required**: No (Public)
- **Headers**: `Content-Type: application/json`
- **Request Body (Admin)**:
```json
{
  "email": "admin@college.edu",
  "password": "adminpassword123"
}
```
- **Request Body (Student)**:
```json
{
  "email": "rahul@student.edu",
  "password": "student123"
}
```
- **Expected Status**: `200 OK`
- **Response Sample**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "USR-ADMIN-01",
    "name": "Dr. Ramesh Kumar (Exam Controller)",
    "email": "admin@college.edu",
    "role": "admin"
  }
}
```
*(Copy the returned `token` and set it as your `token` variable in Postman).*

---

### 1.3 Get Current Profile
- **Method**: `GET`
- **Endpoint**: `{{baseUrl}}/api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Status**: `200 OK`

---

## 2. Students APIs (Admin CRUD)

### 2.1 Get All Students
- **Method**: `GET`
- **Endpoint**: `{{baseUrl}}/api/students`
- **Auth Required**: Yes (`Bearer <token>`)
- **Headers**: `Authorization: Bearer {{token}}`
- **Optional Query Params**: `?search=rahul`, `?department=Computer Science & Engineering`, `?semester=4`
- **Expected Status**: `200 OK`

---

### 2.2 Create Student
- **Method**: `POST`
- **Endpoint**: `{{baseUrl}}/api/students`
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Request Body**:
```json
{
  "studentName": "Siddharth Sen",
  "rollNumber": "2024CS088",
  "department": "Computer Science & Engineering",
  "semester": 4,
  "section": "B"
}
```
- **Expected Status**: `201 Created`

---

### 2.3 Update Student
- **Method**: `PUT`
- **Endpoint**: `{{baseUrl}}/api/students/:id`
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Request Body**:
```json
{
  "studentName": "Siddharth Sen (Updated)",
  "section": "A"
}
```
- **Expected Status**: `200 OK`

---

### 2.4 Delete Student
- **Method**: `DELETE`
- **Endpoint**: `{{baseUrl}}/api/students/:id`
- **Auth Required**: Yes (Admin only)
- **Headers**: `Authorization: Bearer {{token}}`
- **Expected Status**: `200 OK`
- **Response**:
```json
{
  "success": true,
  "message": "Student Siddharth Sen and all related results deleted successfully"
}
```

---

## 3. Results APIs (Admin CRUD & Student View)

### 3.1 Get Results
- **Method**: `GET`
- **Endpoint**: `{{baseUrl}}/api/results`
- **Auth Required**: Yes (`Bearer <token>`)
- **Headers**: `Authorization: Bearer {{token}}`
- **Behavior**:
  - If requested with a **Student Token**: automatically filtered to that student's own records.
  - If requested with an **Admin Token**: returns all records (or filtered by `?studentId=...&semester=...`).
- **Expected Status**: `200 OK`

---

### 3.2 Add Student Result
- **Method**: `POST`
- **Endpoint**: `{{baseUrl}}/api/results`
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Request Body**:
```json
{
  "studentId": "STU-2024-001",
  "semester": 4,
  "subjectCode": "CS406",
  "subjectName": "Design & Analysis of Algorithms Lab",
  "marks": 94
}
```
- **Expected Status**: `201 Created`
- **Response Sample**:
```json
{
  "success": true,
  "message": "Result added successfully",
  "data": {
    "resultId": "RES-123456",
    "studentId": "STU-2024-001",
    "subjectCode": "CS406",
    "subjectName": "Design & Analysis of Algorithms Lab",
    "marks": 94,
    "grade": "O",
    "semester": 4,
    "SGPA": 9.33
  }
}
```

---

### 3.3 Update Result Marks
- **Method**: `PUT`
- **Endpoint**: `{{baseUrl}}/api/results/:id`
- **Auth Required**: Yes (Admin only)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Request Body**:
```json
{
  "marks": 98
}
```
- **Expected Status**: `200 OK`
- **Notes**: Automatically recalculates letter grade and semester SGPA!

---

### 3.4 Delete Result
- **Method**: `DELETE`
- **Endpoint**: `{{baseUrl}}/api/results/:id`
- **Auth Required**: Yes (Admin only)
- **Headers**: `Authorization: Bearer {{token}}`
- **Expected Status**: `200 OK`

---

### 3.5 Generate Semester Reports (MongoDB Aggregate)
- **Method**: `GET`
- **Endpoint**: `{{baseUrl}}/api/results/reports/semester`
- **Auth Required**: Yes (Admin only)
- **Headers**: `Authorization: Bearer {{token}}`
- **Optional Query Param**: `?semester=4`
- **Expected Status**: `200 OK`
- **Response Sample**:
```json
{
  "success": true,
  "data": {
    "semesterSummary": [
      {
        "semester": 4,
        "totalEntries": 15,
        "averageMarks": 84.87,
        "highestMarks": 96,
        "lowestMarks": 64,
        "studentCount": 3,
        "passingCount": 15,
        "failingCount": 0,
        "passPercentage": 100
      }
    ]
  }
}
```
