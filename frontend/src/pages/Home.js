import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiUsers, FiMapPin, FiClock, FiStar } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiCalendar className="h-8 w-8" />,
      title: 'Create Events',
      description: 'Easily create and manage your events with our intuitive platform.'
    },
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: 'Connect People',
      description: 'Bring people together and build meaningful connections through events.'
    },
    {
      icon: <FiMapPin className="h-8 w-8" />,
      title: 'Find Events',
      description: 'Discover amazing events happening in your area and around the world.'
    },
    {
      icon: <FiClock className="h-8 w-8" />,
      title: 'Stay Organized',
      description: 'Keep track of your events and registrations in one place.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Events Created' },
    { number: '50K+', label: 'Happy Users' },
    { number: '100+', label: 'Cities Covered' },
    { number: '4.9', label: 'User Rating' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Create Amazing Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover, create, and manage events that bring people together. 
              From small meetups to large conferences, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/create-event" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Create Your First Event
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                    Get Started Free
                  </Link>
                  <Link to="/events" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
                    Browse Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Host Great Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, manage, and promote your events successfully.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Event Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust our platform to create memorable experiences.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn bg-primary-600 hover:bg-primary-700 px-8 py-3 text-lg">
              Sign Up Now - It's Free!
            </Link>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Event Organizer',
                content: 'EventHub made organizing my tech conference so much easier. The platform is intuitive and the support is amazing.',
                rating: 5
              },
              {
                name: 'Mike Chen',
                role: 'Community Manager',
                content: 'I love how easy it is to discover and register for events. The mobile experience is fantastic!',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Marketing Director',
                content: 'The analytics and attendee management features have transformed how we handle our corporate events.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 