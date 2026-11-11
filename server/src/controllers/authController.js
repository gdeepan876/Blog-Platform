const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      }

      // Check unique email
      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      // First user registered can automatically be an admin if none exists
      const userCount = UserModel.count();
      const role = userCount === 0 ? 'admin' : 'user';

      const passwordHash = await bcrypt.hash(password, 10);
      const user = UserModel.create({
        name,
        email,
        passwordHash,
        role
      });

      const safeUser = UserModel.sanitize(user);
      const token = generateToken(safeUser);
      setAuthCookie(res, token);

      return res.status(201).json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const safeUser = UserModel.sanitize(user);
      const token = generateToken(safeUser);
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static logout(req, res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  }

  static getMe(req, res) {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  }
}

module.exports = AuthController;

