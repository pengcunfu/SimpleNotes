const express = require('express');
const multer = require('multer');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadFile, uploadMultipleFiles, deleteFile } = require('../utils/minio');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      // Other
      'application/json',
      'text/csv',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  },
});

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private (Admin only)
router.post('/single', auth, adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { folder = 'uploads' } = req.body;
    
    const result = await uploadFile(req.file, folder);

    res.json({
      message: 'File uploaded successfully',
      file: result,
    });
  } catch (error) {
    console.error('Single file upload error:', error);
    if (error.message.includes('File type')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private (Admin only)
router.post('/multiple', auth, adminAuth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { folder = 'uploads' } = req.body;
    
    const results = await uploadMultipleFiles(req.files, folder);

    res.json({
      message: 'Files uploaded successfully',
      files: results,
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    if (error.message.includes('File type')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   POST /api/upload/image
// @desc    Upload image file (for featured images, etc.)
// @access  Private (Admin only)
router.post('/image', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Check if file is actually an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'File must be an image' });
    }

    const result = await uploadFile(req.file, 'images');

    res.json({
      message: 'Image uploaded successfully',
      image: result,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
});

// @route   DELETE /api/upload/:fileName
// @desc    Delete uploaded file
// @access  Private (Admin only)
router.delete('/:fileName', auth, adminAuth, async (req, res) => {
  try {
    const { fileName } = req.params;
    const { folder = 'uploads' } = req.query;

    const fullFileName = `${folder}/${fileName}`;
    
    await deleteFile(fullFileName);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Server error during file deletion' });
  }
});

// @route   POST /api/upload/markdown
// @desc    Upload markdown file and create document
// @access  Private (Admin only)
router.post('/markdown', auth, adminAuth, upload.single('markdown'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No markdown file uploaded' });
    }

    // Check if file is markdown
    const allowedTypes = ['text/markdown', 'text/plain'];
    if (!allowedTypes.includes(req.file.mimetype) && 
        !req.file.originalname.match(/\.(md|markdown|txt)$/i)) {
      return res.status(400).json({ message: 'File must be a markdown file' });
    }

    // Parse file content
    const content = req.file.buffer.toString('utf8');
    
    // Extract title from first line if it's a heading
    let title = req.body.title;
    if (!title) {
      const firstLine = content.split('\n')[0];
      if (firstLine.startsWith('#')) {
        title = firstLine.replace(/^#+\s*/, '').trim();
      } else {
        title = req.file.originalname.replace(/\.(md|markdown|txt)$/i, '');
      }
    }

    // Create document
    const Document = require('../models/Document');
    const document = new Document({
      title,
      content,
      author: req.user._id,
      status: req.body.status || 'draft',
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
    });

    await document.save();
    await document.populate('author', 'username email');

    res.json({
      message: 'Markdown file uploaded and document created successfully',
      document,
    });
  } catch (error) {
    console.error('Markdown upload error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Document with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error during markdown upload' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

module.exports = router;
