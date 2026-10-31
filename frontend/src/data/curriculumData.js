/**
 * curriculumData.js - Official V23 Regulation Branch-Semester Curriculum Dataset
 * 
 * Source of Truth: Supplied Curriculum Specifications.
 * Rules:
 *  - Official course codes and titles preserved exactly.
 *  - Words like "Lab" strictly preserved.
 *  - Courses without official codes use safe internal IDs (e.g. "INTERNAL-..."), without fabricating codes.
 *  - Sem VII contains ONLY "Project".
 *  - Sem VIII contains ONLY "Internship".
 */

export const BRANCHES = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'EEE', name: 'Electrical & Electronics' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' },
];

export const ROMAN_SEMESTERS = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
};

/**
 * Maps department string to branch code
 */
export const getBranchFromDepartment = (department = '') => {
  const dept = department.toLowerCase();
  if (dept.includes('computer') || dept.includes('cse')) return 'CSE';
  if ((dept.includes('electronic') && dept.includes('communication')) || dept.includes('ece')) return 'ECE';
  if (dept.includes('electrical') || dept.includes('eee')) return 'EEE';
  if (dept.includes('mech')) return 'MECH';
  if (dept.includes('civil')) return 'CIVIL';
  return 'CSE';
};

/**
 * Raw Curriculum Data organized by Branch and Semester
 */
