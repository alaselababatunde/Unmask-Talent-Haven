import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    let allowedFormats = [];
    
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      allowedFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    } else if (file.mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary treats audio as video with audio only
      allowedFormats = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
    } else {
      resourceType = 'image';
      allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }
    
    return {
      folder: 'uth-app',
      allowed_formats: allowedFormats,
      resource_type: resourceType,
      timeout: 180000, // 3 minutes timeout for large videos
    };
  },
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept video, audio, and image files
    const allowedMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/mp4',
      'audio/ogg',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

export default cloudinary;

