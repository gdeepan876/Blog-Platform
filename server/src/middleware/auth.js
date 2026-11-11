const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_blog_platform_12345';

function extractToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function verifyUserToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.id);
    if (!user) return null;
    return UserModel.sanitize(user);
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  const user = verifyUserToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }

  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    req.user = verifyUserToken(token);
  } else {
    req.user = null;
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator permission required.'
    });
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};

