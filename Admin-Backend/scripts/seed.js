// Combined seed file for positions and superadmin
import mongoose from 'mongoose';
import { Member, Position } from '../models/members/member.schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  if (!process.env.ATLAS_URI) {
    console.error('❌ ATLAS_URI must be set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.ATLAS_URI);
  console.log('✅ MongoDB connected successfully');
};

// Position data to populate
const positionsData = [
  // Governing Body Positions
  { pos_name: 'President', team: 'Governing Body' },
  { pos_name: 'Vice President', team: 'Governing Body' },
  { pos_name: 'General Secretary', team: 'Governing Body' },
  { pos_name: 'Assistant Secretary', team: 'Governing Body' },
  { pos_name: 'Human Resource Manager', team: 'Governing Body' },
  { pos_name: 'Chief Executive Officer, LiGHT', team: 'Governing Body' },
  { pos_name: 'Chief Technical Officer', team: 'Governing Body' },
  { pos_name: 'Treasurer', team: 'Governing Body' },
  { pos_name: 'School Development Officer', team: 'Governing Body' },
  { pos_name: 'Chief Fundraising Officer', team: 'Governing Body' },
  { pos_name: 'Foreign and Corporate Relations Officer', team: 'Governing Body' },
  { pos_name: 'Donor Engagement Officer', team: 'Governing Body' },
  { pos_name: 'Public Relations Officer', team: 'Governing Body' },
  { pos_name: 'Hostel Committee Officer', team: 'Governing Body' },
  { pos_name: 'Chief Executive Officer, Rise', team: 'Governing Body' },
  { pos_name: 'Executive Officer, LiGHT Samvedna', team: 'Governing Body' },
  {pos_name: 'Chief Executive Officer, PRAYAS', team: 'Governing Body'},
  {pos_name: 'Social Strategy Development Officer, LiGHT', team: 'Governing Body'},
  {pos_name: 'Public Relations Officer, LiGHT', team: 'Governing Body'},
  {pos_name: 'Network Management Officer, LiGHT', team: 'Governing Body'},
  {pos_name: 'Chief Advisory, Prayas', team: 'Governing Body'},
  {pos_name: 'Chief Advisory', team: 'Governing Body'},
  {pos_name: 'Executive Officer, RS', team: 'Governing Body'},
  //Advisory Committee
  {pos_name: 'Advisory Committee', team: 'Advisory Committee'},
  // Tech Team Positions
  { pos_name: 'Head', team: 'Technical Operations' },
  { pos_name: 'Senior Executive Member', team: 'Technical Operations' },

  // Sponsorship Team Positions
  { pos_name: 'Head', team: 'Sponsorship' },
  { pos_name: 'Senior Executive Member', team: 'Sponsorship' },

  // LiGHT Team Positions
  { pos_name: 'Head', team: 'LiGHT' },
  { pos_name: 'Senior Executive Member', team: 'LiGHT' },
  { pos_name: 'LiGHT Coordinator', team: 'LiGHT' },
  {pos_name: 'Public Relations and Marketing Head', team: 'LiGHT' },
  {pos_name: 'Social Strategy Development Head', team: 'LiGHT' },
  {pos_name: 'Human Resource and Management Head', team: 'LiGHT' },
  // Rise Team Positions
  { pos_name: 'Head', team: 'Rise' },
  { pos_name: 'Senior Executive Member', team: 'Rise' },

  // SRC Team Positions
  { pos_name: 'Head', team: 'School Review Committee' },
  { pos_name: 'Senior Executive Member', team: 'School Review Committee' },

  // Design Team Positions
  { pos_name: 'Head', team: 'Design' },
  { pos_name: 'Senior Executive Member', team: 'Design' },

  // Media Team Positions
  { pos_name: 'Head', team: 'Media and Publicity' },
  { pos_name: 'Senior Executive Member', team: 'Media and Publicity' },
  // Finance Team Positions
  { pos_name: 'Head', team: 'Finance' },
  { pos_name: 'Senior Executive Member', team: 'Finance' },

  // Coordinators
  { pos_name: 'UG-Coordinator', team: 'Coordinators' },

  //Prayas Team
  {pos_name: 'Head, Awareness Projects', team: 'Prayas'},
  {pos_name: 'PRAYAS Coordinator ', team: 'Prayas'},
  {pos_name: 'Head', team: 'Prayas'},
  {pos_name: 'Senior Executive Member', team: 'Prayas'}
];

// Superadmin configuration from environment variables
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Function to populate positions
const populatePositions = async () => {
  const existingPositions = await Position.find();
  
  // Create maps for easy comparison
  const existingPositionsMap = new Map();
  existingPositions.forEach(pos => {
    const key = `${pos.pos_name}|${pos.team}`;
    existingPositionsMap.set(key, pos);
  });
  
  const newPositionsMap = new Map();
  positionsData.forEach(pos => {
    const key = `${pos.pos_name}|${pos.team}`;
    newPositionsMap.set(key, pos);
  });
  
  // Find positions to add (in new list but not in database)
  const positionsToAdd = [];
  newPositionsMap.forEach((pos, key) => {
    if (!existingPositionsMap.has(key)) {
      positionsToAdd.push(pos);
    }
  });
  
  // Find positions to remove (in database but not in new list)
  const positionsToRemove = [];
  existingPositionsMap.forEach((pos, key) => {
    if (!newPositionsMap.has(key)) {
      positionsToRemove.push(pos);
    }
  });
  
  // Add new positions
  if (positionsToAdd.length > 0) {
    await Position.insertMany(positionsToAdd);
    console.log(`✅ Added ${positionsToAdd.length} new positions`);
  }
  
  // Remove old positions (force removal even if members are assigned)
  if (positionsToRemove.length > 0) {
    for (const pos of positionsToRemove) {
      await Member.updateMany(
        { 'positions.position_id': pos._id },
        { $pull: { positions: { position_id: pos._id } } }
      );
      await Position.findByIdAndDelete(pos._id);
    }
    console.log(`✅ Removed ${positionsToRemove.length} old positions`);
  }

  const totalPositions = await Position.countDocuments();
  console.log(`📈 Total positions in database: ${totalPositions}`);
};

// Validate superadmin credentials from .env
const validateCredentials = () => {
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }
};

// Function to create superadmin
const createSuperAdmin = async () => {
  const existingSuperAdmin = await Member.findOne({ email: SUPER_ADMIN_EMAIL });
  
  if (existingSuperAdmin) {
    existingSuperAdmin.password = SUPER_ADMIN_PASSWORD;
    await existingSuperAdmin.save();
    console.log('✅ Superadmin password updated');
    return;
  }

  const superAdmin = new Member({
    name: 'Super Administrator',
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    roll_number: 'SUPERADMIN001',
    hall: 'Administrative Office',
    is_admin: true,
    show_in_website: false,
    positions: [],
    phone_numbers: [],
    social_media_links: {}
  });
  await superAdmin.save();
  console.log('✅ Superadmin created');
};

// Main execution function
const main = async () => {
  try {
    await connectDB();
    validateCredentials();
    await populatePositions();
    await createSuperAdmin();
    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
};

// Run seeding
main();