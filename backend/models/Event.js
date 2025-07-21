const mongoose = require('mongoose');
require('mongoose-paginate-v2');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
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
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide an address']
    },
    city: {
      type: String,
      required: [true, 'Please provide a city']
    },
    state: {
      type: String,
      required: [true, 'Please provide a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide a zip code']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  isFree: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  maxAttendees: {
    type: Number,
    min: [1, 'Max attendees must be at least 1']
  },
  contactEmail: {
    type: String,
    required: [true, 'Please provide a contact email']
  },
  contactPhone: {
    type: String
  },
  website: {
    type: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  }
}, {
  timestamps: true
});

// Index for search functionality
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.attendees.length >= this.maxAttendees;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxAttendees - this.attendees.length);
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user.toString() === userId.toString()
  );
};

// Method to register user for event
eventSchema.methods.registerUser = function(userId) {
  if (this.isUserRegistered(userId)) {
    throw new Error('User is already registered for this event');
  }
  if (this.isFull) {
    throw new Error('Event is full');
  }
  this.attendees.push({ user: userId });
  return this.save();
};

// Method to unregister user from event
eventSchema.methods.unregisterUser = function(userId) {
  this.attendees = this.attendees.filter(attendee => 
    attendee.user.toString() !== userId.toString()
  );
  return this.save();
};

eventSchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Event', eventSchema); 