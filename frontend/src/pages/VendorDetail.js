import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiTag, FiChevronLeft } from 'react-icons/fi';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
    // eslint-disable-next-line
  }, [id]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/vendors/${id}`);
      setVendor(response.data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Failed to load vendor');
      navigate('/vendors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/vendors')} className="btn btn-primary">
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        onClick={() => navigate('/vendors')}
      >
        <FiChevronLeft className="h-5 w-5" /> Back to Vendors
      </button>
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{vendor.name}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800`}>
            {vendor.category || 'Vendor'}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          {vendor.company && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiUser className="h-4 w-4" />
              Company: {vendor.company}
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiMail className="h-4 w-4" />
              {vendor.email}
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiPhone className="h-4 w-4" />
              {vendor.phone}
            </div>
          )}
        </div>
        {vendor.address && typeof vendor.address === 'object' ? (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Address:</span>
            <div className="text-gray-700 mt-2">
              {vendor.address.street && <span>{vendor.address.street}</span>}
              {vendor.address.street && (vendor.address.city || vendor.address.state) ? ', ' : ''}
              {vendor.address.city && <span>{vendor.address.city}</span>}
              {vendor.address.city && vendor.address.state ? ', ' : ''}
              {vendor.address.state && <span>{vendor.address.state}</span>}
              {vendor.address.zipCode && <span> {vendor.address.zipCode}</span>}
              {vendor.address.country && <span>, {vendor.address.country}</span>}
            </div>
          </div>
        ) : vendor.address && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Address:</span>
            <div className="text-gray-700 mt-2">{vendor.address}</div>
          </div>
        )}
        {vendor.city || vendor.state || vendor.zipCode ? (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Location:</span>
            <div className="text-gray-700 mt-2">
              {vendor.city && <span>{vendor.city}</span>}
              {vendor.city && vendor.state ? ', ' : ''}
              {vendor.state && <span>{vendor.state}</span>}
              {vendor.zipCode && <span> {vendor.zipCode}</span>}
            </div>
          </div>
        ) : null}
        {vendor.tags && vendor.tags.length > 0 && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {vendor.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <FiTag className="h-3 w-3 mr-1" /> {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {vendor.description && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">Description:</span>
            <p className="text-gray-700 mt-2 whitespace-pre-line">{vendor.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail; 