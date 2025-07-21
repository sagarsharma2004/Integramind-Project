const express = require('express');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all vendors with filtering and pagination
// @route   GET /api/vendors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      city,
      state,
      status,
      verified,
      sortBy = 'rating',
      sortOrder = 'desc',
      minRating
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only apply status filter if explicitly provided, otherwise show all
    if (status) {
      filter.status = status;
    }
    
    if (category) filter.category = category;
    if (verified !== undefined) filter.verified = verified === 'true';
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (state) filter['address.state'] = { $regex: state, $options: 'i' };
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };

    // Build search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { services: { $in: [searchRegex] } },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: {
        path: 'reviews.user',
        select: 'name email avatar'
      }
    };

    const vendors = await Vendor.paginate(filter, options);

    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get vendor categories
// @route   GET /api/vendors/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Catering',
      'Audio/Visual',
      'Photography',
      'Venue',
      'Transportation',
      'Entertainment',
      'Decoration',
      'Security',
      'Technology',
      'Other'
    ];
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('reviews.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private
router.post('/', protect, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('company').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('category').isIn(['Catering', 'Audio/Visual', 'Photography', 'Venue', 'Transportation', 'Entertainment', 'Decoration', 'Security', 'Technology', 'Other']).withMessage('Invalid category'),
  body('description').isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendorData = {
      ...req.body,
      createdBy: req.user._id
    };

    const vendor = await Vendor.create(vendorData);
    await vendor.populate('createdBy', 'name email avatar');

    res.status(201).json(vendor);
  } catch (error) {
    console.error('Create vendor error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
router.put('/:id', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('company').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('category').optional().isIn(['Catering', 'Audio/Visual', 'Photography', 'Venue', 'Transportation', 'Entertainment', 'Decoration', 'Security', 'Technology', 'Other']).withMessage('Invalid category'),
  body('description').optional().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if user is creator or admin
    if (vendor.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vendor' });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email avatar');

    res.json(updatedVendor);
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if user is creator or admin
    if (vendor.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this vendor' });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add review to vendor
// @route   POST /api/vendors/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.addReview(req.user._id, req.body.rating, req.body.comment);
    await vendor.populate('reviews.user', 'name email avatar');

    res.json(vendor);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update review
// @route   PUT /api/vendors/:id/reviews
// @access  Private
router.put('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.updateReview(req.user._id, req.body.rating, req.body.comment);
    await vendor.populate('reviews.user', 'name email avatar');

    res.json(vendor);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Remove review
// @route   DELETE /api/vendors/:id/reviews
// @access  Private
router.delete('/:id/reviews', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.removeReview(req.user._id);
    await vendor.populate('reviews.user', 'name email avatar');

    res.json(vendor);
  } catch (error) {
    console.error('Remove review error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get my vendors (created by user)
// @route   GET /api/vendors/my-vendors
// @access  Private
router.get('/my-vendors', protect, async (req, res) => {
  try {
    const vendors = await Vendor.find({ createdBy: req.user._id })
      .populate('reviews.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    console.error('Get my vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify vendor (admin only)
// @route   PUT /api/vendors/:id/verify
// @access  Private/Admin
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.verified = !vendor.verified;
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    console.error('Verify vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 