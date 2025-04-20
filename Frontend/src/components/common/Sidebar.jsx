import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import chatbot from '../../assets/images/chat.png';
import flockManagement from '../../assets/images/flockManagement.png';
import home from '../../assets/images/home.png';
import reportsAnalytics from '../../assets/images/reportsAnalytics.png';
import vetlocator from '../../assets/images/vetlocator.png';
import addWroker from '../../assets/images/addWroker.png';
import dollarBag from '../../assets/images/dollarbag.png';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/home",
      label: "Home",
      image: home
    },
    {
      path: "/flock-management",
      label: "Flock Management",
      image: flockManagement
    },
    {
      path: "/chatbot",
      label: "Chatbot",
      image: chatbot
    },
    {
      path: "/vet-locator",
      label: "Vet Locator",
      image: vetlocator
    },
    {
      path: "/reports-&-analytics",
      label: "Reports & Analytics",
      image: reportsAnalytics
    },
    {
      path: "/add-worker",
      label: "Add Worker",
      image: addWroker
    },
    {
      path: "/financial-record",
      label: "Financial Record",
      image: dollarBag
    },
  ];

  return (
    <div className="
      fixed bg-[#DFFFE0] shadow-lg z-50
      md:top-0 md:left-0 md:h-full md:w-28 md:flex md:flex-col
      bottom-0 left-0 w-full h-16 flex flex-row">
      
      {/* Navigation Items Container - with proper overflow handling */}
      <div className="
        flex w-full h-full
        md:items-start md:justify-start md:flex-col md:overflow-y-auto md:overflow-x-hidden md:py-4
        items-center justify-start flex-row overflow-x-auto overflow-y-hidden px-2">
        
        {navItems.map((item) => (
          <SidebarItem
            key={item.path}
            to={item.path}
            image={item.image}
            label={item.label}
            active={location.pathname === item.path}
          />
        ))}
      </div>
    </div>
  );
};

// Responsive SidebarItem Component
const SidebarItem = ({ image, label, active, to }) => {
  return (
    <Link to={to} className="
      no-underline text-black flex-shrink-0
      md:w-full md:mb-3 md:px-2
      w-16">
      
      <div className={`
        flex flex-col items-center justify-center rounded-lg transition-all duration-200
        md:w-full md:py-3
        py-2 h-full
        ${active
          ? 'bg-gradient-to-r from-green-200 to-green-100 shadow-md'
          : 'hover:bg-green-100 hover:shadow-sm'
        }`}>
        
        {/* Image container */}
        <div className="
          flex-shrink-0 flex items-center justify-center
          md:w-8 md:h-8
          w-7 h-7">
          <img
            src={image}
            alt={label}
            className="
              object-contain
              md:w-5 md:h-5
              w-4 h-4"
          />
        </div>
        
        {/* Text below the image */}
        <span className={`
          font-medium text-center truncate
          md:text-xs md:mt-1 md:w-full
          text-[10px] mt-0.5 w-14
          ${active ? 'text-green-800' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;