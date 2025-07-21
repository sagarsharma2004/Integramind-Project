import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiUser, FiTag, FiClock, FiDollarSign } from 'react-icons/fi';

const CreateTask = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories] = useState([
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
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data.docs || response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/assignable');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const taskData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
        budget: {
          estimated: data.estimatedBudget ? parseFloat(data.estimatedBudget) : null,
          actual: null,
          currency: 'USD'
        }
      };

      const response = await axios.post('/api/tasks', taskData);
      toast.success('Task created successfully!');
      navigate(`/tasks/${response.data._id}`);
    } catch (error) {
      console.error('Error creating task:', error);
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Task</h1>
        <p className="text-gray-600">Create a new task for your event management system</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Task title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' }
                })}
                className="input"
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
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

            <div>
              <label className="form-label">Priority *</label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="input"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
            </div>

            <div>
              <label className="form-label">Due Date *</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="datetime-local"
                  {...register('dueDate', { required: 'Due date is required' })}
                  className="input pl-10"
                />
              </div>
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
            </div>

            <div>
              <label className="form-label">Event *</label>
              <select
                {...register('event', { required: 'Event is required' })}
                className="input"
              >
                <option value="">Select an event</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
              {errors.event && <p className="text-red-500 text-sm mt-1">{errors.event.message}</p>}
            </div>

            <div>
              <label className="form-label">Assign To</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  {...register('assignedTo')}
                  className="input pl-10"
                >
                  <option value="">Select assignee</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
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
              placeholder="Describe the task details and requirements..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="mt-6">
            <label className="form-label">Tags</label>
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                {...register('tags')}
                className="input pl-10"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>
        </div>

        {/* Time and Budget */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Time & Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Estimated Hours</label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('estimatedHours')}
                  className="input pl-10"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Estimated Budget ($)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('estimatedBudget')}
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location (Optional) */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="form-label">Address</label>
              <input
                type="text"
                {...register('location.address')}
                className="input"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                {...register('location.city')}
                className="input"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                {...register('location.state')}
                className="input"
                placeholder="Enter state"
              />
            </div>

            <div>
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                {...register('location.zipCode')}
                className="input"
                placeholder="Enter zip code"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <div>
            <label className="form-label">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input"
              placeholder="Add any additional notes or instructions..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
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
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask; 