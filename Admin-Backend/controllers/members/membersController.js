import { Member, Position } from '../../models/members/member.schema.js';
import mongoose from 'mongoose';
import { deleteImageByUrl } from '../../middlewares/cloudinary.js';
import asyncHandler from '../../middlewares/async.js';

// Super admin email from environment variable
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gyws.com';

// Helper function to check if a member is super admin
const isSuperAdmin = (member) => {
  return member.email === SUPER_ADMIN_EMAIL;
};

// Create a new position
export const createPosition = asyncHandler(async (req, res) => {
    const { pos_name, team } = req.body;
    
    // Validation
    if (!pos_name || !team) {
      return res.status(400).json({
        success: false,
        message: 'Position name and team are required'
      });
    }
    
    // Check if position already exists
    const existingPosition = await Position.findOne({ 
      pos_name: pos_name.trim(), 
      team: team.trim() 
    });
    
    if (existingPosition) {
      return res.status(409).json({
        success: false,
        message: 'Position with this name and team already exists'
      });
    }
    
    const position = new Position({
      pos_name: pos_name.trim(),
      team: team.trim()
    });
    
    await position.save();
    
    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: position
    });
});

// Create a new member
export const createMember = asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      positions, // Will be JSON string from FormData
      social_media_links,
      phone_numbers, // Will be JSON string from FormData
      roll_number,
      hall,
      is_admin,
      show_in_website
    } = req.body;
    
    // Required field validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    // Email validation only if email is provided and not empty
    if (email && email.trim() && email.trim() !== '') {
      // Prevent creating member with super admin email
      if (email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'This email is reserved for system administrator'
        });
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
      
      // NO uniqueness check - same as roll_number
    }

    // Parse JSON strings from FormData
    let parsedPositions = [];
    let parsedPhoneNumbers = [];
    
    try {
      if (positions) {
        parsedPositions = JSON.parse(positions);
      }
      if (phone_numbers) {
        parsedPhoneNumbers = JSON.parse(phone_numbers);
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format for positions or phone numbers'
      });
    }
    
    // Validate positions if provided
    if (parsedPositions && parsedPositions.length > 0) {
      for (let pos of parsedPositions) {
        if (!pos.year || !pos.position_id) {
          return res.status(400).json({
            success: false,
            message: 'Each position must have year and position_id'
          });
        }
        
        // Check if position exists
        const positionExists = await Position.findById(pos.position_id);
        if (!positionExists) {
          return res.status(404).json({
            success: false,
            message: `Position with ID ${pos.position_id} not found`
          });
        }
        
        // Governing Body position uniqueness check removed - multiple members can now hold the same position
      }
    }
    
    // Create member object
    const memberData = {
      name: name.trim(),
      positions: parsedPositions || [],
      phone_numbers: parsedPhoneNumbers || [],
      is_admin: is_admin === 'true' || is_admin === true,
      show_in_website: show_in_website !== undefined ? (show_in_website === 'true' || show_in_website === true) : true
    };

    // Only add email if provided and not empty (same pattern as roll_number)
    if (email && email.trim() && email.trim() !== '') {
      memberData.email = email.toLowerCase().trim();
    }
    // If email is empty, undefined, or null, don't add it to memberData at all

    // Only add roll_number if provided and not empty
    if (roll_number && roll_number.trim() && roll_number.trim() !== '') {
      memberData.roll_number = roll_number.trim();
    }

    // Only add hall if provided and not empty
    if (hall && hall.trim() && hall.trim() !== '') {
      memberData.hall = hall.trim();
    }
    
    // Add password if provided, otherwise use default
    if (password && password.trim()) {
      memberData.password = password.trim();
    }
    // Default password "12345678" will be set by schema default
    
    // Add photo URL if uploaded via cloudinary middleware
    if (req.body.imageUrl) {
      memberData.photo_url = req.body.imageUrl;
    }
    
    // Handle social media links
    if (social_media_links) {
      try {
        memberData.social_media_links = typeof social_media_links === 'string' 
          ? JSON.parse(social_media_links) 
          : social_media_links;
      } catch {
        // Handle FormData format: social_media_links[linkedin], social_media_links[facebook]
        memberData.social_media_links = {};
        Object.keys(req.body).forEach(key => {
          if (key.startsWith('social_media_links[') && key.endsWith(']')) {
            const socialKey = key.slice(20, -1); // Extract key from social_media_links[key]
            if (req.body[key] && req.body[key].trim() !== '') {
              memberData.social_media_links[socialKey] = req.body[key];
            }
          }
        });
      }
    }
    
    const member = new Member(memberData);
    await member.save();
    
    // Populate positions for response
    await member.populate('positions.position_id');
    
    // Remove password from response
    const memberResponse = member.toObject();
    delete memberResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: memberResponse
    });
});

