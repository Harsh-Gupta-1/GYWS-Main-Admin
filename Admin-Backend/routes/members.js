import express from 'express';
const router = express.Router();
import {
  createPosition,
  createMember,
  addPositionToMember,
  getAllMembers,
  getAllPositions,
  getMemberById,
  updateMember,
  deleteMember,
  getMembersByYear
} from '../controllers/members/membersController.js'; // Adjust path as needed
import { upload, uploadImage } from '../middlewares/cloudinary.js';

// Position Routes
// GET /api/positions - Get all positions (for frontend dropdowns)
router.get('/positions', getAllPositions);

// GET /api/positions?team=Tech - Get positions by team
// This route supports query parameter: ?team=TeamName

// POST /api/positions - Create new position (admin only)
router.post('/positions', createPosition);

// Member Routes
// POST /api/members - Create new member
router.post('/', upload.single('photo'), uploadImage, createMember);

// GET /api/members - Get all members with optional filters
// Supports query parameters:
// ?year=2024 - Filter by year
// ?team=Tech - Filter by team
// ?position=Head - Filter by position name
// ?show_in_website=true - Filter by website visibility
// ?limit=20&page=1 - Pagination
router.get('/', getAllMembers);

// GET /api/members/year/:year - Get all members for a specific year
// Example: GET /api/members/year/2024
router.get('/year/:year', getMembersByYear);

// GET /api/members/criteria - Get members by specific criteria (optimized for website)
// Supports query parameters:
// ?year=2024&team=Tech&position_name=Head
// TODO: Implement getMembersByCriteria function in controller
// router.get('/members/criteria', getMembersByCriteria);

// GET /api/members/stats - Get team statistics
// Supports query parameters:
// ?year=2024
// TODO: Implement getTeamStatistics function in controller
// router.get('/members/stats', getTeamStatistics);

// GET /api/members/:memberId - Get member by ID
router.get('/:memberId', getMemberById);

// PUT /api/members/:memberId - Update member
router.put('/:memberId', upload.single('photo'), uploadImage, updateMember);

// DELETE /api/members/:memberId - Delete member
router.delete('/:memberId', deleteMember);

// POST /api/members/:memberId/positions - Add position to existing member
router.post('/:memberId/positions', addPositionToMember);

export default router;

// Usage in your main app.js or server.js:
/*
import memberRoutes from './routes/members.js';
app.use('/api', memberRoutes);
*/

// Example API calls for your website:
/*

// 1. Get all positions for form dropdowns:
GET /api/positions

// 2. Get positions for a specific team:
GET /api/positions?team=Tech

// 3. Create a new member:
POST /api/members
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "roll_number": "CS21B001",
  "hall": "RK Hall",
  "positions": [
    {
      "year": 2024,
      "position_id": "507f1f77bcf86cd799439011"
    }
  ]
}

// 4. Get all members for a specific year and team (for website display):
GET /api/members?year=2024&team=Tech

// 5. Get all Tech Heads for 2024:
GET /api/members?year=2024&team=Tech&position=Head

// 6. Get all Governing Body members for 2024:
GET /api/members?year=2024&team=Governing%20Body

// 7. Get team statistics for a year:
// TODO: Implement stats endpoint
// GET /api/members/stats?year=2024

// 8. Get all members with pagination:
GET /api/members?limit=20&page=1

// 9. Update a member:
PUT /api/members/507f1f77bcf86cd799439011
Body: {
  "name": "Updated Name",
  "positions": [...]
}

// 10. Add a position to existing member:
POST /api/members/507f1f77bcf86cd799439011/positions
Body: {
  "year": 2024,
  "position_id": "507f1f77bcf86cd799439012"
}

*/