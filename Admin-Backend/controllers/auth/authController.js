import { Member } from '../../models/members/member.schema.js';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middlewares/async.js';
import jwt from 'jsonwebtoken';

// @desc    Register member
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, roll_number, hall } = req.body;

  // Create member
  const member = await Member.create({
    name,
    email,
    password,
    roll_number,
    hall,
  });

  sendTokenResponse(member, 201, res);
});

// @desc    Login member (ADMIN ONLY)
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password: password ? '***' : 'missing' });

  // Validate email & password
  if (!email || !password) {
    console.log('Missing email or password');
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for member (select password field)
  const member = await Member.findOne({ email }).select('+password');
  
  console.log('Member found:', member ? 'YES' : 'NO');
  if (member) {
    console.log('Member details:', {
      id: member._id,
      name: member.name,
      email: member.email,
      hasPassword: !!member.password,
      passwordLength: member.password ? member.password.length : 0,
      isAdmin: member.is_admin
    });
  }

  if (!member) {
    console.log('No member found with email:', email);
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches using the schema's comparePassword method
  console.log('Comparing password...');
  const isMatch = await member.comparePassword(password);
  console.log('Password match result:', isMatch);

  if (!isMatch) {
    console.log('Password comparison failed');
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // NEW: Check if member is admin
  if (!member.is_admin) {
    console.log('Access denied: User is not an admin');
    return next(new ErrorResponse('Access denied. Admin privileges required.', 403));
  }

  console.log('Login successful, sending token');
  sendTokenResponse(member, 200, res);
});

// @desc    Log member out
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});

// @desc    Get current logged in member
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const member = await Member.findById(req.member.id).populate('positions.position_id');

  res.status(200).json({
    success: true,
    data: member,
  });
});

// @desc    Update member details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const member = await Member.findByIdAndUpdate(req.member.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: member,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const member = await Member.findById(req.member.id).select('+password');

  // Check current password using comparePassword method
  if (!(await member.comparePassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  member.password = req.body.newPassword;
  await member.save();

  sendTokenResponse(member, 200, res);
});

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Helper function to send token response (no cookies)
const sendTokenResponse = (member, statusCode, res) => {
  // Create token
  const token = generateToken(member._id);

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      data: {
        id: member._id,
        name: member.name,
        email: member.email,
        is_admin: member.is_admin,
      },
    });
};