import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiMapPin, FiPhone, FiMail, FiStar, FiPlus, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    state: '',
    verified: '',
    minRating: '',
    status: ''
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/vendors/categories');
      console.log(response);
      
      setCategories(response.data);
    } catch (error) {
      setCategories([]);
      console.error('Error fetching categories:', error);
      if (window && window.toast) window.toast.error('Could not load vendor categories');
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await axios.get('/api/vendors', { params });
      setVendors(response.data.docs || response.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalDocs || response.data.total || 0,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / pagination.limit)
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchVendors();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      state: '',
      verified: '',
      minRating: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Catering': 'bg-red-100 text-red-800',
      'Audio/Visual': 'bg-blue-100 text-blue-800',
      'Photography': 'bg-purple-100 text-purple-800',
      'Venue': 'bg-green-100 text-green-800',
      'Transportation': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Decoration': 'bg-indigo-100 text-indigo-800',
      'Security': 'bg-gray-100 text-gray-800',
      'Technology': 'bg-teal-100 text-teal-800',
      'Other': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || colors['Other'];
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading && vendors.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Directory</h1>
            <p className="text-gray-600">Find trusted vendors for your events</p>
          </div>
          <Link
            to="/vendors/create"
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Vendor
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <FiFilter className="h-4 w-4" />
            Filters
          </button>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="card p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  {categories && categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  ) : (
                    <option value="" disabled>No categories available</option>
                  )}
                </select>
              </div>
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="form-label">Verification Status</label>
                <select
                  value={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.value)}
                  className="input"
                >
                  <option value="">All Vendors</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>
              <div>
                <label className="form-label">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="input"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {vendors.map((vendor) => (
              <Link key={vendor._id} to={`/vendors/${vendor._id}`} className="group">
                <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(vendor.category)}`}>
                        {vendor.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {vendor.verified ? (
                          <FiCheckCircle className="h-4 w-4 text-green-500" title="Verified" />
                        ) : (
                          <FiXCircle className="h-4 w-4 text-gray-400" title="Not Verified" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{vendor.company}</p>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {vendor.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="h-4 w-4" />
                        <span>{vendor.address.city}, {vendor.address.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="h-4 w-4" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMail className="h-4 w-4" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {renderStars(vendor.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          ({vendor.reviews?.length || 0})
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {vendor.pricing?.perEvent ? `$${vendor.pricing.perEvent}` : 'Contact for pricing'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && vendors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiSearch className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <button
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Vendors; 