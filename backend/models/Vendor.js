const mongoose = require('mongoose');
require('mongoose-paginate-v2');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide vendor name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide email address'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
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
    ]
  },
  services: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  pricing: {
    hourly: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    },
    daily: {
      type: Number,
      min: [0, 'Daily rate cannot be negative']
    },
    perEvent: {
      type: Number,
      min: [0, 'Per event rate cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availability: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  portfolio: [{
    title: String,
    description: String,
    image: String,
    date: Date
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  verified: {
    type: Boolean,
    default: false
  },
  insurance: {
    hasInsurance: {
      type: Boolean,
      default: false
    },
    policyNumber: String,
    expiryDate: Date
  },
  licenses: [{
    name: String,
    number: String,
    issuingAuthority: String,
    expiryDate: Date
  }],
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  contactPerson: {
    name: String,
    title: String,
    email: String,
    phone: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
vendorSchema.index({ 
  name: 'text', 
  company: 'text', 
  description: 'text', 
  services: 'text',
  'address.city': 'text',
  'address.state': 'text'
});

// Virtual for average rating
vendorSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / this.reviews.length) * 10) / 10;
});

// Virtual for review count
vendorSchema.virtual('reviewCount').get(function() {
  return this.reviews.length;
});

// Method to add review
vendorSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user already reviewed
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    throw new Error('User has already reviewed this vendor');
  }
  
  this.reviews.push({ user: userId, rating, comment });
  this.rating = this.averageRating;
  return this.save();
};

// Method to update review
vendorSchema.methods.updateReview = function(userId, rating, comment) {
  const review = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  review.rating = rating;
  review.comment = comment;
  review.date = new Date();
  
  this.rating = this.averageRating;
  return this.save();
};

// Method to remove review
vendorSchema.methods.removeReview = function(userId) {
  this.reviews = this.reviews.filter(review => 
    review.user.toString() !== userId.toString()
  );
  this.rating = this.averageRating;
  return this.save();
};

vendorSchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Vendor', vendorSchema); 