// Add position to existing member
export const addPositionToMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    const { year, position_id } = req.body;
    
    if (!year || !position_id) {
      return res.status(400).json({
        success: false,
        message: 'Year and position_id are required'
      });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(memberId) || 
        !mongoose.Types.ObjectId.isValid(position_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Prevent modifying super admin
    if (isSuperAdmin(member)) {
      return res.status(403).json({
        success: false,
        message: 'Super admin positions cannot be modified'
      });
    }
    
    const position = await Position.findById(position_id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    // Check if member already has this position for this year
    const hasPosition = member.positions.some(
      pos => pos.year === year && pos.position_id.toString() === position_id
    );
    
    if (hasPosition) {
      return res.status(409).json({
        success: false,
        message: 'Member already has this position for the specified year'
      });
    }
    
    // Governing Body position uniqueness check removed - multiple members can now hold the same position
    
    await member.addPosition(year, position_id);
    await member.populate('positions.position_id');
    
    const memberResponse = member.toObject();
    delete memberResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Position added successfully',
      data: memberResponse
    });
});

// Get all members (excluding super admin)
export const getAllMembers = asyncHandler(async (req, res) => {
    const { year, show_in_website, team, position } = req.query;
    
    let query = {
      // Exclude super admin from regular member lists
      email: { $ne: SUPER_ADMIN_EMAIL }
    };
    
    // Filter by year if provided
    if (year) {
      query['positions.year'] = parseInt(year);
    }
    
    // Filter by show_in_website if provided
    if (show_in_website !== undefined) {
      query.show_in_website = show_in_website === 'true';
    }
    
    const members = await Member.find(query)
      .populate('positions.position_id')
      .select('-password')
      .sort({ name: 1 });
    
    // Additional filtering by team or position name (post-query filtering)
    let filteredMembers = members;
    
    if (team) {
      filteredMembers = members.filter(member => 
        member.positions.some(pos => 
          pos.position_id && pos.position_id.team.toLowerCase().includes(team.toLowerCase())
        )
      );
    }
    
    if (position) {
      filteredMembers = filteredMembers.filter(member =>
        member.positions.some(pos =>
          pos.position_id && pos.position_id.pos_name.toLowerCase().includes(position.toLowerCase())
        )
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Members retrieved successfully',
      count: filteredMembers.length,
      data: filteredMembers
    });
});

// Get all positions
export const getAllPositions = asyncHandler(async (req, res) => {
    const { team } = req.query;
    
    let query = {};
    if (team) {
      query.team = { $regex: team, $options: 'i' }; // Case insensitive search
    }
    
    const positions = await Position.find(query).sort({ team: 1, pos_name: 1 });
    
    res.status(200).json({
      success: true,
      message: 'Positions retrieved successfully',
      count: positions.length,
      data: positions
    });
});

// Get member by ID (allow super admin for profile viewing)
export const getMemberById = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }
    
    const member = await Member.findById(memberId)
      .populate('positions.position_id')
      .select('-password');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Member retrieved successfully',
      data: member
    });
});

