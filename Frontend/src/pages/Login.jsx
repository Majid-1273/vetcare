import img from "../assets/images/loginSignup.png";
import React from 'react';
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Hidden on mobile, visible on md and up */}
      <div className="hidden md:flex w-full md:w-1/2 bg-green-50 p-8 flex-col justify-center items-center min-h-screen">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            {/* Illustration would be here */}
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
          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-md bg-green-100"
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-md bg-green-100"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                👁️
              </button>
            </div>
            
            <div>
              <div className="relative w-full">
                <select className="w-full p-3 rounded-md bg-green-100 appearance-none text-gray-400">
                  <option>User Type</option>
                  <option>Admin</option>
                  <option>Standard User</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full p-3 bg-green-300 text-gray-800 rounded-md hover:bg-green-400 transition-colors"
            >
              Login
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