const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all tasks with filtering and pagination
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      event,
      assignedTo,
      category,
      priority,
      status,
      search,
      dueDateFrom,
      dueDateTo,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (event) filter.event = event;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (dueDateFrom) filter.dueDate = { $gte: new Date(dueDateFrom) };
    if (dueDateTo) {
      filter.dueDate = filter.dueDate || {};
      filter.dueDate.$lte = new Date(dueDateTo);
    }

    // Build search query
    if (search) {
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
      populate: [
        {
          path: 'event',
          select: 'title startDate endDate'
        },
        {
          path: 'assignedTo',
          select: 'name email avatar'
        },
        {
          path: 'assignedBy',
          select: 'name email avatar'
        },
        {
          path: 'vendor',
          select: 'name company'
        },
        {
          path: 'comments.user',
          select: 'name email avatar'
        }
      ]
    };

    const tasks = await Task.paginate(filter, options);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get task categories
// @route   GET /api/tasks/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Planning',
      'Marketing',
      'Logistics',
      'Vendor Management',
      'Budget',
      'Technical',
      'Administrative',
      'Creative',
      'Security',
      'Other'
    ];
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('event', 'title startDate endDate')
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email avatar')
      .populate('vendor', 'name company')
      .populate('comments.user', 'name email avatar')
      .populate('timeLogs.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('event').isMongoId().withMessage('Valid event ID is required'),
  body('category').isIn(['Planning', 'Marketing', 'Logistics', 'Vendor Management', 'Budget', 'Technical', 'Administrative', 'Creative', 'Security', 'Other']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskData = {
      ...req.body,
      assignedBy: req.user._id,
      createdBy: req.user._id // Ensure createdBy is set
    };

    const task = await Task.create(taskData);
    await task.populate([
      {
        path: 'event',
        select: 'title startDate endDate'
      },
      {
        path: 'assignedTo',
        select: 'name email avatar'
      },
      {
        path: 'assignedBy',
        select: 'name email avatar'
      }
    ]);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['Planning', 'Marketing', 'Logistics', 'Vendor Management', 'Budget', 'Technical', 'Administrative', 'Creative', 'Security', 'Other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to task, assigned by user, or admin
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAssignedBy = task.assignedBy.toString() === req.user._id.toString();
    
    if (!isAssigned && !isAssignedBy && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'event',
        select: 'title startDate endDate'
      },
      {
        path: 'assignedTo',
        select: 'name email avatar'
      },
      {
        path: 'assignedBy',
        select: 'name email avatar'
      }
    ]);

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned by user or admin
    if (task.assignedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addComment(req.user._id, req.body.content);
    await task.populate('comments.user', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update task progress
// @route   PUT /api/tasks/:id/progress
// @access  Private
router.put('/:id/progress', protect, [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to task or admin
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    await task.updateProgress(req.body.progress);
    await task.populate([
      {
        path: 'assignedTo',
        select: 'name email avatar'
      },
      {
        path: 'assignedBy',
        select: 'name email avatar'
      }
    ]);

    res.json(task);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add checklist item
// @route   POST /api/tasks/:id/checklist
// @access  Private
router.post('/:id/checklist', protect, [
  body('item').isLength({ min: 1, max: 200 }).withMessage('Checklist item must be between 1 and 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addChecklistItem(req.body.item);
    res.json(task);
  } catch (error) {
    console.error('Add checklist item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Toggle checklist item
// @route   PUT /api/tasks/:id/checklist/:itemIndex
// @access  Private
router.put('/:id/checklist/:itemIndex', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.toggleChecklistItem(parseInt(req.params.itemIndex), req.user._id);
    res.json(task);
  } catch (error) {
    console.error('Toggle checklist item error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Log time for task
// @route   POST /api/tasks/:id/time-log
// @access  Private
router.post('/:id/time-log', protect, [
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').optional().isISO8601().withMessage('Valid end time is required'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to task or admin
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to log time for this task' });
    }

    await task.logTime(
      req.user._id,
      new Date(req.body.startTime),
      req.body.endTime ? new Date(req.body.endTime) : null,
      req.body.description
    );

    res.json(task);
  } catch (error) {
    console.error('Log time error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get my tasks (assigned to user)
// @route   GET /api/tasks/my-tasks
// @access  Private
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('event', 'title startDate endDate')
      .populate('assignedBy', 'name email avatar')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get tasks by event
// @route   GET /api/tasks/event/:eventId
// @access  Private
router.get('/event/:eventId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ event: req.params.eventId })
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email avatar')
      .populate('vendor', 'name company')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 