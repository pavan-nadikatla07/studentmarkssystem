const mongoose = require('mongoose');
const Result = require('../models/Result');
const Student = require('../models/Student');
const { calculateGrade, calculateSGPA } = require('../utils/grading');

/**
 * Helper: Recalculate and update SGPA across all subjects for a student & semester
 */
const refreshSemesterSGPA = async (studentId, semester) => {
  const semesterResults = await Result.find({ studentId, semester });
  if (semesterResults.length === 0) return 0;

  const newSGPA = calculateSGPA(semesterResults);

  // Update SGPA on all records for that student and semester
  await Result.updateMany(
    { studentId, semester },
    { $set: { SGPA: newSGPA } }
  );

  return newSGPA;
};

/**
 * @route   GET /results
 * @desc    Get results with optional filters (studentId, semester, subjectCode)
 * @access  Private (Admin can view all; Students can ONLY view their own results)
 */
const getResults = async (req, res, next) => {
  try {
    const { studentId, semester, subjectCode } = req.query;
    let query = {};

    // Role-based permission restriction:
    if (req.user && req.user.role === 'student') {
      let resolvedStudent = req.student;
      if (!resolvedStudent) {
        resolvedStudent = await Student.findOne({
          $or: [{ userId: req.user.userId }, { studentName: req.user.name }],
        });
      }

      if (!resolvedStudent) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      // If a student explicitly queries another student's ID or Roll Number, deny access
      if (
        studentId &&
        studentId !== resolvedStudent.studentId &&
        studentId.toUpperCase() !== resolvedStudent.rollNumber
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to view your own examination results.',
        });
      }

      // Strictly lock query to the authenticated student's own records
      query.studentId = resolvedStudent.studentId;
    } else if (studentId) {
      // Admin query: can filter by studentId or rollNumber
      const targetStudent = await Student.findOne({
        $or: [{ studentId }, { rollNumber: studentId.toUpperCase() }],
      });
      if (targetStudent) {
        query.studentId = targetStudent.studentId;
      } else {
        query.studentId = studentId;
      }
    }

    if (semester) {
      query.semester = Number(semester);
    }

    if (subjectCode) {
      query.subjectCode = subjectCode.toUpperCase();
    }

    // Using find() as required by PDF
    const results = await Result.find(query).sort({ semester: 1, subjectCode: 1 });

    // Enhance results with student information
    const studentIds = [...new Set(results.map((r) => r.studentId))];
    const students = await Student.find({ studentId: { $in: studentIds } });
    const studentMap = {};
    students.forEach((s) => {
      studentMap[s.studentId] = s;
    });

    const populatedResults = results.map((r) => {
      const plain = r.toObject();
      plain.student = studentMap[r.studentId] || null;
      return plain;
    });

    res.status(200).json({
      success: true,
      count: populatedResults.length,
      data: populatedResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /results/:id
 * @desc    Get single result by resultId or _id
 * @access  Private (Admin can view any; Students can ONLY view their own result)
 */
const getResultById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let result = await Result.findOne({ resultId: id });

    if (!result && id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Result.findById(id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Result not found with ID ${id}`,
      });
    }

    // Strict RBAC: If requester is a student, verify they own this result
    if (req.user && req.user.role === 'student') {
      let resolvedStudent = req.student;
      if (!resolvedStudent) {
        resolvedStudent = await Student.findOne({
          $or: [{ userId: req.user.userId }, { studentName: req.user.name }],
        });
      }

      if (!resolvedStudent || result.studentId !== resolvedStudent.studentId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to view your own examination results.',
        });
      }
    }

    const student = await Student.findOne({ studentId: result.studentId });

    res.status(200).json({
      success: true,
      data: {
        ...result.toObject(),
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /results
 * @desc    Add student result & calculate Grade + SGPA
 * @access  Private (Admin Only)
 */
const createResult = async (req, res, next) => {
  try {
    // Strict RBAC: Students must NOT be able to add or upload marks
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required to upload marks.',
      });
    }

    const { studentId, rollNumber, subjectCode, subjectName, marks, semester } = req.body;
    const candidateIdentifier = (studentId || rollNumber || '').toString().trim();

    if (!candidateIdentifier || !subjectCode || !subjectName || marks === undefined || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId or rollNumber, subjectCode, subjectName, marks, and semester',
      });
    }

    // Verify marks boundary
    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be a valid number between 0 and 100',
      });
    }

    // Verify student exists by studentId or normalized rollNumber or ObjectId
    let student = await Student.findOne({
      $or: [
        { studentId: candidateIdentifier },
        { rollNumber: candidateIdentifier.toUpperCase() },
      ],
    });

    if (!student && mongoose.Types.ObjectId.isValid(candidateIdentifier)) {
      student = await Student.findById(candidateIdentifier);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID or Roll Number: ${candidateIdentifier}`,
      });
    }

    const resolvedStudentId = student.studentId;
    const requestedSemester = Number(semester);

    // If student is enrolled in a lower semester, advance their enrolled semester to accommodate this examination
    if (requestedSemester > student.semester) {
      student.semester = requestedSemester;
      await student.save();
    }

    // Check if result already exists for this student, subject, and semester
    const existingResult = await Result.findOne({
      studentId: resolvedStudentId,
      subjectCode: subjectCode.toUpperCase(),
      semester: requestedSemester,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: `Result already exists for student ${student.studentName} in subject ${subjectCode.toUpperCase()} for semester ${requestedSemester}. Please use update instead.`,
      });
    }

    const grade = calculateGrade(numericMarks);
    const resultId = req.body.resultId || `RES-${Date.now().toString().slice(-6)}`;

    const newResult = await Result.create({
      resultId,
      studentId: resolvedStudentId,
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      marks: numericMarks,
      grade,
      semester: Number(semester),
      SGPA: 0.0,
    });

    // Automatically recalculate semester SGPA
    const calculatedSGPA = await refreshSemesterSGPA(resolvedStudentId, Number(semester));
    newResult.SGPA = calculatedSGPA;

    res.status(201).json({
      success: true,
      message: 'Result added successfully',
      data: newResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /results/:id
 * @desc    Update marks/subject of a result using updateOne()
 * @access  Private (Admin Only)
 */
const updateResult = async (req, res, next) => {
  try {
    // Strict RBAC: Students must NOT be able to edit or update marks
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required to update marks.',
      });
    }

    const id = req.params.id;
    const { marks, subjectName, subjectCode, semester } = req.body;

    let result = await Result.findOne({ resultId: id });
    if (!result && id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Result.findById(id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Result not found with identifier ${id}`,
      });
    }

    const updateData = {};

    if (marks !== undefined) {
      const numericMarks = Number(marks);
      if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
        return res.status(400).json({
          success: false,
          message: 'Marks must be a valid number between 0 and 100',
        });
      }
      updateData.marks = numericMarks;
      updateData.grade = calculateGrade(numericMarks);
    }

    if (subjectName) updateData.subjectName = subjectName;
    if (subjectCode) updateData.subjectCode = subjectCode.toUpperCase();
    if (semester) {
      const requestedSemester = Number(semester);
      const student = await Student.findOne({ studentId: result.studentId });
      if (student && requestedSemester > student.semester) {
        student.semester = requestedSemester;
        await student.save();
      }
      updateData.semester = requestedSemester;
    }

    // Using updateOne() as explicitly listed in MongoDB concepts in PDF
    await Result.updateOne({ _id: result._id }, { $set: updateData });

    // Refresh SGPA for this student & semester
    const targetSemester = updateData.semester || result.semester;
    await refreshSemesterSGPA(result.studentId, targetSemester);

    const updatedResult = await Result.findById(result._id);

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      data: updatedResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /results/:id
 * @desc    Delete result using deleteOne()
 * @access  Private (Admin Only)
 */
const deleteResult = async (req, res, next) => {
  try {
    // Strict RBAC: Students must NOT be able to delete marks
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required to delete marks.',
      });
    }

    const id = req.params.id;

    let result = await Result.findOne({ resultId: id });
    if (!result && id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Result.findById(id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Result not found with identifier ${id}`,
      });
    }

    const { studentId, semester } = result;

    // Using deleteOne() as explicitly listed in MongoDB concepts in PDF
    await Result.deleteOne({ _id: result._id });

    // Refresh SGPA for remaining subjects
    await refreshSemesterSGPA(studentId, semester);

    res.status(200).json({
      success: true,
      message: `Result for ${result.subjectCode} (${result.subjectName}) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /results/reports/semester
 * @desc    Generate semester reports using MongoDB aggregate()
 * @access  Private (Admin Only)
 */
const getSemesterReport = async (req, res, next) => {
  try {
    // Strict RBAC: Students must NOT access admin reports or analytics
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required to view semester aggregate reports.',
      });
    }

    const { semester } = req.query;
    const matchStage = {};
    if (semester) {
      matchStage.semester = Number(semester);
    }

    // Using aggregate() as explicitly listed in MongoDB concepts in PDF
    const aggregateReport = await Result.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$semester',
          totalEntries: { $sum: 1 },
          averageMarks: { $avg: '$marks' },
          highestMarks: { $max: '$marks' },
          lowestMarks: { $min: '$marks' },
          uniqueStudents: { $addToSet: '$studentId' },
          passingCount: {
            $sum: { $cond: [{ $gte: ['$marks', 40] }, 1, 0] },
          },
          failingCount: {
            $sum: { $cond: [{ $lt: ['$marks', 40] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          semester: '$_id',
          totalEntries: 1,
          averageMarks: { $round: ['$averageMarks', 2] },
          highestMarks: 1,
          lowestMarks: 1,
          studentCount: { $size: '$uniqueStudents' },
          passingCount: 1,
          failingCount: 1,
          passPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$passingCount', { $max: [1, '$totalEntries'] }] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      { $sort: { semester: 1 } },
    ]);

    // Subject-wise performance aggregation
    const subjectWiseReport = await Result.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { subjectCode: '$subjectCode', subjectName: '$subjectName' },
          studentCount: { $sum: 1 },
          avgMarks: { $avg: '$marks' },
          maxMarks: { $max: '$marks' },
          minMarks: { $min: '$marks' },
          passCount: { $sum: { $cond: [{ $gte: ['$marks', 40] }, 1, 0] } },
        },
      },
      {
        $project: {
          subjectCode: '$_id.subjectCode',
          subjectName: '$_id.subjectName',
          studentCount: 1,
          avgMarks: { $round: ['$avgMarks', 1] },
          maxMarks: 1,
          minMarks: 1,
          passPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$passCount', { $max: [1, '$studentCount'] }] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      { $sort: { subjectCode: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        semesterSummary: aggregateReport,
        subjectSummary: subjectWiseReport,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  getSemesterReport,
};
