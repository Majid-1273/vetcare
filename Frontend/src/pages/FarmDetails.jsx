import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserFarmRegistered } from '../redux/slices/authSlice';

const FarmInfoForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    ownerManager: '',
    contactPhone: '',
    contactEmail: user?.email || '',
    farmCapacity: '',
    flockSize: '',
    registrationNumber: '',
    registrationAuthority: '',
    registrationDate: ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // For number inputs, ensure we're storing numeric values
    if (type === 'number') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await fetch('http://localhost:5000/api/farm/createFarm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        dispatch(setUserFarmRegistered());
        navigate('/flock-management');
      } else {
        console.error("Server responded with error:", data);
        alert(`Server error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Network or runtime error:", error);
      alert("An error occurred while saving the farm info.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-3 rounded-full shadow-md mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Farm Registration</h1>
          <p className="text-gray-600 mt-2">Please provide your farm details to complete the registration</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 border-l-4 border-green-500">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">Farm Name*</label>
                  <input
                    type="text"
                    id="farmName"
                    name="farmName"
                    required
                    value={formData.farmName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Green Valley Farm"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location*</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="123 Rural Road, Farmville"
                  />
                </div>

                <div>
                  <label htmlFor="ownerManager" className="block text-sm font-medium text-gray-700 mb-1">Owner/Manager*</label>
                  <input
                    type="text"
                    id="ownerManager"
                    name="ownerManager"
                    required
                    value={formData.ownerManager}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone*</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                    pattern="[0-9() -]+"
                    title="Please enter a valid phone number"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="farmCapacity" className="block text-sm font-medium text-gray-700 mb-1">Farm Capacity (acres)*</label>
                  <input
                    type="number"
                    id="farmCapacity"
                    name="farmCapacity"
                    required
                    min="0"
                    step="0.01"
                    value={formData.farmCapacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label htmlFor="flockSize" className="block text-sm font-medium text-gray-700 mb-1">Flock Size</label>
                  <input
                    type="number"
                    id="flockSize"
                    name="flockSize"
                    min="0"
                    value={formData.flockSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>

                {/* Registration Details Section */}
                <div className="pt-2">
                  <h3 className="text-md font-medium text-green-700 mb-3">Registration Details (Optional)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                      <input
                        type="text"
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="RF-123456"
                      />
                    </div>

                    <div>
                      <label htmlFor="registrationAuthority" className="block text-sm font-medium text-gray-700 mb-1">Registering Authority</label>
                      <input
                        type="text"
                        id="registrationAuthority"
                        name="registrationAuthority"
                        value={formData.registrationAuthority}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Department of Agriculture"
                      />
                    </div>

                    <div>
                      <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                      <input
                        type="date"
                        id="registrationDate"
                        name="registrationDate"
                        value={formData.registrationDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition shadow-md hover:shadow-lg"
              >
                Save Farm Information
              </button>
            </div>
          </form>
        </div>

        {/* Info Tips */}
        <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Why register your farm?</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Registering your farm provides access to agricultural subsidies, technical assistance, and market opportunities. Your information is secure and will only be used for poultry management services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmInfoForm;