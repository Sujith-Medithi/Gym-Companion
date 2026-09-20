import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Habit from '../models/Habit.js';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/email.js';
import { logger } from '../utils/logger.js';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '951810059300-9ospsbqndvtqi85h4ji54kg1k3c630s7.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────

/**
 * Generate a JWT and set it as an httpOnly cookie on the response.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        age: user.age,
        voiceFeedback: user.voiceFeedback,
        theme: user.theme,
        dashboardBackground: user.dashboardBackground,
        notifications: user.notifications,
      },
    });
};

/**
 * Validate email format.
 */
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// ─── Controllers ────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check for existing user
    let user = await User.findOne({ email }).select('+password');
    if (user) {
      if (user.password) {
        // Already has a password
        logger.warn(`Registration rejected — email already registered: ${email}`);
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
      // Link account: add password to existing Google-only user
      user.password = password;
      user.name = name; // Optionally update name
      await user.save(); // pre-save hook will hash the password
      logger.info(`Account linked with password for user: ${user.email}`, { userId: user._id });
    } else {
      // Create user (password is hashed via pre-save hook)
      user = await User.create({ name, email, password });
      logger.info(`New user registered successfully: ${user.email}`, { userId: user._id });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error(`Register error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Server error — please try again later' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Find user and explicitly include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn(`Login failed — user not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed — invalid password attempt for: ${email}`, { userId: user._id });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    logger.info(`User logged in successfully: ${user.email}`, { userId: user._id });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Server error — please try again later' });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Public
 */
export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  logger.info('User logged out', { userId: req.user?.id || 'session' });
  res
    .status(200)
    .cookie('token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      expires: new Date(0),
    })
    .json({ success: true, message: 'Logged out successfully' });
};

/**
 * @route   POST /api/auth/google
 * @desc    Login or register user via Google OAuth
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'No Google credential provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      logger.info(`Google authentication success for existing user: ${email}`, { userId: user._id, googleId });
    } else {
      user = await User.create({
        googleId,
        email,
        name,
      });
      logger.info(`Google authentication success for new user: ${email}`, { userId: user._id, googleId });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`Google Auth error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Google Authentication failed' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActive === false) {
      res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        age: user.age,
        voiceFeedback: user.voiceFeedback,
        theme: user.theme,
        dashboardBackground: user.dashboardBackground,
        notifications: user.notifications,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error — please try again later' });
  }
};

/**
 * @route   PUT /api/auth/settings
 * @desc    Update user settings and profile
 * @access  Private
 */
export const updateSettings = async (req, res) => {
  try {
    const { name, height, weight, age, voiceFeedback, theme, dashboardBackground, notifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name !== undefined) user.name = name;

    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (age !== undefined) user.age = Number(age);
    if (voiceFeedback !== undefined) user.voiceFeedback = Boolean(voiceFeedback);
    if (theme !== undefined) user.theme = theme;
    if (dashboardBackground !== undefined) user.dashboardBackground = dashboardBackground;
    
    if (notifications !== undefined) {
      user.notifications = {
        ...user.notifications,
        ...notifications
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        age: user.age,
        voiceFeedback: user.voiceFeedback,
        theme: user.theme,
        dashboardBackground: user.dashboardBackground,
        notifications: user.notifications,
      },
    });
  } catch (error) {
    console.error('UpdateSettings error:', error);
    res.status(500).json({ message: 'Server error — please try again later' });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate error:', error);
    res.status(500).json({ message: 'Failed to deactivate account' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await Workout.deleteMany({ user: req.user.id });
    await Habit.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request a password reset code
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const user = await User.findOne({ email });
    // Do not reveal if email doesn't exist
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset code has been sent.' });
    }

    // Generate 6 digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash code before saving
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordCode = await bcrypt.hash(resetCode, salt);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetCodeAttempts = 0;
    
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Here is your 6-digit verification code:</p>
      <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px;">${resetCode}</h2>
      <p>This code is valid for 10 minutes.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Password Reset Code',
        html: message,
      });

      res.status(200).json({ success: true, message: 'If that email is registered, a reset code has been sent.' });
    } catch (err) {
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      user.resetCodeAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'There was an error sending the email. Try again later.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verify the 6-digit reset code
 * @access  Public
 */
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ 
      email, 
      resetPasswordExpires: { $gt: Date.now() } 
    }).select('+resetPasswordCode +resetCodeAttempts');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    if (user.resetCodeAttempts >= 5) {
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      user.resetCodeAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Too many attempts. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
    
    if (!isMatch) {
      user.resetCodeAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid code' });
    }

    // Code is valid. We don't clear it yet, we wait for the reset password step.
    res.status(200).json({ success: true, message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using the code
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    
    if (!email || !code || !password) {
      return res.status(400).json({ message: 'Please provide email, code, and new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ 
      email, 
      resetPasswordExpires: { $gt: Date.now() } 
    }).select('+resetPasswordCode +resetCodeAttempts +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    if (user.password) {
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password cannot be the same as your old password' });
      }
    }

    if (user.resetCodeAttempts >= 5) {
      return res.status(400).json({ message: 'Too many attempts. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
    
    if (!isMatch) {
      user.resetCodeAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid code' });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetCodeAttempts = undefined;
    
    await user.save();

    // Log user in automatically
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
