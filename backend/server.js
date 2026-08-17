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

connectDB();
verifyEmailConnection();

const app = express();

//Middleware
// const corsOrigin =
//   process.env.NODE_ENV === 'development'
//     ? (origin, callback) => {
//         if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
//           callback(null, true);
//         } else {
//           callback(null, process.env.CLIENT_URL || 'http://localhost:5173');
//         }
//       }
//     : process.env.CLIENT_URL || 'http://localhost:5173';

// app.use(
//   cors({
//     origin: corsOrigin,
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
const app = express();

const corsOrigin = [
  'http://localhost:5173',
  'https://task-manager-tau-blond-25.vercel.app'
];

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TaskFlow API running on port ${PORT}`);
});

export default app;
