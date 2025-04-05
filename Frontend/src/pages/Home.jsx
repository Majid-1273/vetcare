import React from 'react';
import chatbotIcon from "../assets/images/chatbot.png";

const Home = () => {
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
            US
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 bg-white flex-1 overflow-auto">
        {/* Key Metrics Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-center mb-4 text-black">Key Metrics</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Daily Mortality Rate Graph */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium mb-2 text-black">Daily Mortality Rate Over 10 Days</h3>
              <div className="h-32 w-full flex items-center justify-center text-gray-600">
                <p>No mortality data available</p>
              </div>
            </div>
            
            {/* Feed Consumption Graph */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium mb-2 text-black">Feed Consumption Throughout the Day</h3>
              <div className="h-32 w-full flex items-center justify-center text-gray-600">
                <p>No feed consumption data available</p>
              </div>
            </div>
            
            {/* Revenue Overview Pie Chart */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium mb-2 text-black">Revenue Overview</h3>
              <div className="h-32 w-full flex items-center justify-center text-gray-600">
                <p>No revenue data available</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Two Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Pet Vaccinations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-center text-black">Upcoming Pet Vaccinations</h2>
            <div className="h-32 flex items-center justify-center text-gray-600">
              <p>No vaccinations pending</p>
            </div>
          </div>
          
          {/* Recent Chatbot History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-center text-black">Recent Chatbot History</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <img src={chatbotIcon} alt="Chatbot" className="w-10 h-10 mr-2" />
                <span className="text-sm font-medium text-black">No new message today</span>
              </div>
            </div>
            <div className="h-24 flex items-center justify-center text-gray-600">
              <p>No recent chat history to display</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;