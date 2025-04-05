import React, { useState } from 'react';
import Feeds from '../components/Feeds';
import Vaccination from '../components/Vaccination';
import DailyMortalityTracking from '../components/DailyMortalityTracking';

function BroilerDetails() {
  const [activeTab, setActiveTab] = useState('Feeds');
  
  // Function to render the active component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'Feeds':
        return <Feeds />;
      case 'Vaccination':
        return <Vaccination />;
      case 'Daily Mortality Tracking':
        return <DailyMortalityTracking />;
      default:
        return <Feeds />;
    }
  };

  return (
    <>
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
        
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="relative p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Icon */}
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-800">
            ES
          </div>
        </div>
      </div>

      {/* Navigation tabs - Styled to match the image */}
      <div className="flex justify-center">
        <div className="flex">
          {['Feeds', 'Vaccination', 'Daily Mortality Tracking'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'text-green-500 border-b-2 border-green-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {renderActiveComponent()}
      </div>
    </>
  );
}

export default BroilerDetails;