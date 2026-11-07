const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

/**
 * Valid Engineering Branches supported by the curriculum
 */
const VALID_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
];

/**
 * Helper to normalize branch input (supports short codes like CSE, ECE, IT, etc.)
 */
const normalizeBranch = (input = '') => {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'cse' || lower.includes('computer')) return 'Computer Science & Engineering';
  if (lower === 'it' || lower.includes('information')) return 'Information Technology';
  if (lower === 'ece' || (lower.includes('electronic') && lower.includes('comm'))) return 'Electronics & Communication';
  if (lower === 'eee' || (lower.includes('electrical') && lower.includes('electr'))) return 'Electrical & Electronics';
  if (lower === 'mech' || lower.includes('mechanical')) return 'Mechanical Engineering';
  if (lower === 'civil' || lower.includes('civil')) return 'Civil Engineering';
  return trimmed;
};

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
 * @desc    Register a new user account with mandatory student details & automatic student record mapping
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  // Use MongoDB transaction only if supported (Replica Set or Sharded Cluster e.g. MongoDB Atlas)
  const topologyType = mongoose.connection?.client?.topology?.description?.type;
  const isReplicaSet = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';

  let session = null;
  if (isReplicaSet) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null;
    }
  }

  // Track created IDs for manual compensation rollback if transactions not supported
  let createdUserId = null;
  let createdStudentId = null;

  try {
    const role = (req.body.role || 'student').toLowerCase();
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const rawName = (req.body.name || req.body.studentName || '').trim();
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    const rawPassword = req.body.password ? req.body.password.trim() : '';
    const rawRollNumber = (req.body.rollNumber || '').trim().toUpperCase();
    const rawBranch = (req.body.branch || req.body.department || '').trim();
    const rawSemester = req.body.semester;
    const rawSection = (req.body.section || 'A').trim().toUpperCase();

    // 1. Common Validation: Name & Password
    if (!rawName) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!rawPassword || rawPassword.length < 6) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // -------------------------------------------------------------------------
    // ADMIN REGISTRATION FLOW
    // -------------------------------------------------------------------------
    if (assignedRole === 'admin') {
      if (!rawEmail) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Email address is required for administrator registration.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail)) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }

      const existingUser = await User.findOne({ email: rawEmail });
      if (existingUser) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `An account with email '${rawEmail}' already exists. Please log in instead.`,
        });
      }

      const generatedUserId = `USR-${Date.now().toString().slice(-6)}`;
      const user = await User.create(
        [
          {
            userId: generatedUserId,
            name: rawName,
            email: rawEmail,
            password: rawPassword,
            role: 'admin',
            student: null,
          },
        ],
        session ? { session } : {}
      );

      if (session) await session.commitTransaction();

      const createdUser = Array.isArray(user) ? user[0] : user;
      const token = generateToken(createdUser.userId, createdUser.role);

      return res.status(201).json({
        success: true,
        message: 'Administrator registration successful',
        token,
        user: {
          userId: createdUser.userId,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
        },
        student: null,
      });
    }

    // -------------------------------------------------------------------------
    // STUDENT REGISTRATION FLOW
    // Mandatory: Student Name, Roll Number, Branch, Current Semester, Email, Password
    // -------------------------------------------------------------------------

    // A. Mandatory Field Checks
    if (!rawRollNumber) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Roll Number is required.',
      });
    }

    // Normalize roll number (trimmed, alphanumeric, uppercase)
    const normalizedRoll = rawRollNumber.replace(/\s+/g, '').toUpperCase();
    if (normalizedRoll.length < 3) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Roll Number.',
      });
    }

    if (!rawBranch) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Branch selection is required.',
      });
    }

    const resolvedBranch = normalizeBranch(rawBranch);
    if (!VALID_BRANCHES.includes(resolvedBranch)) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Please select a valid Branch from the available options: ${VALID_BRANCHES.join(', ')}.`,
      });
    }

    const semesterNum = Number(rawSemester);
    if (!rawSemester || isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Current Semester is required and must be between 1 and 8.',
      });
    }

    // Student Email format: if entered, must be valid. If empty, generate standard SVES college email.
    let studentEmail = rawEmail;
    if (!studentEmail) {
      studentEmail = `${normalizedRoll.toLowerCase()}@sves.org.in`;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(studentEmail)) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }
    }

    // Check if user account with this email already exists
    const existingUserByEmail = await User.findOne({ email: studentEmail });
    if (existingUserByEmail) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `An account with email '${studentEmail}' already exists. Please log in or use a different email.`,
      });
    }

    // -------------------------------------------------------------------------
    // B. Check Existing Student Record by Normalized Roll Number
    // -------------------------------------------------------------------------
    const existingStudent = await Student.findOne({ rollNumber: normalizedRoll });

    let finalStudentRecord = null;

    if (existingStudent) {
      // -----------------------------------------------------------------------
      // CASE 1: Student Record Already Exists in Database
      // -----------------------------------------------------------------------

      // 1. Verify if this student record is already linked to an existing login account
      if (existingStudent.user || existingStudent.userId) {
        const queryConditions = [];
        if (existingStudent.user) queryConditions.push({ _id: existingStudent.user });
        if (existingStudent.userId) queryConditions.push({ userId: existingStudent.userId });

        const alreadyLinkedUser = await User.findOne({ $or: queryConditions });
        if (alreadyLinkedUser) {
          if (session) await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `A login account is already registered and linked to Roll Number ${normalizedRoll}. Please log in with your credentials.`,
          });
        }
      }

      // 2. Strict Detail Consistency Check:
      // Do not silently overwrite existing academic details. If there is a mismatch, reject!
      const existingName = existingStudent.studentName.trim().toLowerCase();
      const providedName = rawName.toLowerCase();
      if (existingName !== providedName) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `The provided Student Name ('${rawName}') does not match existing college records for Roll Number ${normalizedRoll} ('${existingStudent.studentName}'). Please verify your details.`,
        });
      }

      const existingDept = normalizeBranch(existingStudent.department);
      if (existingDept.toLowerCase() !== resolvedBranch.toLowerCase()) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `The provided Branch ('${resolvedBranch}') does not match existing college records for Roll Number ${normalizedRoll} ('${existingStudent.department}').`,
        });
      }

      if (Number(existingStudent.semester) !== semesterNum) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `The provided Semester (${semesterNum}) does not match existing college records for Roll Number ${normalizedRoll} (Semester ${existingStudent.semester}).`,
        });
      }

      // Details match! Link the login account to the existing student record
      const generatedUserId = `USR-${Date.now().toString().slice(-6)}`;
      const userDoc = await User.create(
        [
          {
            userId: generatedUserId,
            name: existingStudent.studentName,
            email: studentEmail,
            password: rawPassword,
            role: 'student',
            student: existingStudent._id,
          },
        ],
        session ? { session } : {}
      );

      const createdUser = Array.isArray(userDoc) ? userDoc[0] : userDoc;
      createdUserId = createdUser._id;

      // Update existing student record with user linkage
      existingStudent.user = createdUser._id;
      existingStudent.userId = createdUser.userId;
      if (session) {
        await existingStudent.save({ session });
      } else {
        await existingStudent.save();
      }

      finalStudentRecord = existingStudent;
    } else {
      // -----------------------------------------------------------------------
      // CASE 2: Student Record Does NOT Exist
      // Create new Student record and link to User account
      // -----------------------------------------------------------------------
      const generatedUserId = `USR-${Date.now().toString().slice(-6)}`;
      const generatedStudentId = `STU-${Date.now().toString().slice(-6)}`;

      const newStudentDoc = await Student.create(
        [
          {
            studentId: generatedStudentId,
            rollNumber: normalizedRoll,
            studentName: rawName,
            department: resolvedBranch,
            semester: semesterNum,
            section: rawSection,
            userId: generatedUserId,
          },
        ],
        session ? { session } : {}
      );

      const createdStudent = Array.isArray(newStudentDoc) ? newStudentDoc[0] : newStudentDoc;
      createdStudentId = createdStudent._id;

      const userDoc = await User.create(
        [
          {
            userId: generatedUserId,
            name: rawName,
            email: studentEmail,
            password: rawPassword,
            role: 'student',
            student: createdStudent._id,
          },
        ],
        session ? { session } : {}
      );

      const createdUser = Array.isArray(userDoc) ? userDoc[0] : userDoc;
      createdUserId = createdUser._id;

      // Link student to User ObjectId
      createdStudent.user = createdUser._id;
      if (session) {
        await createdStudent.save({ session });
      } else {
        await createdStudent.save();
      }

      finalStudentRecord = createdStudent;
    }

    if (session) {
      await session.commitTransaction();
    }

    const linkedUser = await User.findById(createdUserId);
    const token = generateToken(linkedUser.userId, linkedUser.role);

    return res.status(201).json({
      success: true,
      message: 'Student registration successful',
      token,
      user: {
        userId: linkedUser.userId,
        name: linkedUser.name,
        email: linkedUser.email,
        role: linkedUser.role,
        student: finalStudentRecord._id,
      },
      student: finalStudentRecord,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}
    } else {
      // Manual compensation cleanup if transaction was unavailable
      if (createdUserId) {
        try {
          await User.deleteOne({ _id: createdUserId });
        } catch {}
      }
      if (createdStudentId) {
        try {
          await Student.deleteOne({ _id: createdStudentId });
        } catch {}
      }
    }

    // Handle MongoDB duplicate key errors (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      let friendlyMsg = `A record with this ${field} already exists.`;
      if (field === 'rollNumber') {
        friendlyMsg = `Roll Number is already registered.`;
      } else if (field === 'email') {
        friendlyMsg = `An account with this email already exists.`;
      } else if (field === 'user' || field === 'userId') {
        friendlyMsg = `This student record is already linked to another user account.`;
      }
      return res.status(400).json({
        success: false,
        message: friendlyMsg,
      });
    }

    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * @route   POST /login
 * @desc    Authenticate user via Email OR Roll Number & return JWT token + linked student profile
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

    // 2. If not found directly by email, check if input is a Student Roll Number
    let studentProfile = null;
    if (!user) {
      const studentDoc = await Student.findOne({
        $or: [
          { rollNumber: rawInput.toUpperCase() },
          { studentId: rawInput.toUpperCase() },
        ],
      });

      if (studentDoc) {
        studentProfile = studentDoc;
        if (studentDoc.user) {
          user = await User.findById(studentDoc.user);
        }
        if (!user && studentDoc.userId) {
          user = await User.findOne({ userId: studentDoc.userId });
        }
        if (!user) {
          user = await User.findOne({ name: studentDoc.studentName });
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, roll number, or password',
      });
    }

    // Verify password
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
      if (user.student) {
        studentProfile = await Student.findById(user.student);
      }
      if (!studentProfile) {
        studentProfile = await Student.findOne({ user: user._id });
      }
      if (!studentProfile) {
        studentProfile = await Student.findOne({ userId: user.userId });
      }
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
        student: studentProfile ? studentProfile._id : null,
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
  VALID_BRANCHES,
  normalizeBranch,
};
