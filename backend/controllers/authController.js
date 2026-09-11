import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';

/**
 * Generate a secure 4-digit OTP
 */
const generate4DigitOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * @desc    Initiate registration and send 4-digit OTP to email
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate 4-digit OTP
    const otp = generate4DigitOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiration

    // Invalidate any previous OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Store pending registration with hashed OTP
    await Otp.create({
      email: normalizedEmail,
      otpHash,
      name: name.trim(),
      password,
      expiresAt,
    });

    // Send OTP via email
    console.log(`[AUTH REGISTER] Initiating OTP email dispatch to ${normalizedEmail}...`);
    try {
      await sendOTPEmail(normalizedEmail, otp);
      console.log(`[AUTH REGISTER] OTP email dispatched successfully to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`[AUTH REGISTER] Failed to send OTP email to ${normalizedEmail}:`, emailErr.message);
      return res.status(500).json({
        success: false,
        message: emailErr.message || 'Failed to send verification email',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing registration',
    });
  }
};

/**
 * @desc    Verify OTP and create permanent user account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find pending OTP record
    const otpDoc = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new code.',
      });
    }

    // Check expiration
    if (new Date() > otpDoc.expiresAt) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new code.',
      });
    }

    // Check if OTP was already marked as verified/used
    if (otpDoc.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'OTP has already been used. Please request a new code.',
      });
    }

    // Check attempt limits (max 5 attempts)
    if (otpDoc.attempts >= 5) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.',
      });
    }

    // Verify OTP hash
    const isMatch = await bcrypt.compare(cleanOtp, otpDoc.otpHash);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check again if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create the permanent user account (User model pre-save hook securely hashes password with bcrypt)
    const user = await User.create({
      name: otpDoc.name,
      email: otpDoc.email,
      password: otpDoc.password,
    });

    // Clean up OTP record
    await Otp.deleteMany({ email: normalizedEmail });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying OTP',
    });
  }
};

/**
 * @desc    Resend 4-digit OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Find existing pending OTP record
    const otpDoc = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found. Please register again.',
      });
    }

    // Generate new 4-digit OTP
    const newOtp = generate4DigitOTP();
    const newOtpHash = await bcrypt.hash(newOtp, 10);

    // Reset OTP record with new hash, new 1-minute timer, and reset attempts
    otpDoc.otpHash = newOtpHash;
    otpDoc.expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    otpDoc.attempts = 0;
    otpDoc.isVerified = false;
    await otpDoc.save();

    // Send new OTP email
    console.log(`[AUTH RESEND_OTP] Initiating OTP email dispatch to ${normalizedEmail}...`);
    try {
      await sendOTPEmail(normalizedEmail, newOtp);
      console.log(`[AUTH RESEND_OTP] OTP email dispatched successfully to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`[AUTH RESEND_OTP] Failed to send OTP email to ${normalizedEmail}:`, emailErr.message);
      return res.status(500).json({
        success: false,
        message: emailErr.message || 'Failed to resend verification email',
      });
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
      data: {
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resending OTP',
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Generic response message to avoid revealing account existence
    const genericSuccessMessage = 'If an account exists for this email, a password reset link has been sent.';

    if (!user) {
      console.log(`[AUTH FORGOT_PASSWORD] No user found for ${normalizedEmail}. Returning generic success response.`);
      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // Generate secure random reset token
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // Hash token with SHA256 before saving to database
    const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // Set token and expiration (1 hour)
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Construct reset link URL
    const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientOrigin.replace(/\/+$/, '')}/reset-password?token=${rawResetToken}`;

    // Send email asynchronously
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      console.error(`[AUTH FORGOT_PASSWORD] Failed to deliver reset email to ${user.email}:`, emailErr.message);
      // Clean up token on email dispatch failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: genericSuccessMessage,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
    });
  }
};

/**
 * @desc    Verify if a reset token is valid and active
 * @route   GET /api/auth/verify-reset-token
 * @access  Public
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.toString().trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link. Please request a new one.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify reset link',
    });
  }
};

/**
 * @desc    Reset user password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.toString().trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link. Please request a new one.',
      });
    }

    // Set new password (User pre-save hook will hash it with bcrypt salt 12)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`✅ [AUTH RESET_PASSWORD] Password reset successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password',
    });
  }
};
