import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiCalendar, FiMapPin, FiTag } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-events');
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-events') {
        const response = await axios.post('http://localhost:5000/api/events/my-events', {id: user._id});
        setMyEvents(response.data);
      } else {
        const response = await axios.get('http://localhost:5000/api/events/registered');
        setRegisteredEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${eventId}`);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleUnregister = async (eventId) => {
    if (window.confirm('Are you sure you want to unregister from this event?')) {
      try {
        await axios.delete(`/api/events/${eventId}/register`);
        toast.success('Successfully unregistered from event');
        fetchEvents();
      } catch (error) {
        console.error('Error unregistering from event:', error);
        toast.error('Failed to unregister from event');
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Business': 'bg-green-100 text-green-800',
      'Education': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Music': 'bg-yellow-100 text-yellow-800',
      'Art': 'bg-indigo-100 text-indigo-800',
      'Food': 'bg-red-100 text-red-800',
      'Health': 'bg-teal-100 text-teal-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors['draft'];
  };

  const renderEventCard = (event, isMyEvent = false) => (
    <div key={event._id} className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="h-4 w-4" />
              <span>{format(new Date(event.startDate), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4" />
              <span>{event.location.address}, {event.location.city}, {event.location.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="h-4 w-4" />
              <span>{event.attendees?.length || 0} / {event.maxAttendees} attendees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{event.isFree ? 'Free' : `$${event.price}`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link
            to={`/events/${event._id}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiEye className="h-4 w-4" />
            View
          </Link>
          
          {isMyEvent && (
            <>
              <Link
                to={`/edit-event/${event._id}`}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiEdit className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => handleDeleteEvent(event._id)}
                className="btn btn-danger flex items-center gap-2"
              >
                <FiTrash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
          
          {!isMyEvent && (
            <button
              onClick={() => handleUnregister(event._id)}
              className="btn btn-danger flex items-center gap-2"
            >
              Unregister
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FiCalendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Events</p>
              <p className="text-2xl font-semibold text-gray-900">{myEvents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <FiUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registered Events</p>
              <p className="text-2xl font-semibold text-gray-900">{registeredEvents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiTag className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myEvents.reduce((total, event) => total + (event.attendees?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Link
          to="/create-event"
          className="btn btn-primary flex items-center gap-2 inline-flex"
        >
          <FiPlus className="h-4 w-4" />
          Create New Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('my-events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-events'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Events ({myEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'registered'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registered Events ({registeredEvents.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {activeTab === 'my-events' ? (
            myEvents.length > 0 ? (
              myEvents.map(event => renderEventCard(event, true))
            ) : (
              <div className="text-center py-12">
                <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first event!</p>
                <Link to="/create-event" className="btn btn-primary">
                  Create Your First Event
                </Link>
              </div>
            )
          ) : (
            registeredEvents.length > 0 ? (
              registeredEvents.map(event => renderEventCard(event, false))
            ) : (
              <div className="text-center py-12">
                <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No registered events</h3>
                <p className="text-gray-600 mb-4">Discover and register for amazing events!</p>
                <Link to="/events" className="btn btn-primary">
                  Browse Events
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 