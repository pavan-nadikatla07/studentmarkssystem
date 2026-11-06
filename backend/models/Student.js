const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll Number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student Name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department/Branch is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true,
      default: 'A',
    },
    // Backward-compatible string userId
    userId: {
      type: String,
      trim: true,
      default: null,
    },
    // Direct MongoDB ObjectId reference to linked User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Unique partial indexes ensuring strict 1:1 mapping between a login account and a student record
// while allowing multiple unlinked student records (where user/userId is null or omitted)
studentSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);
studentSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } }
);
// Compound index for department and semester queries
studentSchema.index({ department: 1, semester: 1 });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
