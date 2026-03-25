import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import asyncHandler from '../../middlewares/async.js';

// Position Schema
const positionSchema = new mongoose.Schema({
  pos_name: {
    type: String,
    required: true,
    trim: true
  },
  team: {
    type: String,
    required: true,
    trim: true
  }
});

// Member Schema
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,  // This is crucial - sparse index ignores documents without this field
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if email is provided (not null/undefined)
        if (v == null || v === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  
  password: {
    type: String,
    default: "12345678"
  },
  
  // Position history - allows multiple positions per year
  positions: [{
    year: {
      type: Number,
      required: true
    },
    position_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: true
    }
  }],
  
  social_media_links: {
    linkedin: String,
    facebook: String
  },
  
  photo_url: String,
  
  phone_numbers: [String],
  
  roll_number: {
    type: String,
    required: false,
    unique: false, // Enforce uniqueness on roll_number // Allow multiple members to have no roll_number
    trim: true
  },
  
  hall: {
    type: String,
    required: false,
    trim: true
  },
  
  is_admin: {
    type: Boolean,
    default: false
  },
  
  show_in_website: {
    type: Boolean,
    default: true
  }
  
}, { timestamps: true });

// Pre-save middleware to hash password
memberSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 10
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login - FIXED: Removed asyncHandler wrapper
memberSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Indexes
memberSchema.index({ 'positions.year': 1 });

// Method to add position (handles multiple positions per year)
memberSchema.methods.addPosition = async function(year, positionId) {
  try {
    this.positions.push({ year, position_id: positionId });
    return await this.save();
  } catch (error) {
    throw error;
  }
};

// Method to get all positions for a specific year
memberSchema.methods.getPositionsByYear = function(year) {
  return this.positions.filter(pos => pos.year === year);
};

// Static method to find members by year with populated positions
memberSchema.statics.findByYear = asyncHandler(async function(year) {
  return await this.find({ 'positions.year': year })
                   .populate('positions.position_id');
});

// Static method to find members by specific position and year
memberSchema.statics.findByPositionAndYear = asyncHandler(async function(positionId, year) {
  return await this.find({
    'positions.position_id': positionId,
    'positions.year': year
  }).populate('positions.position_id');
});

const Position = mongoose.model('Position', positionSchema);
const Member = mongoose.model('Member', memberSchema);

export { Member, Position };