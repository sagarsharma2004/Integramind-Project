const mongoose = require('mongoose');
require('mongoose-paginate-v2');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide task description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Please provide associated event']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
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
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'review', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative']
  },
  budget: {
    estimated: {
      type: Number,
      min: [0, 'Estimated budget cannot be negative']
    },
    actual: {
      type: Number,
      min: [0, 'Actual budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'blocks'
    }
  }],
  attachments: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  checklist: [{
    item: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date
  }],
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 1,
      min: [0, 'Reminder days cannot be negative']
    }
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  timeLogs: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: Number, // in minutes
    description: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
taskSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  'location.city': 'text',
  'location.state': 'text'
});

// Index for efficient queries
taskSchema.index({ event: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });

// Virtual for task duration
taskSchema.virtual('duration').get(function() {
  if (this.startDate && this.completedDate) {
    return Math.ceil((this.completedDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && this.dueDate < new Date();
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.checklist.length === 0) return this.progress;
  const completedItems = this.checklist.filter(item => item.completed).length;
  return Math.round((completedItems / this.checklist.length) * 100);
});

// Method to add comment
taskSchema.methods.addComment = function(userId, content) {
  this.comments.push({ user: userId, content });
  return this.save();
};

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  return this.save();
};

// Method to add checklist item
taskSchema.methods.addChecklistItem = function(item) {
  this.checklist.push({ item });
  return this.save();
};

// Method to toggle checklist item
taskSchema.methods.toggleChecklistItem = function(itemIndex, userId) {
  if (itemIndex >= 0 && itemIndex < this.checklist.length) {
    const item = this.checklist[itemIndex];
    item.completed = !item.completed;
    if (item.completed) {
      item.completedBy = userId;
      item.completedAt = new Date();
    } else {
      item.completedBy = null;
      item.completedAt = null;
    }
    return this.save();
  }
  throw new Error('Invalid checklist item index');
};

// Method to log time
taskSchema.methods.logTime = function(userId, startTime, endTime, description) {
  const duration = endTime ? Math.round((endTime - startTime) / (1000 * 60)) : null;
  this.timeLogs.push({
    user: userId,
    startTime,
    endTime,
    duration,
    description
  });
  return this.save();
};

// Method to calculate total time spent
taskSchema.methods.getTotalTimeSpent = function() {
  return this.timeLogs.reduce((total, log) => {
    return total + (log.duration || 0);
  }, 0);
};

// Pre-save middleware to update progress based on checklist
taskSchema.pre('save', function(next) {
  if (this.checklist.length > 0) {
    const completedItems = this.checklist.filter(item => item.completed).length;
    this.progress = Math.round((completedItems / this.checklist.length) * 100);
  }
  next();
});

taskSchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Task', taskSchema); 