export const CURRICULUM_DATA = {
  CSE: {
    1: [
      { code: 'V23CMT01', name: 'Basic Civil & Mechanical Engineering' },
      { code: 'V23CHT01', name: 'Applied Chemistry' },
      { code: 'V23MAT01', name: 'Linear Algebra & Calculus' },
      { code: 'V23CST01', name: 'Introduction to Programming' },
      { code: 'V23MET01', name: 'Engineering Graphics' },
      { code: 'V23CSL02', name: 'IT Workshop Lab' },
      { code: 'V23MEL01', name: 'Engineering Workshop Lab' },
      { code: 'V23CHL01', name: 'Applied Chemistry Lab' },
      { code: 'V23CSL01', name: 'Computer Programming Lab' },
      { code: 'V23SPT01', name: 'NSS/NCC/Scouts & Guides/Community Service' },
      { code: null, internalId: 'INTERNAL-CSE-S1-ENG-CERT', name: 'English Certificate Course' },
    ],
    2: [
      { code: 'V23MAT02', name: 'Differential Equations & Vector Calculus' },
      { code: 'V23PHT01', name: 'Engineering Physics' },
      { code: 'V23ENT01', name: 'Communicative English' },
      { code: 'V23EET01', name: 'Basic Electrical and Electronics Engineering' },
      { code: 'V23CST02', name: 'Data Structures' },
      { code: 'V23PHL01', name: 'Engineering Physics Lab' },
      { code: 'V23ENL01', name: 'Communicative English Lab' },
      { code: 'V23EEL01', name: 'Electrical and Electronics Engineering Workshop Lab' },
      { code: 'V23CSL03', name: 'Data Structures Lab' },
      { code: 'V23SPT02', name: 'Health and Wellness, Yoga and Sports' },
    ],
    3: [
      { code: 'V23MAT05', name: 'Discrete Mathematics & Graph Theory' },
      { code: 'V23MBT51', name: 'Managerial Economics and Financial Analysis' },
      { code: 'V23CST03', name: 'Digital Logic & Computer Organization' },
      { code: 'V23CST04', name: 'Advanced Data Structures & Algorithm Analysis' },
      { code: 'V23CST05', name: 'Object Oriented Programming Through Java' },
      { code: 'V23CSL04', name: 'Advanced Data Structures and Algorithm Analysis Lab' },
      { code: 'V23CSL05', name: 'Object Oriented Programming Through Java Lab' },
      { code: 'V23CSSE01', name: 'Python Programming Lab' },
      { code: 'V23MET09', name: 'Design Thinking & Innovation' },
      { code: 'V23ENT02', name: 'Professional Communication Skills - I' },
    ],
    4: [
      { code: 'V23MBT53', name: 'Universal Human Values' },
      { code: 'V23MAT07', name: 'Probability & Statistics' },
      { code: 'V23CST06', name: 'Operating Systems' },
      { code: 'V23CST07', name: 'Database Management Systems' },
      { code: 'V23CST08', name: 'Software Engineering' },
      { code: 'V23CSL06', name: 'Operating Systems Lab' },
      { code: 'V23CSL07', name: 'Database Management Systems Lab' },
      { code: 'V23CSSE02', name: 'Full Stack Development – I' },
      { code: 'V23CEAC01', name: 'Environmental Science' },
      { code: 'V23ENT03', name: 'Professional Communication Skills - II' },
      { code: 'V23COSP01', name: 'Mandatory Community Service Project' },
      { code: null, internalId: 'INTERNAL-CSE-S4-MINOR', name: 'Minor Course' },
      { code: null, internalId: 'INTERNAL-CSE-S4-HONORS', name: 'Honors Course' },
    ],
    5: [
      { code: 'V23CST09', name: 'Data Warehousing and Data Mining' },
      { code: 'V23CST10', name: 'Computer Networks' },
      { code: 'V23CST11', name: 'Automata and Compiler Design' },
      // Professional Elective-I
      { code: 'V23CSTPE01', name: 'Object Oriented Analysis and Design' },
      { code: 'V23CSTPE02', name: 'Artificial Intelligence' },
      { code: 'V23CSTPE03', name: 'Microprocessors & Microcontrollers' },
      { code: 'V23CSTPE04', name: 'Quantum Computing' },
      { code: null, internalId: 'INTERNAL-CSE-S5-MOOC-PE1', name: 'Twelve-week MOOC course recommended by BoS' },
      // Open Elective-I
      { code: null, internalId: 'INTERNAL-CSE-S5-OE1', name: 'Entrepreneurship Development & Venture Creation' },
      // Labs & Other
      { code: 'V23CSL08', name: 'Data Mining Lab' },
      { code: 'V23CSL09', name: 'Computer Networks Lab' },
      { code: 'V23CSSE03', name: 'Full Stack Development-2' },
      // Engineering Science Course
      { code: 'V23CSES01', name: 'Master Coding and Competitive Programming - Part-1' },
      { code: 'V23CSES02', name: 'User Interface Design using Flutter' },
      { code: null, internalId: 'INTERNAL-CSE-S5-SWAYAM', name: 'SWAYAM Plus Android Application Development (with Flutter)' },
      { code: 'V23CSP01', name: 'Evaluation of Community Service Internship' },
      { code: 'V23ENT04', name: 'English for Employability' },
      { code: null, internalId: 'INTERNAL-CSE-S5-MINOR-HONORS', name: 'Minor/Honors selectable subjects' },
    ],
    6: [
      { code: 'V23CST12', name: 'Machine Learning' },
      { code: 'V23CST13', name: 'Cloud Computing' },
      { code: 'V23CST14', name: 'Cryptography & Network Security' },
      // Professional Elective-II
      { code: 'V23CSTPE05', name: 'Software Testing Methodologies' },
      { code: 'V23CSTPE06', name: 'Cyber Security' },
      { code: 'V23CSTPE07', name: 'DevOps' },
      { code: 'V23CSTPE08', name: 'Mobile Adhoc Networks' },
      { code: null, internalId: 'INTERNAL-CSE-S6-MOOC-PE2', name: 'Twelve-week MOOC course recommended by BoS' },
      // Professional Elective-III
      { code: 'V23CSTPE09', name: 'Software Project Management' },
      { code: 'V23CSTPE10', name: 'Natural Language Processing' },
      { code: 'V23CSTPE11', name: 'Big Data Analytics' },
      { code: 'V23CSTPE12', name: 'Distributed Operating System' },
      { code: null, internalId: 'INTERNAL-CSE-S6-MOOC-PE3', name: 'Twelve-week MOOC course recommended by BoS (PE-III)' },
      // Open Elective-II
      { code: null, internalId: 'INTERNAL-CSE-S6-OE2', name: 'Open Elective-II' },
      { code: 'V23CSL10', name: 'Cloud Computing Lab' },
      { code: 'V23CSL11', name: 'Machine Learning Lab using Python' },
      { code: 'V23CSSE04', name: 'Master Coding and Competitive Programming - Part-2' },
      { code: null, internalId: 'INTERNAL-CSE-S6-TPW', name: 'Technical Paper Writing & IPR' },
      { code: null, internalId: 'INTERNAL-CSE-S6-MINOR-HONORS', name: 'Minor/Honors selectable subjects' },
    ],
    // Special Rules
    7: [{ code: 'PROJECT', internalId: 'PROJECT', name: 'Project' }],
    8: [{ code: 'INTERNSHIP', internalId: 'INTERNSHIP', name: 'Internship' }],
  },

  ECE: {
    1: [
      { code: 'V23ENT01', name: 'Communicative English' },
      { code: 'V23PHT01', name: 'Engineering Physics' },
      { code: 'V23MAT01', name: 'Linear Algebra & Calculus' },
      { code: 'V23EET01', name: 'Basic Electrical and Electronics Engineering' },
      { code: 'V23CST01', name: 'Introduction to Programming' },
      { code: 'V23ENL01', name: 'Communicative English Lab' },
      { code: 'V23PHL01', name: 'Engineering Physics Lab' },
      { code: 'V23EEL01', name: 'Electrical and Electronics Engineering Workshop' },
      { code: 'V23CSL01', name: 'Computer Programming Lab' },
      { code: 'V23SPT02', name: 'Health and Wellness, Yoga and Sports' },
    ],
    2: [
      { code: 'V23MAT02', name: 'Differential Equations & Vector Calculus' },
      { code: 'V23CHT02', name: 'Engineering Chemistry' },
      { code: 'V23CMT01', name: 'Basic Civil & Mechanical Engineering' },
      { code: 'V23MET01', name: 'Engineering Graphics' },
      { code: 'V23ECT01', name: 'Network Analysis' },
      { code: 'V23MEL01', name: 'Engineering Workshop' },
      { code: 'V23ECL01', name: 'Network Analysis Lab' },
      { code: 'V23CHL02', name: 'Engineering Chemistry Lab' },
      { code: 'V23CSL02', name: 'IT Workshop' },
      { code: 'V23SPT03', name: 'NSS/NCC/Scouts & Guides/Community Service' },
    ],
    3: [
      { code: 'V23ECT02', name: 'Probability Theory and Stochastic Process' },
      { code: 'V23MBT53', name: 'Universal Human Values – Understanding Harmony and Ethical Human Conduct' },
      { code: 'V23ECT03', name: 'Signals and Systems' },
      { code: 'V23ECT04', name: 'Electronic Devices and Circuits' },
      { code: 'V23ECT05', name: 'Switching Theory and Logic Design' },
      { code: 'V23ECL02', name: 'Electronic Devices and Circuits Lab' },
      { code: 'V23ECL03', name: 'Switching Theory and Logic Design Lab' },
      { code: 'V23CSSE11', name: 'Data Structures using Python' },
      { code: 'V23CEAC01', name: 'Environmental Science' },
    ],
    4: [
      { code: 'V23MBT51', name: 'Managerial Economics and Financial Analysis' },
      { code: 'V23EET08', name: 'Control Systems' },
      { code: 'V23ECT06', name: 'Electromagnetic Waves and Transmission Lines' },
      { code: 'V23ECT07', name: 'Electronic Circuit Analysis' },
      { code: 'V23ECT08', name: 'Analog Communications' },
      { code: 'V23ECL04', name: 'Signals and Systems Lab' },
      { code: 'V23ECL05', name: 'Electronic Circuit Analysis Lab' },
      { code: 'V23MBT54', name: 'Soft Skills' },
      { code: 'V23MET09', name: 'Design Thinking & Innovation' },
      { code: 'V23COSP01', name: 'Mandatory Community Service Project Internship of 8 weeks' },
    ],
    5: [
      { code: 'V23ECT09', name: 'Analog & Digital IC Applications' },
      { code: 'V23ECT10', name: 'Digital Communications' },
      { code: 'V23ECT11', name: 'Antennas and Wave Propagation' },
      // Professional Elective-I
      { code: 'V23ECT12', name: 'Digital System Design through HDL' },
      { code: 'V23ECT13', name: 'Electronic Measurements and Instrumentation' },
      { code: 'V23ECT14', name: 'Bio Medical Instrumentation' },
      { code: 'V23CSTPE13', name: 'Computer Organizations and Architecture' },
      // Open Elective-I
      { code: null, internalId: 'INTERNAL-ECE-S5-OE1', name: 'Open Elective-I' },
      { code: 'V23ECL06', name: 'Analog & Digital IC Applications Lab' },
      { code: 'V23ECL07', name: 'Analog and Digital Communications Lab' },
      { code: 'V23ECSE02', name: 'Applications of LabVIEW for Instrumentation & Communications' },
      { code: 'V23ECL08', name: 'Design of PCB / Antennas Lab' },
      { code: 'V23COSP01', name: 'Evaluation of Community Service Internship' },
      { code: 'VV23EEL08', name: 'Skill Enhancement Course' },
    ],
    6: [
      { code: 'V23ECT15', name: 'VLSI Design' },
      { code: 'V23ECT16', name: 'Microprocessors & Microcontrollers' },
      { code: 'V23ECT17', name: 'Digital Signal Processing' },
      // Professional Elective-II
      { code: 'V23ECT18', name: 'Analog IC Design' },
      { code: 'V23ECT19', name: 'Satellite Communication' },
      { code: 'V23ECT20', name: 'Smart and Wireless Instrumentation' },
      { code: 'V23AITPE07', name: 'Machine Learning' },
      // Professional Elective-III
      { code: 'V23ECT21', name: 'Optical Communications' },
      { code: 'V23ECT22', name: 'Microwave Engineering' },
      { code: 'V23ECT23', name: 'Embedded Systems' },
      { code: 'V23AITPE08', name: 'Artificial Intelligence' },
      // Open Elective-II
      { code: null, internalId: 'INTERNAL-ECE-S6-OE2', name: 'Open Elective-II' },
      { code: 'V23ECL09', name: 'VLSI Design Lab' },
      { code: 'V23ECL10', name: 'Microprocessors & Microcontrollers Lab' },
      { code: 'V23AISE01', name: 'Machine Learning Lab' },
      { code: 'V23ENT06', name: 'Research Methodology and IPR' },
    ],
    // Special Rules
    7: [{ code: 'PROJECT', internalId: 'PROJECT', name: 'Project' }],
    8: [{ code: 'INTERNSHIP', internalId: 'INTERNSHIP', name: 'Internship' }],
  },

  EEE: {
    1: [
      { code: 'V23ENT01', name: 'Communicative English' },
      { code: 'V23PHT01', name: 'Engineering Physics' },
      { code: 'V23MAT01', name: 'Linear Algebra & Calculus' },
      { code: 'V23EET01', name: 'Basic Electrical & Electronics Engineering' },
      { code: 'V23CST01', name: 'Introduction to Programming' },
      { code: 'V23ENL01', name: 'Communicative English Lab' },
      { code: 'V23PHL01', name: 'Physics Lab' },
      { code: 'V23EEL01', name: 'Electrical & Electronics Engineering Workshop' },
      { code: 'V23CSL01', name: 'Computer Programming Lab' },
      { code: 'V23SPT02', name: 'Health and Wellness, Yoga and Sports' },
    ],
    2: [
      { code: 'V23MAT02', name: 'Differential Equations & Vector Calculus' },
      { code: 'V23CHT01', name: 'Applied Chemistry' },
      { code: 'V23CMT01', name: 'Basic Civil & Mechanical Engineering' },
      { code: 'V23EET02', name: 'Electrical Circuit Analysis – I' },
      { code: 'V23MET01', name: 'Engineering Graphics' },
      { code: 'V23CSL02', name: 'IT Workshop' },
      { code: 'V23MEL01', name: 'Engineering Workshop' },
      { code: 'V23CHL01', name: 'Applied Chemistry Lab' },
      { code: 'V23EEL02', name: 'Electrical Circuits Lab' },
      { code: 'V23SPTO1', name: 'NSS/NCC/Scouts & Guides/Community Services' },
    ],
    3: [
      { code: 'V23MAT04', name: 'Transform Techniques & Numerical Methods' },
      { code: 'V23MBT53', name: 'Universal Human Values – Understanding Harmony' },
      { code: 'V23EET03', name: 'Electromagnetic Field Theory' },
      { code: 'V23EET04', name: 'Electrical Circuit Analysis-II' },
      { code: 'V23EET05', name: 'DC Machines & Transformers' },
      { code: 'V23EEL03', name: 'Electrical Circuit Analysis-II and Simulation Lab' },
      { code: 'V23EEL04', name: 'DC Machines & Transformers Lab' },
      { code: 'V23CSSE12', name: 'Data Structures Lab' },
      { code: 'V23CEAC01', name: 'Environmental Studies' },
    ],
    4: [
      { code: 'V23MBT51', name: 'Managerial Economics & Financial Analysis' },
      { code: 'V23EC0T09', name: 'Analog Circuits' },
      { code: 'V23EET06', name: 'Power Systems-I' },
      { code: 'V23EET07', name: 'Induction and Synchronous Machines' },
      { code: 'V23EET08', name: 'Control Systems' },
      { code: 'V23EEL05', name: 'Induction and Synchronous Machines Lab' },
      { code: 'V23EEL06', name: 'Control Systems Lab' },
      { code: 'V23CSSE01', name: 'Python Programming Lab' },
      { code: 'V23MET09', name: 'Design Thinking & Innovation' },
    ],
    5: [
      { code: 'V23EET09', name: 'Power Electronics' },
      { code: 'V23ECT24', name: 'Digital Circuits (BOS ECE)' },
      // Professional Elective-I
      { code: 'V23EET11', name: 'Advanced Control Systems' },
      { code: 'V23EET12', name: 'Renewable and Distributed Energy Technologies' },
      { code: 'V23EET13', name: 'Programmable Logic Controllers' },
      { code: 'V23EET14', name: 'Smart Grid Technologies' },
      // Open Elective-I
      { code: null, internalId: 'INTERNAL-EEE-S5-OE1', name: 'Open Elective-I' },
      { code: 'V23EEL07', name: 'Power Electronics and Simulation Lab' },
      { code: 'V23ECL11', name: 'Analog and Digital Circuits Lab (BOS ECE)' },
      { code: 'VV23EEL08', name: 'Skill Enhancement Course' },
      { code: 'V23EEL09', name: 'Tinkering Lab' },
      { code: 'V23COSP01', name: 'Evaluation of Community Service Internship' },
    ],
    6: [
      { code: 'V23EET15', name: 'Electrical Measurements and Instrumentation' },
      { code: 'V23ECT16', name: 'Microprocessors and Microcontrollers (BOS ECE)' },
      { code: 'V23EET16', name: 'Power System Analysis' },
      // Professional Elective-II
      { code: 'V23EET17', name: 'Electric Power Quality' },
      { code: 'V23EET18', name: 'Utilization of Electrical Energy' },
      { code: 'V23EET19', name: 'Switchgear and Protection' },
      { code: 'V23ECT17', name: 'Digital Signal Processing (BOS ECE)' },
      // Professional Elective-III
      { code: 'V23EET20', name: 'Electric Drives' },
      { code: 'V23EET21', name: 'Battery Management Systems and Charging Stations' },
      { code: 'V23EET22', name: 'AI Techniques for Power Systems' },
      { code: 'V23EET23', name: 'High Voltage Engineering' },
      // Open Elective-II
      { code: null, internalId: 'INTERNAL-EEE-S6-OE2', name: 'Open Elective-II' },
      { code: 'V23EEL10', name: 'Electrical Measurements and Instrumentation Lab' },
      { code: 'V23ECL10', name: 'Microprocessors and Microcontrollers Lab (BOS ECE)' },
      { code: 'V23EEL11', name: 'IoT Applications for Electrical Engineering Lab' },
      { code: 'V23ENT06', name: 'Research Methodology (BOS English)' },
    ],
    // Special Rules
    7: [{ code: 'PROJECT', internalId: 'PROJECT', name: 'Project' }],
    8: [{ code: 'INTERNSHIP', internalId: 'INTERNSHIP', name: 'Internship' }],
  },

  MECH: {
    1: [
      { code: 'V23ENT01', name: 'Communicative English' },
      { code: 'V23PHT01', name: 'Engineering Physics' },
      { code: 'V23MAT01', name: 'Linear Algebra & Calculus' },
      { code: 'V23EET01', name: 'Basic Electrical and Electronics Engineering' },
      { code: 'V23CST01', name: 'Introduction to Programming' },
      { code: 'V23ENL01', name: 'Communicative English Lab' },
      { code: 'V23PHL01', name: 'Engineering Physics Lab' },
      { code: 'V23EEL01', name: 'Electrical and Electronics Engineering Workshop' },
      { code: 'V23CSL01', name: 'Computer Programming Lab' },
      { code: 'V23SPT02', name: 'Health and Wellness, Yoga and Sports' },
    ],
    2: [
      { code: 'V23MAT02', name: 'Differential Equations & Vector Calculus' },
      { code: 'V23CHT02', name: 'Engineering Chemistry' },
      { code: 'V23CMT01', name: 'Basic Civil & Mechanical Engineering' },
      { code: 'V23MET01', name: 'Engineering Graphics' },
      { code: 'V23MET02', name: 'Engineering Mechanics' },
      { code: 'V23MEL01', name: 'Engineering Workshop' },
      { code: 'V23MEL02', name: 'Engineering Mechanics Lab' },
      { code: 'V23CHL02', name: 'Engineering Chemistry Lab' },
      { code: 'V23CSL02', name: 'IT Workshop' },
      { code: 'V23SPT01', name: 'NSS/NCC/Scouts & Guides/Community Service' },
    ],
    3: [
      { code: 'V23MAT04', name: 'Transform Techniques & Numerical Methods' },
    ],
    4: [],
    5: [],
    6: [],
    // Special Rules
    7: [{ code: 'PROJECT', internalId: 'PROJECT', name: 'Project' }],
    8: [{ code: 'INTERNSHIP', internalId: 'INTERNSHIP', name: 'Internship' }],
  },

  CIVIL: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    // Special Rules
    7: [{ code: 'PROJECT', internalId: 'PROJECT', name: 'Project' }],
    8: [{ code: 'INTERNSHIP', internalId: 'INTERNSHIP', name: 'Internship' }],
  },
};

