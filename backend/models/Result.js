const mongoose = require('mongoose');
const { calculateGrade } = require('../utils/grading');

const resultSchema = new mongoose.Schema(
  {
    resultId: {
      type: String,
      required: [true, 'Result ID is required'],
      unique: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject Code is required'],
      uppercase: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject Name is required'],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot be greater than 100'],
    },
    grade: {
      type: String,
      trim: true,
    },
    SGPA: {
      type: Number,
      default: 0.0,
      min: [0, 'SGPA cannot be less than 0'],
      max: [10, 'SGPA cannot be greater than 10'],
    },
    // Semester field to support semester-wise viewing and reports
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate grade from marks before saving if not provided
resultSchema.pre('save', function (next) {
  if (this.marks !== undefined && !this.grade) {
    this.grade = calculateGrade(this.marks);
  }
  next();
});

// Indexes for fast querying (as required by MongoDB concepts in PDF)
resultSchema.index({ studentId: 1 });
resultSchema.index({ studentId: 1, semester: 1 });
resultSchema.index({ subjectCode: 1 });
resultSchema.index({ semester: 1 });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
