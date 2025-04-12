// src/pages/Login.js
import img from "../assets/images/loginSignup.png";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === 'Farmer') {
        navigate('/home');
      } else if (user.userType === 'Vet') {
        navigate('/vet-dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.email || !formData.password) {
      return;
    }

    // Dispatch login action with all form data
    dispatch(loginUser({
      email: formData.email,
      password: formData.password,
      userType: formData.userType
    }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Hidden on mobile, visible on md and up */}
      <div className="hidden md:flex w-full md:w-1/2 bg-green-50 p-8 flex-col justify-center items-center min-h-screen">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <img 
              src={img}
              alt="Person with dog in cityscape" 
              className="w-full" 
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">Raise. Manage. Thrive.</h2>
        </div>
      </div>

      {/* Right Section - Full width on mobile */}
      <div className="w-full min-h-screen md:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <h1 className="text-2xl font-bold text-black mb-6">Welcome Back!</h1>
        
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-green-100"
                required
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-green-100"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            <div>
              <div className="relative w-full">
                <select 
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-green-100 appearance-none text-gray-600"
                >
                  <option value="" disabled>User Type</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Vet">Veterinarian</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 bg-green-300 text-gray-800 rounded-md hover:bg-green-400 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <a href="#" className="hover:underline">Forgot Password?</a>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;