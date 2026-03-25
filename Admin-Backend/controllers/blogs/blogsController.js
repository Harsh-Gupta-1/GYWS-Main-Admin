import Blog from '../../models/blogs/blogs.schema.js';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middlewares/async.js';
import { deleteImageByUrl } from '../../middlewares/cloudinary.js';

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = asyncHandler(async (req, res, next) => {
  // If no excerpt is provided, generate one from the content
  if (!req.body.excerpt && req.body.content) {
    // Strip HTML tags, take first 250 characters and add ellipsis
    const plainText = req.body.content.replace(/<[^>]*>/g, '');
    req.body.excerpt = plainText.length > 250 ? 
      `${plainText.substring(0, 250).trim()}...` : 
      plainText;
  }
  
  const blog = await Blog.create(req.body);
  
  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Private
export const getAllBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

// @desc    Get a single blog by ID
// @route   GET /api/blogs/:id
// @access  Private
export const getBlogById = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Update a blog by ID
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }
  
  // Check if a new image is being uploaded and old image exists
  if (req.body.imageUrl && blog.imageUrl && req.body.imageUrl !== blog.imageUrl) {
    // Attempt to delete the old image but continue with update regardless of outcome
    await deleteImageByUrl(blog.imageUrl).catch(err => 
      next(new ErrorResponse(`Note: Failed to delete previous image but blog update will proceed`, 200))
    );
  }
  
  // If content was updated but excerpt wasn't, regenerate excerpt
  if (req.body.content && !req.body.excerpt) {
    const plainText = req.body.content.replace(/<[^>]*>/g, '');
    req.body.excerpt = plainText.length > 250 ? 
      `${plainText.substring(0, 250).trim()}...` : 
      plainText;
  }
  
  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Delete a blog by ID
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }
  
  // If blog has an image, delete it from Cloudinary
  if (blog.imageUrl) {
    // Attempt to delete image but continue with blog deletion regardless of outcome
    await deleteImageByUrl(blog.imageUrl).catch(err => 
      next(new ErrorResponse(`Note: Failed to delete image but blog deletion will proceed`, 200))
    );
  }
  
  await blog.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all published blogs
// @route   GET /api/blogs/published
// @access  Private
export const getPublishedBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

// @desc    Get all draft blogs
// @route   GET /api/blogs/draft
// @access  Private
export const getDraftBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find({ status: 'draft' }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

/**
 * @desc    Get blogs by year (passed as query param ?year=YYYY)
 * @route   GET /api/blogs/by-year
 * @access  Private
 */
export const getBlogsByYear = asyncHandler(async (req, res, next) => {
  const { year } = req.query;
  if (!year || isNaN(Number(year))) {
    return next(new ErrorResponse('Please provide a valid year as query parameter', 400));
  }

  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);

  const blogs = await Blog.find({
    createdAt: {
      $gte: start,
      $lt: end
    }
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});