// src/pages/Signup.js
import img from "../assets/images/loginSignup.png";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'Farmer'
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
    if (isAuthenticated) {
      if (user?.userType === 'Farmer') {
        navigate('/flock-management');
      } else if (user?.userType === 'Vet') {
        navigate('/vet-dashboard');
      } else {
        navigate('/flock-management');
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
    if (!formData.username || !formData.email || !formData.password || !formData.userType) {
      return;
    }

    // Dispatch register action
    dispatch(registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      userType: formData.userType
    }));
  };

  // Add a console log to debug the auth state
  useEffect(() => {
    console.log("Auth state (signup):", { isAuthenticated, user, error, loading });
  }, [isAuthenticated, user, error, loading]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full min-h-screen md:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <h1 className="text-2xl font-bold text-black mb-6">Create Your Account</h1>
        
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-green-100"
                required
              />
            </div>
            
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
            
            {/* <div>
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
            </div> */}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 bg-green-300 text-gray-800 rounded-md hover:bg-green-400 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Signup;