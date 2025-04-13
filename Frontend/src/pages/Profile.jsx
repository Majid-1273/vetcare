import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getFarmerInfoById } from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, farmerInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.id) {
      dispatch(getFarmerInfoById(user.id));
    }
  }, [dispatch, user]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800">User Profile</h1>
            <p className="text-gray-600">View your account information</p>
          </div>
          
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-2 text-gray-600">Loading profile information...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-l-4 border-red-500">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition hover:shadow-lg border-l-4 border-green-500">
              <div className="relative">
                {/* Colored accent at the top of the card */}
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-400 w-full absolute top-0"></div>
                
                {/* Card Content */}
                <div className="pt-4">
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Account Information</h3>
                        <p className="text-sm text-gray-500 mt-1">Basic account details</p>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs">
                        {user?.userType || 'User'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Username</span>
                        <span className="text-sm font-medium">{user?.username || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Email</span>
                        <span className="text-sm font-medium">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">User ID</span>
                        <span className="text-sm font-medium">{user?.id || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Account Status</span>
                        <span className="inline-flex items-center text-sm font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5"></span>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Details Card */}
            {user?.userType === 'Farmer' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition hover:shadow-lg border-l-4 border-amber-500">
                <div className="relative">
                  {/* Colored accent at the top */}
                  <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-400 w-full absolute top-0"></div>
                  
                  {/* Card Content */}
                  <div className="pt-4">
                    <div className="px-6 py-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Farm Details</h3>
                          <p className="text-sm text-gray-500 mt-1">Information about your farm</p>
                        </div>
                        {farmerInfo?.registrationNumber && (
                          <span className="inline-flex items-center justify-center rounded-full bg-amber-50 text-amber-700 px-2 py-1 text-xs">
                            Reg: {farmerInfo.registrationNumber}
                          </span>
                        )}
                      </div>
                      
                      {farmerInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Farm Name</span>
                            <span className="text-sm font-medium">{farmerInfo.farmName || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Location</span>
                            <span className="text-sm font-medium">{farmerInfo.location || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Owner/Manager</span>
                            <span className="text-sm font-medium">{farmerInfo.ownerManager || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Contact Phone</span>
                            <span className="text-sm font-medium">{farmerInfo.contactPhone || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Contact Email</span>
                            <span className="text-sm font-medium">{farmerInfo.contactEmail || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Registration Authority</span>
                            <span className="text-sm font-medium">{farmerInfo.registrationAuthority || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Registration Date</span>
                            <span className="text-sm font-medium">{formatDate(farmerInfo.registrationDate)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-8 text-center border border-dashed border-gray-300 rounded-lg">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Farm Information Available</h3>
                          <p className="text-gray-600 mb-4">Please complete your farm profile for better tracking and management.</p>
                          <button className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg">
                            Add Farm Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Farm Statistics Card (Only show if farmerInfo exists) */}
            {farmerInfo && farmerInfo.farmCapacity && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition hover:shadow-lg border-l-4 border-blue-500">
                <div className="relative">
                  {/* Colored accent at the top */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 w-full absolute top-0"></div>
                  
                  {/* Card Content */}
                  <div className="pt-4">
                    <div className="px-6 py-4">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-900">Farm Statistics</h3>
                        <p className="text-sm text-gray-500 mt-1">Current farm capacity and utilization</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Farm Capacity</span>
                          <span className="text-xl font-bold text-blue-700">{farmerInfo.farmCapacity || '0'}</span>
                          <span className="text-xs text-gray-500 block mt-1">maximum chicken</span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Current Flock Size</span>
                          <span className="text-xl font-bold text-blue-700">{farmerInfo.flockSize || '0'}</span>
                          <span className="text-xs text-gray-500 block mt-1">active chicken</span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Utilization</span>
                          <span className="text-xl font-bold text-blue-700">
                            {farmerInfo.farmCapacity && farmerInfo.flockSize ? 
                              `${Math.round((farmerInfo.flockSize / farmerInfo.farmCapacity) * 100)}%` : 
                              '0%'}
                          </span>
                          <span className="text-xs text-gray-500 block mt-1">of total capacity</span>
                        </div>
                      </div>
                      
                      {/* Simple progress bar */}
                      {farmerInfo.farmCapacity && farmerInfo.flockSize && (
                        <div className="mt-6">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.min(100, Math.round((farmerInfo.flockSize / farmerInfo.farmCapacity) * 100))}%` }}>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0</span>
                            <span>{farmerInfo.farmCapacity}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;