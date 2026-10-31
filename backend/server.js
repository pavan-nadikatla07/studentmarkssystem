require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resultRoutes = require('./routes/resultRoutes');

// Initialize Express App
const app = express();

// Connect to MongoDB Atlas / Local MongoDB
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging middleware for debugging and viva demonstration
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API Health Check
app.get('/', (req, res) => {
  res.json({
    project: 'Online Examination Result Portal API',
    status: 'Active',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Mount Routes matching REST API specifications in PDF
// PDF specifies:
// POST /register
// POST /login
// GET /students, POST /students, PUT /students/:id, DELETE /students/:id
// GET /results, POST /results, PUT /results/:id, DELETE /results/:id
app.use('/api/auth', authRoutes);
// Direct mounts to fulfill root /register and /login if called without prefix
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/results', resultRoutes);

// Direct root fallbacks so requests work whether called with /api prefix or directly
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/results', resultRoutes);
app.use('/', authRoutes);

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Examination Result Portal Server running`);
  console.log(` Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` API URL: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
