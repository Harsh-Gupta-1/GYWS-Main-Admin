import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  }
}, {
  timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;