const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { deleteFile } = require('../utils/minio');

const router = express.Router();

// Validation rules
const documentValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category must be at most 50 characters')
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag must be at most 30 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
];

// @route   GET /api/documents
// @desc    Get all published documents (public) or all documents (admin)
// @access  Public/Private
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('tag').optional().trim(),
  query('search').optional().trim(),
  query('status').optional().isIn(['draft', 'published', 'archived']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    // Only admin can see all documents, others see only published
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i');
    }

    if (req.query.tag) {
      filter.tags = { $in: [new RegExp(req.query.tag, 'i')] };
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Get documents
    const documents = await Document.find(filter)
      .populate('author', 'username email')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Document.countDocuments(filter);

    res.json({
      documents,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error while fetching documents' });
  }
});

// @route   GET /api/documents/:slug
// @desc    Get document by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Build filter based on user role
    let filter = { slug };
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published';
    }

    const document = await Document.findOne(filter)
      .populate('author', 'username email avatar')
      .lean();

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Increment view count (without waiting)
    Document.findByIdAndUpdate(document._id, { $inc: { views: 1 } }).exec();

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error while fetching document' });
  }
});

// @route   POST /api/documents
// @desc    Create a new document
// @access  Private (Admin only)
router.post('/', auth, adminAuth, documentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, content, category, tags, status, featuredImage } = req.body;

    // Create document
    const document = new Document({
      title,
      content,
      category,
      tags,
      status: status || 'draft',
      featuredImage,
      author: req.user._id,
    });

    await document.save();
    await document.populate('author', 'username email');

    res.status(201).json({
      message: 'Document created successfully',
      document,
    });
  } catch (error) {
    console.error('Create document error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Document with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error while creating document' });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, documentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, content, category, tags, status, featuredImage, slug } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update fields
    document.title = title;
    document.content = content;
    document.category = category;
    document.tags = tags;
    document.status = status;
    document.featuredImage = featuredImage;
    
    if (slug) {
      document.slug = slug;
    }

    await document.save();
    await document.populate('author', 'username email');

    res.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    console.error('Update document error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Document with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error while updating document' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete associated files from Minio
    if (document.attachments && document.attachments.length > 0) {
      for (const attachment of document.attachments) {
        try {
          const fileName = attachment.url.split('/').pop();
          await deleteFile(`uploads/${fileName}`);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Continue with document deletion even if file deletion fails
        }
      }
    }

    // Delete featured image if exists
    if (document.featuredImage) {
      try {
        const fileName = document.featuredImage.split('/').pop();
        await deleteFile(`images/${fileName}`);
      } catch (fileError) {
        console.error('Error deleting featured image:', fileError);
      }
    }

    await Document.findByIdAndDelete(id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error while deleting document' });
  }
});

// @route   POST /api/documents/:id/like
// @desc    Like/unlike document
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user already liked the document
    const existingLike = document.likes.find(like => 
      like.user.toString() === userId.toString()
    );

    if (existingLike) {
      // Remove like
      document.likes = document.likes.filter(like => 
        like.user.toString() !== userId.toString()
      );
    } else {
      // Add like
      document.likes.push({ user: userId });
    }

    await document.save();

    res.json({
      message: existingLike ? 'Document unliked' : 'Document liked',
      likeCount: document.likes.length,
      isLiked: !existingLike,
    });
  } catch (error) {
    console.error('Like document error:', error);
    res.status(500).json({ message: 'Server error while liking document' });
  }
});

// @route   GET /api/documents/:id/likes
// @desc    Get document likes
// @access  Public
router.get('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('likes.user', 'username avatar')
      .lean();

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      likes: document.likes,
      likeCount: document.likes.length,
    });
  } catch (error) {
    console.error('Get document likes error:', error);
    res.status(500).json({ message: 'Server error while fetching likes' });
  }
});

// @route   GET /api/documents/admin/stats
// @desc    Get document statistics (admin only)
// @access  Private (Admin only)
router.get('/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Document.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: {
              $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
            }
          },
          draft: {
            $sum: {
              $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
            }
          },
          archived: {
            $sum: {
              $cond: [{ $eq: ['$status', 'archived'] }, 1, 0]
            }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0,
      totalLikes: 0,
    };

    res.json({ stats: result });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

module.exports = router;
