import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiTag } from 'react-icons/fi';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories] = useState([
    'Technology', 'Business', 'Education', 'Entertainment', 
    'Sports', 'Music', 'Art', 'Food', 'Health', 'Other'
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const isFree = watch('isFree');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Format dates
      const eventData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        price: data.isFree ? 0 : parseFloat(data.price),
        maxAttendees: parseInt(data.maxAttendees),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        status: 'published' // Set status to published by default
      };

      const response = await axios.post('/api/events', eventData);
      toast.success('Event created successfully!');
      navigate(`/events/${response.data._id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      const message = error.response?.data?.message || 'Failed to create event';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-600">Share your event with the world</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Event title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                })}
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`input ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="form-label">Description *</label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
              })}
              rows={4}
              className={`input ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe your event..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="form-label">Tags</label>
            <input
              type="text"
              {...register('tags')}
              className="input"
              placeholder="Enter tags separated by commas (e.g., tech, networking, startup)"
            />
            <p className="mt-1 text-sm text-gray-500">Tags help people find your event</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiCalendar className="h-5 w-5" />
            Date and Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Start Date & Time *</label>
              <input
                type="datetime-local"
                {...register('startDate', { 
                  required: 'Start date is required',
                  validate: value => {
                    const selectedDate = new Date(value);
                    const now = new Date();
                    return selectedDate > now || 'Start date must be in the future';
                  }
                })}
                className={`input ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">End Date & Time *</label>
              <input
                type="datetime-local"
                {...register('endDate', { 
                  required: 'End date is required',
                  validate: value => {
                    if (!startDate) return true;
                    const selectedEnd = new Date(value);
                    const selectedStart = new Date(startDate);
                    return selectedEnd > selectedStart || 'End date must be after start date';
                  }
                })}
                className={`input ${errors.endDate ? 'border-red-500' : ''}`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiMapPin className="h-5 w-5" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="form-label">Address *</label>
              <input
                type="text"
                {...register('location.address', { required: 'Address is required' })}
                className={`input ${errors.location?.address ? 'border-red-500' : ''}`}
                placeholder="Enter full address"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">City *</label>
              <input
                type="text"
                {...register('location.city', { required: 'City is required' })}
                className={`input ${errors.location?.city ? 'border-red-500' : ''}`}
                placeholder="Enter city"
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">State *</label>
              <input
                type="text"
                {...register('location.state', { required: 'State is required' })}
                className={`input ${errors.location?.state ? 'border-red-500' : ''}`}
                placeholder="Enter state"
              />
              {errors.location?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Zip Code *</label>
              <input
                type="text"
                {...register('location.zipCode', { required: 'Zip code is required' })}
                className={`input ${errors.location?.zipCode ? 'border-red-500' : ''}`}
                placeholder="Enter zip code"
              />
              {errors.location?.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.location.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity and Pricing */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiUsers className="h-5 w-5" />
            Capacity and Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Maximum Attendees *</label>
              <input
                type="number"
                {...register('maxAttendees', { 
                  required: 'Maximum attendees is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className={`input ${errors.maxAttendees ? 'border-red-500' : ''}`}
                placeholder="Enter maximum number of attendees"
              />
              {errors.maxAttendees && (
                <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Event Type</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...register('isFree')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Free</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...register('isFree')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Paid</span>
                </label>
              </div>
            </div>

            {!isFree && (
              <div>
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { 
                    required: !isFree ? 'Price is required for paid events' : false,
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className={`input ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="Enter ticket price"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Contact Email *</label>
              <input
                type="email"
                {...register('contactEmail', { 
                  required: 'Contact email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`input ${errors.contactEmail ? 'border-red-500' : ''}`}
                placeholder="Enter contact email"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                {...register('contactPhone')}
                className="input"
                placeholder="Enter contact phone number"
              />
            </div>

            <div>
              <label className="form-label">Website</label>
              <input
                type="url"
                {...register('website')}
                className="input"
                placeholder="Enter event website (optional)"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Event...
              </div>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent; 