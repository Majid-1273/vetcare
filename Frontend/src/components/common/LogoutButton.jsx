// src/components/common/LogoutButton.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;