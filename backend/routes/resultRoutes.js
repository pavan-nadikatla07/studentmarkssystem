const express = require('express');
const router = express.Router();
const {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  getSemesterReport,
} = require('../controllers/resultController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// PDF REST APIs for Results:
// GET /results
// POST /results
router.route('/')
  .get(protect, getResults)
  .post(protect, adminOnly, createResult);

// Aggregate Semester Reports (Admin Only)
router.get('/reports/semester', protect, adminOnly, getSemesterReport);

// GET /results/:id
// PUT /results/:id
// DELETE /results/:id
router.route('/:id')
  .get(protect, getResultById)
  .put(protect, adminOnly, updateResult)
  .delete(protect, adminOnly, deleteResult);

module.exports = router;
