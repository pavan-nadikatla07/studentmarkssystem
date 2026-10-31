const Student = require('../models/Student');
const Result = require('../models/Result');

/**
 * @route   GET /students
 * @desc    Get all students (with optional search and filter)
 * @access  Private (Admin or Authenticated)
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, department, semester } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = department;
    }

    if (semester) {
      query.semester = Number(semester);
    }

    // Using Mongoose find() as required by MongoDB concepts in PDF
    const students = await Student.find(query).sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /students/:id
 * @desc    Get single student by studentId or _id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const id = req.params.id;
    // Find by studentId or rollNumber or Mongo ObjectId
    let student = await Student.findOne({
      $or: [{ studentId: id }, { rollNumber: id.toUpperCase() }],
    });

    if (!student && id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /students
 * @desc    Create a new student record
 * @access  Private (Admin)
 */
const createStudent = async (req, res, next) => {
  try {
    const { rollNumber, studentName, department, semester, section } = req.body;

    if (!rollNumber || !studentName || !department || !semester || !section) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rollNumber, studentName, department, semester, and section',
      });
    }

    const existingStudent = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number ${rollNumber} already exists`,
      });
    }

    const studentId = req.body.studentId || `STU-${Date.now().toString().slice(-6)}`;

    const newStudent = await Student.create({
      studentId,
      rollNumber: rollNumber.toUpperCase(),
      studentName,
      department,
      semester: Number(semester),
      section: section.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /students/:id
 * @desc    Update student details using updateOne()
 * @access  Private (Admin)
 */
const updateStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { studentName, department, semester, section, rollNumber } = req.body;

    // Check if student exists
    let student = await Student.findOne({
      $or: [{ studentId: id }, { rollNumber: id.toUpperCase() }],
    });

    if (!student && id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with identifier ${id}`,
      });
    }

    // Using updateOne() as explicitly listed in MongoDB concepts in PDF
    const updateData = {};
    if (studentName) updateData.studentName = studentName;
    if (department) updateData.department = department;
    if (semester) updateData.semester = Number(semester);
    if (section) updateData.section = section.toUpperCase();
    if (rollNumber) updateData.rollNumber = rollNumber.toUpperCase();

    await Student.updateOne({ _id: student._id }, { $set: updateData });

    const updatedStudent = await Student.findById(student._id);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /students/:id
 * @desc    Delete student record and associated results using deleteOne()
 * @access  Private (Admin)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const id = req.params.id;

    let student = await Student.findOne({
      $or: [{ studentId: id }, { rollNumber: id.toUpperCase() }],
    });

    if (!student && id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with identifier ${id}`,
      });
    }

    // Using deleteOne() as explicitly listed in MongoDB concepts in PDF
    await Student.deleteOne({ _id: student._id });

    // Also cascade delete related results
    await Result.deleteMany({ studentId: student.studentId });

    res.status(200).json({
      success: true,
      message: `Student ${student.studentName} and all related results deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
