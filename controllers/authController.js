import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { USER_ROLES } from '../models/User.js';

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

const sendTokenResponse = (user, res, statusCode = 200) => {
  const token = signToken(user._id);
  const safeUser = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    xp: user.xp,
    badges: user.badges,
    solvedProblems: user.solvedProblems,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return res.status(statusCode).json({ token, user: safeUser });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const user = await User.create({ username, email, password, role });
    return sendTokenResponse(user, res, 201);
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return sendTokenResponse(user, res);
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        badges: user.badges,
        solvedProblems: user.solvedProblems,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // For security, return success even if user does not exist
      return res.status(200).json({ message: 'If that email exists, reset instructions were sent.' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Mock email sending
    // eslint-disable-next-line no-console
    console.log(`[Email Mock] Password reset for ${email}: ${resetURL}`);

    return res.status(200).json({ message: 'Password reset token sent to email' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate password reset', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendTokenResponse(user, res);
  } catch (error) {
    return res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};