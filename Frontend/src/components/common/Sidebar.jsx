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
      label: "Financail Record",
      image: dollarBag
    },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-28 bg-[#DFFFE0] shadow-lg z-50 flex items-center justify-center">
      {/* Navigation Items */}
      <div className="flex flex-col gap-4 items-center justify-center">
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

// Updated SidebarItem Component
const SidebarItem = ({ image, label, active, to }) => {
  return (
    <Link to={to} className="w-full no-underline text-black">
      <div className={`w-full py-2 flex flex-col items-center justify-center rounded-lg transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-green-200 to-green-100 shadow-md'
          : 'hover:bg-green-100 hover:shadow-sm'
      }`}>
        {/* Image container */}
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <img
            src={image}
            alt={label}
            className="w-6 h-6 object-contain"
          />
        </div>
        {/* Text below the image */}
        <span className={`text-xs font-medium mt-1 text-center ${
          active ? 'text-green-800' : 'text-gray-700'
        }`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;