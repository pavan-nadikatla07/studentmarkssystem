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

// PDF REST APIs for Students:
// GET /students
// POST /students
router.route('/')
  .get(protect, getStudents)
  .post(protect, adminOnly, createStudent);

// GET /students/:id
// PUT /students/:id
// DELETE /students/:id
router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, adminOnly, updateStudent)
  .delete(protect, adminOnly, deleteStudent);

module.exports = router;
