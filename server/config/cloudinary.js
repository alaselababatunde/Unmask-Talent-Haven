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
  params: {
    folder: 'uth-app',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mp3', 'webm'],
    resource_type: 'auto',
  },
});

export const upload = multer({ storage });

export default cloudinary;

