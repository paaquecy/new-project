const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { storageSetup } = require('../config/setup-storage');
const { database, STORAGE_BUCKETS } = require('../config/supabase');

/**
 * Supabase Storage Upload Middleware
 * Replaces local file system uploads with Supabase Storage
 */

// File type mappings
const FILE_TYPE_TO_BUCKET = {
  'document': STORAGE_BUCKETS.DOCUMENTS,
  'evidence': STORAGE_BUCKETS.EVIDENCE,
  'payment-proof': STORAGE_BUCKETS.PAYMENT_PROOFS
};

// Allowed file types for each category
const ALLOWED_FILE_TYPES = {
  document: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  evidence: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ],
  'payment-proof': [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  document: 10 * 1024 * 1024,    // 10MB
  evidence: 20 * 1024 * 1024,    // 20MB
  'payment-proof': 5 * 1024 * 1024 // 5MB
};

/**
 * Generate unique filename with timestamp and UUID
 */
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Short UUID
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${prefix}${timestamp}-${uuid}-${baseName}${extension}`;
};

/**
 * Validate file type and size
 */
const validateFile = (file, fileType) => {
  const allowedTypes = ALLOWED_FILE_TYPES[fileType];
  const maxSize = FILE_SIZE_LIMITS[fileType];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} not allowed for ${fileType}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB for ${fileType}`);
  }

  return true;
};

/**
 * Upload file to Supabase Storage
 */
const uploadToSupabase = async (file, fileType, prefix = '') => {
  try {
    // Validate file
    validateFile(file, fileType);

    // Get appropriate bucket
    const bucket = FILE_TYPE_TO_BUCKET[fileType];
    if (!bucket) {
      throw new Error(`Invalid file type: ${fileType}`);
    }

    // Generate unique filename
    const fileName = generateFileName(file.originalname, prefix);

    // Upload to Supabase Storage
    const uploadResult = await storageSetup.uploadFile(
      bucket,
      fileName,
      file.buffer,
      file.mimetype
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    return {
      success: true,
      fileName: fileName,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      bucket: bucket,
      path: uploadResult.path,
      publicUrl: uploadResult.publicUrl,
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Upload to Supabase failed:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 */
const deleteFromSupabase = async (bucket, fileName) => {
  try {
    const result = await storageSetup.deleteFile(bucket, fileName);
    return result;
  } catch (error) {
    console.error('Delete from Supabase failed:', error);
    throw error;
  }
};

/**
 * Get signed URL for file access
 */
const getSignedUrl = async (bucket, fileName, expiresIn = 3600) => {
  try {
    const signedUrl = await storageSetup.getSignedUrl(bucket, fileName, expiresIn);
    return signedUrl;
  } catch (error) {
    console.error('Get signed URL failed:', error);
    throw error;
  }
};

/**
 * Multer configuration for memory storage
 * Files are stored in memory before uploading to Supabase
 */
const memoryStorage = multer.memoryStorage();

/**
 * Multer file filter
 */
const fileFilter = (req, file, cb) => {
  const fileType = req.body.fileType || req.params.fileType || 'document';
  
  try {
    const allowedTypes = ALLOWED_FILE_TYPES[fileType];
    if (allowedTypes && allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed for ${fileType}`), false);
    }
  } catch (error) {
    cb(error, false);
  }
};

/**
 * Multer upload configuration
 */
const upload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(FILE_SIZE_LIMITS)) // Max allowed size
  }
});

/**
 * Express middleware for handling file uploads to Supabase
 */
const supabaseUploadMiddleware = (fileType = 'document', fieldName = 'file') => {
  return async (req, res, next) => {
    // Use multer to handle the multipart form data
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: err.message
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      try {
        // Upload to Supabase Storage
        const uploadResult = await uploadToSupabase(req.file, fileType);

        // Attach upload result to request object
        req.uploadResult = uploadResult;

        // Continue to next middleware
        next();
      } catch (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'File upload to storage failed',
          error: error.message
        });
      }
    });
  };
};

/**
 * Express middleware for handling multiple file uploads
 */
const supabaseUploadMultipleMiddleware = (fileType = 'document', fieldName = 'files', maxCount = 5) => {
  return async (req, res, next) => {
    // Use multer to handle the multipart form data
    upload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: err.message
        });
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      try {
        // Upload all files to Supabase Storage
        const uploadPromises = req.files.map(file => uploadToSupabase(file, fileType));
        const uploadResults = await Promise.all(uploadPromises);

        // Attach upload results to request object
        req.uploadResults = uploadResults;

        // Continue to next middleware
        next();
      } catch (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'File upload to storage failed',
          error: error.message
        });
      }
    });
  };
};

/**
 * Save file metadata to database
 */
const saveFileMetadata = async (uploadResult, entityType, entityId, documentType, uploadedBy) => {
  try {
    const documentData = {
      entity_type: entityType,
      entity_id: entityId,
      document_type: documentType,
      file_name: uploadResult.originalName,
      file_url: uploadResult.publicUrl,
      file_size: uploadResult.fileSize,
      mime_type: uploadResult.mimeType,
      bucket_name: uploadResult.bucket,
      uploaded_by: uploadedBy
    };

    const result = await database.insert('dvla_documents', documentData);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('Failed to save file metadata:', error);
    throw error;
  }
};

module.exports = {
  supabaseUploadMiddleware,
  supabaseUploadMultipleMiddleware,
  uploadToSupabase,
  deleteFromSupabase,
  getSignedUrl,
  saveFileMetadata,
  FILE_TYPE_TO_BUCKET,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS
};
