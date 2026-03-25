import express from 'express';
import { protect } from '../middlewares/auth.js';
import { upload, uploadImage } from '../middlewares/cloudinary.js';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,
  getDraftBlogs,
  getBlogsByYear
} from '../controllers/blogs/blogsController.js';

const router = express.Router();

// Create a new blog - protected
router.post('/', protect, upload.single('image'), uploadImage, createBlog);

// Get all blogs 
router.get('/',  getAllBlogs);

// Get all published blogs 
router.get('/published',  getPublishedBlogs);

// Get all draft blogs 
router.get('/draft',  getDraftBlogs);

// Get blogs by year 
router.get('/by-year',  getBlogsByYear);

// Get a single blog by ID 
router.get('/:id',  getBlogById);

// Update a blog by ID - protected
router.put('/:id', protect, upload.single('image'), uploadImage, updateBlog);

// Delete a blog by ID - protected
router.delete('/:id', protect, deleteBlog);



export default router;