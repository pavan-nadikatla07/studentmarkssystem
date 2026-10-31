/**
 * grading.js - Centralized grading configuration and calculation logic
 * Easily customizable for any university/college grading standard.
 */

const GRADING_SCALE = [
  { min: 90, max: 100, grade: 'O', point: 10, description: 'Outstanding' },
  { min: 80, max: 89, grade: 'A+', point: 9, description: 'Excellent' },
  { min: 70, max: 79, grade: 'A', point: 8, description: 'Very Good' },
  { min: 60, max: 69, grade: 'B+', point: 7, description: 'Good' },
  { min: 50, max: 59, grade: 'B', point: 6, description: 'Above Average' },
  { min: 40, max: 49, grade: 'P', point: 5, description: 'Pass' },
  { min: 0, max: 39, grade: 'F', point: 0, description: 'Fail' },
];

/**
 * Determine letter grade from numerical marks (0 - 100)
 * @param {number} marks
 * @returns {string} letter grade (e.g. 'O', 'A+', 'A', 'B+', 'B', 'P', 'F')
 */
const calculateGrade = (marks) => {
  const num = Number(marks);
  if (isNaN(num) || num < 0 || num > 100) {
    throw new Error('Marks must be a valid number between 0 and 100');
  }

  for (const tier of GRADING_SCALE) {
    if (num >= tier.min && num <= tier.max) {
      return tier.grade;
    }
  }
  return 'F';
};

/**
 * Get grade point corresponding to a letter grade or marks
 * @param {string|number} gradeOrMarks
 * @returns {number} Grade Point (0 - 10)
 */
const getGradePoint = (gradeOrMarks) => {
  if (typeof gradeOrMarks === 'number') {
    const grade = calculateGrade(gradeOrMarks);
    const tier = GRADING_SCALE.find((t) => t.grade === grade);
    return tier ? tier.point : 0;
  }
  const tier = GRADING_SCALE.find((t) => t.grade === gradeOrMarks);
  return tier ? tier.point : 0;
};

/**
 * Calculate SGPA (Semester Grade Point Average) from a list of marks or grades
 * Formula: Sum of grade points / total subjects (scale of 10.00)
 * @param {Array} resultsList
 * @returns {number} SGPA rounded to 2 decimal places
 */
const calculateSGPA = (resultsList) => {
  if (!Array.isArray(resultsList) || resultsList.length === 0) {
    return 0.0;
  }

  const totalPoints = resultsList.reduce((sum, item) => {
    const point = item.grade ? getGradePoint(item.grade) : getGradePoint(item.marks);
    return sum + point;
  }, 0);

  const sgpa = totalPoints / resultsList.length;
  return Number(sgpa.toFixed(2));
};

module.exports = {
  GRADING_SCALE,
  calculateGrade,
  getGradePoint,
  calculateSGPA,
};
