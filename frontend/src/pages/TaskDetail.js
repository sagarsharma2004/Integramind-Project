import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiCalendar, FiUser, FiTag, FiClock, FiDollarSign, FiChevronLeft } from 'react-icons/fi';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/tasks/${id}`);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/tasks')} className="btn btn-primary">
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        onClick={() => navigate('/tasks')}
      >
        <FiChevronLeft className="h-5 w-5" /> Back to Tasks
      </button>
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{task.title}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800`}>
            {task.category}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FiCalendar className="h-4 w-4" />
            Due: {format(new Date(task.dueDate), 'PPP p')}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FiClock className="h-4 w-4" />
            Priority: {task.priority}
          </div>
          {task.estimatedHours && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock className="h-4 w-4" />
              Est. Hours: {task.estimatedHours}
            </div>
          )}
          {task.budget?.estimated && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiDollarSign className="h-4 w-4" />
              Est. Budget: {task.budget.estimated} {task.budget.currency || 'USD'}
            </div>
          )}
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-900">Status:</span> {task.status}
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-900">Assigned To:</span> {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-900">Event:</span> {task.event ? task.event.title : 'N/A'}
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-900">Description:</span>
          <p className="text-gray-700 mt-2 whitespace-pre-line">{task.description}</p>
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {task.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <FiTag className="h-3 w-3 mr-1" /> {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {task.location && (task.location.address || task.location.city || task.location.state) && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Location:</span>
            <div className="text-gray-700 mt-2">
              {task.location.address && <div>{task.location.address}</div>}
              {(task.location.city || task.location.state) && (
                <div>{task.location.city}{task.location.city && task.location.state ? ', ' : ''}{task.location.state}</div>
              )}
              {task.location.zipCode && <div>{task.location.zipCode}</div>}
            </div>
          </div>
        )}
        {task.notes && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Notes:</span>
            <p className="text-gray-700 mt-2 whitespace-pre-line">{task.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail; 