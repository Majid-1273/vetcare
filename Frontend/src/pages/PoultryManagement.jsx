import React from 'react';
import FlockManagement from './Flock';

const PoultryManagement = () => {
  return (
    <>
      {/* Top Navigation/Search Bar */}
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

    </div>
        
    <FlockManagement/>

    </>
  );
};

export default PoultryManagement;