// Update member (prevent super admin email change, allow other updates)
// Update member (prevent super admin email change, allow other updates)
export const updateMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    const updateData = { ...req.body };
    
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }
    
    // Get existing member to handle photo deletion if needed
    const existingMember = await Member.findById(memberId);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // If this is the super admin, prevent email changes
    if (isSuperAdmin(existingMember)) {
      if (updateData.email && updateData.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Super admin email cannot be changed'
        });
      }
      // Also prevent roll number change for super admin
      if (updateData.roll_number && updateData.roll_number !== existingMember.roll_number) {
        return res.status(403).json({
          success: false,
          message: 'Super admin roll number cannot be changed'
        });
      }
    }
    
    // Prevent changing email to super admin email
    if (updateData.email && updateData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && !isSuperAdmin(existingMember)) {
      return res.status(400).json({
        success: false,
        message: 'This email is reserved for system administrator'
      });
    }
    
    // Remove password from update data (use separate endpoint for password updates)
    delete updateData.password;
    
    // Track if we need to unset email
    let shouldUnsetEmail = false;
    
    // Handle empty email field - unset it to avoid duplicate null values
    if (updateData.email !== undefined) {
      if (!updateData.email || typeof updateData.email !== 'string' || updateData.email.trim() === '') {
        // Mark to unset the email field
        shouldUnsetEmail = true;
        delete updateData.email;
      } else {
        // Validate and process non-empty email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
        updateData.email = updateData.email.toLowerCase().trim();
      }
    }

    // Handle empty roll_number field - set to null to clear it
    if (updateData.roll_number !== undefined) {
      if (!updateData.roll_number || updateData.roll_number.trim() === '') {
        updateData.roll_number = null;
      } else {
        updateData.roll_number = updateData.roll_number.trim();
      }
    }

    // Handle empty hall field - set to null to clear it
    if (updateData.hall !== undefined) {
      if (!updateData.hall || updateData.hall.trim() === '') {
        updateData.hall = null;
      } else {
        updateData.hall = updateData.hall.trim();
      }
    }
    
    // Parse JSON strings from FormData if they exist
    if (updateData.positions && typeof updateData.positions === 'string') {
      try {
        updateData.positions = JSON.parse(updateData.positions);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid positions data format'
        });
      }
    }
    
    if (updateData.phone_numbers && typeof updateData.phone_numbers === 'string') {
      try {
        updateData.phone_numbers = JSON.parse(updateData.phone_numbers);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone numbers data format'
        });
      }
    }
    
    // Handle social media links from FormData
    if (!updateData.social_media_links) {
      updateData.social_media_links = {};
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('social_media_links[') && key.endsWith(']')) {
          const socialKey = key.slice(20, -1);
          if (req.body[key] && req.body[key].trim() !== '') {
            updateData.social_media_links[socialKey] = req.body[key];
          }
        }
      });
    }
    
    // Handle boolean fields from FormData
    if (updateData.is_admin !== undefined) {
      updateData.is_admin = updateData.is_admin === 'true' || updateData.is_admin === true;
    }
    
    if (updateData.show_in_website !== undefined) {
      updateData.show_in_website = updateData.show_in_website === 'true' || updateData.show_in_website === true;
    }
    
    // Handle photo update
    if (req.body.imageUrl) {
      // New photo uploaded via cloudinary middleware
      // Delete old photo if it exists and is different
      if (existingMember.photo_url && existingMember.photo_url !== req.body.imageUrl) {
        try {
          await deleteImageByUrl(existingMember.photo_url, () => {});
        } catch (deleteError) {
          console.warn('Failed to delete old photo:', deleteError);
          // Continue with update even if old photo deletion fails
        }
      }
      updateData.photo_url = req.body.imageUrl;
    }
    
    // Validate positions if provided
    if (updateData.positions && updateData.positions.length > 0) {
      for (let pos of updateData.positions) {
        if (!pos.year || !pos.position_id) {
          return res.status(400).json({
            success: false,
            message: 'Each position must have year and position_id'
          });
        }
        
        // Check if position exists
        const positionExists = await Position.findById(pos.position_id);
        if (!positionExists) {
          return res.status(404).json({
            success: false,
            message: `Position with ID ${pos.position_id} not found`
          });
        }
      }
    }
    
    // Build the update query
    let updateQuery;
    if (shouldUnsetEmail) {
      // Use $unset to remove the email field
      updateQuery = {
        $set: updateData,
        $unset: { email: "" }
      };
    } else {
      updateQuery = updateData;
    }
    
    const member = await Member.findByIdAndUpdate(
      memberId,
      updateQuery,
      { new: true, runValidators: true }
    ).populate('positions.position_id').select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });
});

