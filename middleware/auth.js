const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Staff = require('../models/Staff');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check User collection first
    let user = await User.findById(decoded.id);

    // If not found, check Staff collection
    if (!user) {
      const staff = await Staff.findById(decoded.id);
      if (staff) {
        user = staff;
        // Normalize role for authorization middleware
        user.role = staff.staffsRole?.en || 'staff';
        // Normalize name, email, and profileImage for consistency
        user.name = staff.staffsName?.en || "Staff";
        user.email = staff.staffsEmail;
        user.profileImage = staff.staffsImage;
      }
    }

    if (!user) {
      return next(new ErrorResponse('No user found with this ID', 404));
    }

    // Check if account is Inactive (specifically for Staff)
    if (user.status === 'Inactive') {
      return next(new ErrorResponse('Your account is Inactive. Please contact admin.', 401));
    }


    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Super Admin and Admin always have access
    const roleLower = req.user.role?.toLowerCase();
    if (roleLower === 'super admin' || roleLower === 'admin') {
      return next();
    }

    // Allow any staff member (non-user role) to access admin routes
    // This assumes that 'user' is the only restricted public role.
    if (req.user.role !== 'user') {
      return next();
    }

    return next(
      new ErrorResponse(
        `User role ${req.user.role} is not authorized to access this route`,
        403
      )
    );
  };
};

// Middleware to check if email is verified
exports.requireVerifiedEmail = async (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new ErrorResponse('Please verify your email to access this route', 403)
    );
  }
  next();
};

// Middleware to check if user is inactive (even on public routes if token is provided)
exports.checkInactive = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(); // Proceed as guest
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Quick status check from DB
    const [user, staff] = await Promise.all([
      User.findById(decoded.id).select('status'),
      Staff.findById(decoded.id).select('status')
    ]);

    const activeUser = user || staff;

    if (activeUser && activeUser.status === 'Inactive') {
      return next(new ErrorResponse('Your account is Inactive. Please contact admin.', 401));
    }

    next();
  } catch (err) {
    next(); // Token invalid, proceed as guest
  }
};