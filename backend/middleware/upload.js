import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { log } from 'console';

// ES module equivalent of __dirname
// const __filename = fileURLToPath(import.meta.url);
// console.log(`Current file: ${__filename}`);

// const __dirname = path.dirname(__filename);
// console.log(`Current directory: ${__dirname}`);
// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, '../uploads');
// console.log(`Uploads directory: ${uploadsDir}`);

// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'uploads',
    resource_type: 'raw', // IMPORTANT for PDFs/DOCs
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: `resume-${Date.now()}`
  }),
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and DOC files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB default
    files: 1 // Only allow 1 file per request
  }
});



// Middleware for single file upload
const uploadResume = upload.single('resume');

// Error handling wrapper
const handleUpload = (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 2MB.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file allowed.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Use "resume" as the field name.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a resume file.'
      });
    }
    
    next();
  });
};

export { handleUpload };
