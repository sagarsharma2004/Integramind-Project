import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiDollarSign, FiTag } from 'react-icons/fi';

const CreateVendor = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories] = useState([
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
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const vendorData = {
        ...data,
        services: data.services ? data.services.split(',').map(service => service.trim()) : [],
        pricing: {
          hourly: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
          daily: data.dailyRate ? parseFloat(data.dailyRate) : null,
          perEvent: data.perEventRate ? parseFloat(data.perEventRate) : null,
          currency: 'USD'
        }
      };

      const response = await axios.post('/api/vendors', vendorData);
      toast.success('Vendor created successfully!');
      navigate(`/vendors/${response.data._id}`);
    } catch (error) {
      console.error('Error creating vendor:', error);
      const message = error.response?.data?.message || 'Failed to create vendor';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Vendor</h1>
        <p className="text-gray-600">Create a new vendor profile for your event management system</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Vendor Name *</label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Vendor name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className="input"
                placeholder="Enter vendor name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                {...register('company', { 
                  required: 'Company name is required',
                  minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                })}
                className="input"
                placeholder="Enter company name"
              />
              {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
            </div>

            <div>
              <label className="form-label">Email *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                  className="input pl-10"
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Phone *</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  className="input pl-10"
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">Website</label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  {...register('website')}
                  className="input pl-10"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="form-label">Description *</label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              rows={4}
              className="input"
              placeholder="Describe the vendor's services and expertise..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="mt-6">
            <label className="form-label">Services</label>
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                {...register('services')}
                className="input pl-10"
                placeholder="Service 1, Service 2, Service 3"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Separate services with commas</p>
          </div>
        </div>

        {/* Address Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="form-label">Street Address *</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  {...register('address.street', { required: 'Street address is required' })}
                  className="input pl-10"
                  placeholder="Enter street address"
                />
              </div>
              {errors.address?.street && <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>}
            </div>

            <div>
              <label className="form-label">City *</label>
              <input
                type="text"
                {...register('address.city', { required: 'City is required' })}
                className="input"
                placeholder="Enter city"
              />
              {errors.address?.city && <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>}
            </div>

            <div>
              <label className="form-label">State *</label>
              <input
                type="text"
                {...register('address.state', { required: 'State is required' })}
                className="input"
                placeholder="Enter state"
              />
              {errors.address?.state && <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>}
            </div>

            <div>
              <label className="form-label">Zip Code *</label>
              <input
                type="text"
                {...register('address.zipCode', { required: 'Zip code is required' })}
                className="input"
                placeholder="Enter zip code"
              />
              {errors.address?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.address.zipCode.message}</p>}
            </div>

            <div>
              <label className="form-label">Country</label>
              <input
                type="text"
                {...register('address.country')}
                className="input"
                placeholder="Enter country"
                defaultValue="USA"
              />
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Hourly Rate ($)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('hourlyRate')}
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Daily Rate ($)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('dailyRate')}
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Per Event Rate ($)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('perEventRate')}
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Person (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Contact Person Name</label>
              <input
                type="text"
                {...register('contactPerson.name')}
                className="input"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                {...register('contactPerson.title')}
                className="input"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                {...register('contactPerson.email')}
                className="input"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                {...register('contactPerson.phone')}
                className="input"
                placeholder="Enter contact phone"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendor; 