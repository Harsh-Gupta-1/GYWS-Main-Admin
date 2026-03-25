import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import multer from "multer";
import streamifier from "streamifier";
import ErrorResponse from "../utils/errorResponse.js";


config();

const upload = multer(); 

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = (req, res, next) => {
  if (!req.file) {
    return next(); // Proceed to the next middleware/route handler if no file is uploaded
  }

  const currentYear = new Date().getFullYear(); // Get the current year
  
  // Determine folder based on the route or file field name
  let folderName;
  if (req.file.fieldname === 'photo') {
    folderName = `members/${currentYear}`; // For member photos
  } else {
    folderName = `blogs/${currentYear}`; // For blog images (default)
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: folderName }, 
    (error, result) => {
      if (error) {
        // Use next() with ErrorResponse instead of direct res.status().json()
        return next(new ErrorResponse(`Upload to Cloudinary failed: ${error.message}`, 500));
      }

      req.body.imageUrl = result.secure_url; // Correctly set the image URL
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    // For URL like: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/blogs/2025/filename.jpg
    // Public ID should be: blogs/2025/filename
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1]; // Return the captured group
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Deletes an image from Cloudinary using its URL
 * @param {string} imageUrl - The Cloudinary URL of the image to delete
 * @returns {Promise} A promise that resolves with the deletion result
 */
const deleteImageByUrl = async (imageUrl, next) => {
  if (!imageUrl) {
    return next(new ErrorResponse("No image URL provided", 400));
  }

  try {
    const publicId = extractPublicIdFromUrl(imageUrl);

    if (!publicId) {
      return next(new ErrorResponse("Could not extract public ID from the provided URL", 400));
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    return next(new ErrorResponse(`Cloudinary deletion failed: ${error.message}`, 500));
  }
};

export { upload, uploadImage, deleteImageByUrl };