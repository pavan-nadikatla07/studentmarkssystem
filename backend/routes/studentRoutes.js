const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student REST APIs:
// GET /students - Admin Only (Students must NOT access admin APIs or list of all students)
// POST /students - Admin Only (Students must NOT add students)
router.route('/')
  .get(protect, adminOnly, getStudents)
  .post(protect, adminOnly, createStudent);

// GET /students/:id - Authenticated (Admins can view any student; Students can ONLY view their own profile)
// PUT /students/:id - Admin Only (Students must NOT modify student records)
// DELETE /students/:id - Admin Only (Students must NOT delete student records)
router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, adminOnly, updateStudent)
  .delete(protect, adminOnly, deleteStudent);

module.exports = router;
