const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

/**
 * Protect routes: verifies JWT and retrieves the authenticated User directly from MongoDB
 * Also attaches the verified student profile if the role is 'student'
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecret_exam_portal_jwt_token_key_2025'
    );

    // Verify the actual user and actual role stored directly in MongoDB
    const user = await User.findOne({ userId: decoded.userId }).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User belonging to this token no longer exists.',
      });
    }

    req.user = user;

    // If user is a student, link their verified Student record from MongoDB
    if (user.role === 'student') {
      let student = null;
      if (user.student) {
        student = await Student.findById(user.student);
      }
      if (!student) {
        student = await Student.findOne({ user: user._id });
      }
      if (!student) {
        student = await Student.findOne({ userId: user.userId });
      }
      if (!student) {
        student = await Student.findOne({ studentName: user.name });
      }
      req.student = student;
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token is invalid or has expired.',
    });
  }
};

/**
 * Role-based authorization: Admin Only
 * Enforces that only users with role === 'admin' in MongoDB can proceed
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Admin privileges required. Students are not authorized to perform this action.',
  });
};

/**
 * Role-based authorization: Student Only
 * Enforces that only users with role === 'student' in MongoDB can proceed
 */
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Student privileges required.',
  });
};

module.exports = {
  protect,
  adminOnly,
  studentOnly,
};