/**
 * Normalizes subject item ensuring a safe unique identifier
 */
const normalizeSubject = (item, index = 0) => {
  const fallbackId = item.name
    ? `INTERNAL-${item.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().slice(0, 30)}`
    : `INTERNAL-COURSE-${index}`;
  const internalId = item.internalId || item.code || fallbackId;
  const displayCode = item.code ? item.code : '(No official code)';
  return {
    ...item,
    internalId,
    displayCode,
    isSpecial: item.code === 'PROJECT' || item.code === 'INTERNSHIP',
  };
};

/**
 * Get courses for a given Branch and Semester
 */
export const getCoursesForBranchAndSemester = (branch, semester) => {
  const semNum = Number(semester);
  if (!branch || !semNum) return [];

  // Special rule for Semester VII: Project only
  if (semNum === 7) {
    return [
      {
        code: 'PROJECT',
        internalId: 'PROJECT',
        name: 'Project',
        displayCode: 'PROJECT',
        isSpecial: true,
      },
    ];
  }

  // Special rule for Semester VIII: Internship only
  if (semNum === 8) {
    return [
      {
        code: 'INTERNSHIP',
        internalId: 'INTERNSHIP',
        name: 'Internship',
        displayCode: 'INTERNSHIP',
        isSpecial: true,
      },
    ];
  }

  const branchData = CURRICULUM_DATA[branch];
  if (!branchData) return [];

  const semCourses = branchData[semNum] || [];
  return semCourses.map((item, idx) => normalizeSubject(item, idx));
};
