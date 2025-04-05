import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bird, MapPin, MessageSquare, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      path: "/home", 
      label: "Home",
      icon: <Home size={24} />
    },
    { 
      path: "/flock-management", 
      label: "Flock Management",
      icon: <Bird size={24} />
    },
    { 
      path: "/vet-locator", 
      label: "Vet Locator",
      icon: <MapPin size={24} />
    },
    { 
      path: "/chatbot", 
      label: "Chatbot",
      icon: <MessageSquare size={24} />
    },
    { 
      path: "/reports-&-analytics", 
      label: "Reports & Analytics",
      icon: <User size={24} />
    }
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-24 bg-[#DFFFE0] shadow-lg transition-all duration-300 hover:w-64 group z-50">
      {/* Logo Section */}
      <div className="py-6 flex justify-center">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110">
          <span className="text-white font-bold text-2xl">PM</span>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="flex flex-col gap-3 px-3 mt-6">
        {navItems.map((item) => (
          <SidebarItem 
            key={item.path}
            to={item.path} 
            icon={item.icon} 
            label={item.label} 
            active={location.pathname === item.path} 
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced SidebarItem Component
const SidebarItem = ({ icon, label, active, to }) => {
  return (
    <Link to={to} className="w-full no-underline text-black">
      <div className={`w-full py-3 px-4 flex items-center rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-gradient-to-r from-green-200 to-green-100 shadow-md' 
          : 'hover:bg-green-100 hover:shadow-sm'
      }`}>
        <div className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 ${
          active ? 'text-green-700' : 'text-green-600'
        }`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${
          active ? 'text-green-800' : 'text-gray-700'
        }`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;