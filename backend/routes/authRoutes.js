import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp')
      .isLength({ min: 4, max: 4 })
      .withMessage('OTP must be exactly 4 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  validate,
  verifyOtp
);

router.post(
  '/resend-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  validate,
  resendOtp
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  validate,
  forgotPassword
);

router.get(
  '/verify-reset-token',
  [
    query('token').notEmpty().withMessage('Token is required'),
  ],
  validate,
  verifyResetToken
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

router.get('/me', protect, getMe);

export default router;
