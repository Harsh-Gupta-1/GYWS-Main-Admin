import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { Member } from '../models/members/member.schema.js';

// Protect routes - Token-based authentication
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find member and populate positions
    req.member = await Member.findById(decoded.id).populate('positions.position_id');

    if (!req.member) {
      return next(new ErrorResponse('No member found with this token', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Admin only access
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.member || !req.member.is_admin) {
    return next(new ErrorResponse('Access denied. Admin privileges required.', 403));
  }
  next();
});

// Role-based authorization (for specific positions)
export const authorize = (...allowedPositions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.member) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // If user is admin, allow access
    if (req.member.is_admin) {
      return next();
    }

    // Check if member has any of the allowed positions
    const currentYear = new Date().getFullYear();
    const memberPositions = req.member.getPositionsByYear(currentYear);
    
    // Get position names for current year
    const positionNames = memberPositions.map(pos => pos.position_id.pos_name);
    
    // Check if any position matches allowed positions
    const hasAuthorizedRole = positionNames.some(position => 
      allowedPositions.includes(position)
    );

    if (!hasAuthorizedRole) {
      return next(new ErrorResponse(
        `Access denied. Required positions: ${allowedPositions.join(', ')}`, 
        403
      ));
    }

    next();
  });
};

// Team-based authorization
export const authorizeTeam = (...allowedTeams) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.member) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // If user is admin, allow access
    if (req.member.is_admin) {
      return next();
    }

    // Check if member belongs to any of the allowed teams
    const currentYear = new Date().getFullYear();
    const memberPositions = req.member.getPositionsByYear(currentYear);
    
    // Get team names for current year
    const teamNames = memberPositions.map(pos => pos.position_id.team);
    
    // Check if any team matches allowed teams
    const hasAuthorizedTeam = teamNames.some(team => 
      allowedTeams.includes(team)
    );

    if (!hasAuthorizedTeam) {
      return next(new ErrorResponse(
        `Access denied. Required teams: ${allowedTeams.join(', ')}`, 
        403
      ));
    }

    next();
  });
};

// Year-based position authorization
export const authorizeForYear = (year, ...allowedPositions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.member) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // If user is admin, allow access
    if (req.member.is_admin) {
      return next();
    }

    // Check if member had required positions in specified year
    const memberPositions = req.member.getPositionsByYear(year);
    
    if (memberPositions.length === 0) {
      return next(new ErrorResponse(
        `Access denied. No positions found for year ${year}`, 
        403
      ));
    }

    // Get position names for specified year
    const positionNames = memberPositions.map(pos => pos.position_id.pos_name);
    
    // Check if any position matches allowed positions
    const hasAuthorizedRole = positionNames.some(position => 
      allowedPositions.includes(position)
    );

    if (!hasAuthorizedRole) {
      return next(new ErrorResponse(
        `Access denied. Required positions for ${year}: ${allowedPositions.join(', ')}`, 
        403
      ));
    }

    next();
  });
};

// Check if member should be shown on website
export const websiteVisible = asyncHandler(async (req, res, next) => {
  if (!req.member) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  if (!req.member.show_in_website && !req.member.is_admin) {
    return next(new ErrorResponse('Profile not visible on website', 403));
  }

  next();
});