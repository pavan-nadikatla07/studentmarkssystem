const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

/**
 * Generate JWT token containing userId and role
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'supersecret_exam_portal_jwt_token_key_2025',
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /register
 * @desc    Register a new user (Student) with SVES college email format (<rollNumber>@sves.org.in)
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    let email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password ? req.body.password.trim() : '';
    const role = req.body.role || 'student';
    const rollNumber = req.body.rollNumber ? req.body.rollNumber.trim().toUpperCase() : '';
    const department = req.body.department || 'Computer Science & Engineering';
    const semester = req.body.semester ? Number(req.body.semester) : 1;
    const section = req.body.section ? req.body.section.trim().toUpperCase() : 'A';

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';
    const timestamp = Date.now().toString().slice(-6);
    const generatedUserId = `USR-${timestamp}`;

    // If student, enforce roll number and SVES college email format: <rollNumber>@sves.org.in
    let createdStudent = null;
    if (assignedRole === 'student') {
      if (!rollNumber) {
        return res.status(400).json({
          success: false,
          message: 'Roll number is required for student registration',
        });
      }

      // SVES College Email format: <rollNumber>@sves.org.in (e.g. 2024cs001@sves.org.in)
      const svesCollegeEmail = `${rollNumber.toLowerCase()}@sves.org.in`;

      // Enforce the SVES college mail format
      if (!email || !email.endsWith('@sves.org.in')) {
        email = svesCollegeEmail;
      }

      // Check if student with this roll number already exists
      const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
      if (existingRoll) {
        return res.status(400).json({
          success: false,
          message: `Roll number ${rollNumber} is already registered`,
        });
      }

      // Check if user with this email already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { email: svesCollegeEmail }],
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `A user account with email '${email}' already exists`,
        });
      }

      const generatedStudentId = `STU-${timestamp}`;
      createdStudent = await Student.create({
        studentId: generatedStudentId,
        rollNumber: rollNumber.toUpperCase(),
        studentName: name,
        department,
        semester,
        section,
        userId: generatedUserId,
      });
    } else {
      // For Admin, check if email is provided
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for administrator registration',
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }
    }

    // Create User record
    const user = await User.create({
      userId: generatedUserId,
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
    });

    const token = generateToken(user.userId, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      student: createdStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /login
 * @desc    Authenticate user via Email OR Roll Number & return JWT token
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const rawInput = (req.body.email || req.body.identifier || req.body.rollNumber || '').trim();
    const password = req.body.password ? req.body.password.trim() : '';

    if (!rawInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or roll number and password',
      });
    }

    const inputLower = rawInput.toLowerCase();
    const svesCollegeEmail = `${inputLower}@sves.org.in`;

    // 1. Try to find user by email or by computed SVES college email
    let user = await User.findOne({
      $or: [{ email: inputLower }, { email: svesCollegeEmail }],
    });

    // 2. If not found directly, check if input is a Student Roll Number
    let studentProfile = null;
    if (!user) {
      const studentDoc = await Student.findOne({
        $or: [
          { rollNumber: rawInput.toUpperCase() },
          { studentId: rawInput.toUpperCase() },
        ],
      });

      if (studentDoc && studentDoc.userId) {
        user = await User.findOne({ userId: studentDoc.userId });
        studentProfile = studentDoc;
      } else if (studentDoc) {
        user = await User.findOne({ name: studentDoc.studentName });
        studentProfile = studentDoc;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, roll number, or password',
      });
    }

    // Verify password (try trimmed first, fallback to untrimmed)
    let isMatch = await user.matchPassword(password);
    if (!isMatch && req.body.password && req.body.password !== password) {
      isMatch = await user.matchPassword(req.body.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, roll number, or password',
      });
    }

    // If student, link student profile
    if (user.role === 'student' && !studentProfile) {
      studentProfile = await Student.findOne({ userId: user.userId });
      if (!studentProfile) {
        const rollPrefix = user.email.split('@')[0].toUpperCase();
        studentProfile = await Student.findOne({
          $or: [{ rollNumber: rollPrefix }, { studentName: user.name }],
        });
      }
    }

    const token = generateToken(user.userId, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      student: studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /auth/me
 * @desc    Get currently logged in user profile & linked student record
 * @access  Private (JWT Required)
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let student = null;

    if (user.role === 'student') {
      student = await Student.findOne({ userId: user.userId });
      if (!student) {
        student = await Student.findOne({ studentName: user.name });
      }
    }

    res.status(200).json({
      success: true,
      user,
      student,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
