/**
 * gradingConfig.js
 * Isolated grading configuration and helper functions for frontend display.
 */

export const GRADING_SCALE = [
  { min: 90, max: 100, grade: 'O', point: 10, label: 'Outstanding', color: '#059669', bg: '#d1fae5' },
  { min: 80, max: 89, grade: 'A+', point: 9, label: 'Excellent', color: '#2563eb', bg: '#dbeafe' },
  { min: 70, max: 79, grade: 'A', point: 8, label: 'Very Good', color: '#0284c7', bg: '#e0f2fe' },
  { min: 60, max: 69, grade: 'B+', point: 7, label: 'Good', color: '#4f46e5', bg: '#e0e7ff' },
  { min: 50, max: 59, grade: 'B', point: 6, label: 'Above Average', color: '#d97706', bg: '#fef3c7' },
  { min: 40, max: 49, grade: 'P', point: 5, label: 'Pass', color: '#16a34a', bg: '#dcfce7' },
  { min: 0, max: 39, grade: 'F', point: 0, label: 'Fail', color: '#dc2626', bg: '#fee2e2' },
];

export const calculateGradeFrontend = (marks) => {
  const num = Number(marks);
  if (isNaN(num)) return '-';
  for (const tier of GRADING_SCALE) {
    if (num >= tier.min && num <= tier.max) {
      return tier.grade;
    }
  }
  return 'F';
};

export const getGradeBadgeStyle = (grade) => {
  const item = GRADING_SCALE.find((t) => t.grade === grade);
  if (item) {
    return { color: item.color, backgroundColor: item.bg, borderColor: item.color };
  }
  return { color: '#475569', backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' };
};
