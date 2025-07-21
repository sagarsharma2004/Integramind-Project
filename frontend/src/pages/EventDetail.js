import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiUsers, FiMail, FiPhone, FiGlobe, FiUser, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to register for events');
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    try {
      await axios.post(`/api/events/${id}/register`);
      toast.success('Successfully registered for event!');
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error('Error registering for event:', error);
      const message = error.response?.data?.message || 'Failed to register for event';
      toast.error(message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setIsRegistering(true);
    try {
      await axios.delete(`/api/events/${id}/register`);
      toast.success('Successfully unregistered from event');
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('Failed to unregister from event');
    } finally {
      setIsRegistering(false);
    }
  };

  const isUserRegistered = () => {
    if (!event || !user) return false;
    return event.attendees?.some(attendee => attendee.user._id === user._id);
  };

  const isUserOrganizer = () => {
    if (!event || !user) return false;
    return event.organizer._id === user._id;
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/events')} className="btn btn-primary">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{event.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Image */}
          {event.image && (
            <div className="card p-0 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Event Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <FiCalendar className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Date & Time</h3>
                  <p className="text-gray-600">
                    {format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FiMapPin className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-600">
                    {event.location.address}
                  </p>
                  <p className="text-gray-600">
                    {event.location.city}, {event.location.state} {event.location.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FiUsers className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Capacity</h3>
                  <p className="text-gray-600">
                    {event.attendees?.length || 0} of {event.maxAttendees} spots filled
                  </p>
                  {event.isFull && (
                    <p className="text-red-600 font-medium">Event is full</p>
                  )}
                </div>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex items-start gap-4">
                  <FiUser className="h-6 w-6 text-primary-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Information */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Organizer</h2>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <FiUser className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{event.organizer.name}</h3>
                <p className="text-gray-600">{event.organizer.email}</p>
                {event.organizer.bio && (
                  <p className="text-gray-600 mt-2">{event.organizer.bio}</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <FiMail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{event.contactEmail}</span>
              </div>
              {event.contactPhone && (
                <div className="flex items-center gap-3">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{event.contactPhone}</span>
                </div>
              )}
              {event.website && (
                <div className="flex items-center gap-3">
                  <FiGlobe className="h-5 w-5 text-gray-400" />
                  <a href={event.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    {event.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Attendees ({event.attendees.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.attendees.map((attendee) => (
                  <div key={attendee.user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{attendee.user.name}</p>
                      <p className="text-sm text-gray-500">
                        Registered {format(new Date(attendee.registeredAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {event.isFree ? 'Free' : `$${event.price}`}
              </div>
              <p className="text-gray-600">
                {event.attendees?.length || 0} of {event.maxAttendees} spots filled
              </p>
            </div>

            {event.status === 'published' && !event.isFull && (
              <div className="space-y-4">
                {isUserOrganizer() ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">You are the organizer of this event</p>
                    <button
                      onClick={() => navigate(`/edit-event/${event._id}`)}
                      className="btn btn-primary w-full"
                    >
                      Edit Event
                    </button>
                  </div>
                ) : isUserRegistered() ? (
                  <button
                    onClick={handleUnregister}
                    disabled={isRegistering}
                    className="btn btn-danger w-full"
                  >
                    {isRegistering ? 'Unregistering...' : 'Unregister'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="btn btn-primary w-full"
                  >
                    {isRegistering ? 'Registering...' : 'Register for Event'}
                  </button>
                )}
              </div>
            )}

            {event.status !== 'published' && (
              <div className="text-center">
                <p className="text-gray-600">This event is not available for registration</p>
              </div>
            )}

            {event.isFull && (
              <div className="text-center">
                <p className="text-red-600 font-medium">Event is full</p>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiCalendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiClock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  {format(new Date(event.startDate), 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  {event.location.city}, {event.location.state}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 