// Delete member (prevent super admin deletion)
export const deleteMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Prevent deletion of super admin
    if (isSuperAdmin(member)) {
      return res.status(403).json({
        success: false,
        message: 'Super admin cannot be deleted'
      });
    }
    
    // Delete photo from cloudinary if it exists
    if (member.photo_url) {
      try {
        await deleteImageByUrl(member.photo_url, () => {});
      } catch (deleteError) {
        console.warn('Failed to delete member photo:', deleteError);
        // Continue with member deletion even if photo deletion fails
      }
    }
    
    await Member.findByIdAndDelete(memberId);
    
    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
});

// Get members by year (excluding super admin)
export const getMembersByYear = asyncHandler(async (req, res) => {
    const { year } = req.params;
    
    // Validate year parameter
    if (!year || isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: 'Valid year parameter is required'
      });
    }
    
    const yearNum = parseInt(year);
    
    // Find members who have positions in the specified year (excluding super admin)
    const members = await Member.find({
      'positions.year': yearNum,
      email: { $ne: SUPER_ADMIN_EMAIL } // Exclude super admin
    })
    .populate({
      path: 'positions.position_id',
      model: 'Position',
      // Add match to ensure we only get valid positions
      match: { _id: { $exists: true } }
    })
    .select('-password')
    .sort({ name: 1 }); // Sort by name alphabetically
    
    // Group members by team for better organization
    const membersByTeam = {};
    const membersWithValidPositions = [];
    
    members.forEach(member => {
      // Get positions for the specified year
      const yearPositions = member.positions.filter(pos => {
        // Check if position is for the correct year and has valid position_id
        if (pos.year !== yearNum) return false;
        
        // Handle different scenarios for position_id
        if (!pos.position_id) {
          console.warn(`Member ${member.name} has null position_id for year ${yearNum}`);
          return false;
        }
        
        // Check if position_id is an object (populated) or string/ObjectId (not populated)
        if (typeof pos.position_id === 'object' && pos.position_id !== null) {
          // Already populated - check if it has required fields
          if (!pos.position_id.team) {
            console.warn(`Member ${member.name} has position without team for year ${yearNum}`);
            return false;
          }
          return true;
        } else {
          // Not populated or invalid
          console.warn(`Member ${member.name} has unpopulated position_id for year ${yearNum}`);
          return false;
        }
      });
      
      // Only process members with valid positions
      if (yearPositions.length === 0) return;
      
      // Add to members with valid positions
      const memberWithYearPositions = {
        ...member.toObject(),
        positions: yearPositions
      };
      membersWithValidPositions.push(memberWithYearPositions);
      
      yearPositions.forEach(position => {
        const team = position.position_id.team;
        
        if (!membersByTeam[team]) {
          membersByTeam[team] = [];
        }
        
        // Check if member is already added to this team
        const existingMember = membersByTeam[team].find(m => 
          m._id.toString() === member._id.toString()
        );
        
        if (!existingMember) {
          membersByTeam[team].push(memberWithYearPositions);
        }
      });
    });
    
    res.status(200).json({
      success: true,
      message: `Members for year ${year} retrieved successfully`,
      data: {
        year: yearNum,
        totalMembers: membersWithValidPositions.length,
        membersByTeam,
        allMembers: membersWithValidPositions
      }
    });
});