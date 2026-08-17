import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { verifyEmailConnection } from './utils/email.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

// Database & email connection
connectDB();
verifyEmailConnection();

const app = express();

// =========================
// CORS Configuration
// =========================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://task-manager-tau-blond-25.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// =========================
// Body Parser Middleware
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Development Logger
// =========================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =========================
// Health Check
// =========================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

// =========================
// Routes
// =========================

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// =========================
// Error Handling
// =========================

app.use(notFound);
app.use(errorHandler);

// =========================
// Server Initialization
// =========================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`TaskFlow API running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    console.error(`👉 Run: lsof -ti :${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Graceful shutdown on restart (nodemon / SIGINT / SIGTERM)
const gracefulShutdown = () => {
  server.close(() => {
    console.log('TaskFlow server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;