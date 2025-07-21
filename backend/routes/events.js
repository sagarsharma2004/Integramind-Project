const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all events with filtering and pagination
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      startDate,
      endDate,
      city,
      status = '',
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    
    if (category) filter.category = category;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { $lte: new Date(endDate) };

    // Build search query - improved search functionality
    if (search) {
      // Use regex for more flexible search instead of text index
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
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
        path: 'organizer',
        select: 'name email avatar'
      }
    };

    const events = await Event.paginate(filter, options);

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar bio')
      .populate('attendees.user', 'name email avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Music', 'Art', 'Food', 'Health', 'Other']).withMessage('Invalid category'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required'),
  body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    // Validate dates
    if (new Date(eventData.startDate) <= new Date()) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }

    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const event = await Event.create(eventData);
    await event.populate('organizer', 'name email avatar');

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Music', 'Art', 'Food', 'Health', 'Other']).withMessage('Invalid category'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('contactEmail').optional().isEmail().withMessage('Valid contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Validate dates if provided
    if (req.body.startDate && new Date(req.body.startDate) <= new Date()) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }

    if (req.body.endDate && req.body.startDate && new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email avatar');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    if (event.isUserRegistered(req.user._id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.isFull) {
      return res.status(400).json({ message: 'Event is full' });
    }

    await event.registerUser(req.user._id);
    await event.populate('attendees.user', 'name email avatar');

    res.json({ message: 'Successfully registered for event', event });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
router.delete('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isUserRegistered(req.user._id)) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    await event.unregisterUser(req.user._id);
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's events (organized)
// @route   GET /api/events/my-events
// @access  Private
router.post('/my-events', protect, async (req, res) => {
  try {

    const {id } = req.body;
    const events = await Event.find({ organizer: id })
    .populate('attendees.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's registered events
// @route   GET /api/events/registered
// @access  Private
router.get('/registered', protect, async (req, res) => {
  try {
    const events = await Event.find({
      'attendees.user': req.user._id
    })
      .populate('organizer', 'name email avatar')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get event categories
// @route   GET /api/events/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Technology',
      'Business',
      'Education',
      'Entertainment',
      'Sports',
      'Music',
      'Art',
      'Food',
      'Health',
      'Other'
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 