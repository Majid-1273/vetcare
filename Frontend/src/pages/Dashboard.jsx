import React from "react";
import Decore from "../assets/images/decore.png";
import Farmer from "../assets/images/farmer.png";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-[#f9fef7] px-6 md:px-12 lg:px-20">
      <div className="absolute top-4 right-6 flex gap-4 z-10">
        <Link 
          to="/signup"
          className="px-4 py-2 text-gray-900 font-semibold bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition inline-block"
        >
          Sign Up
        </Link>
        <Link 
          to="/login"
          className="px-4 py-2 text-gray-900 font-semibold bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition inline-block"
        >
          Login
        </Link>
      </div>
      
      <img
        src={Decore}
        alt="Background Pattern"
        className="absolute top-0 right-0 w-[60%] md:w-[60%] lg:w-[40%] z-0"
      />
      
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="md:w-1/2 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Raise.<br />Manage.<br />Thrive.
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Empowering Farmers and Vets with a Smart Companion Tool.
          </p>
          <Link 
            to="/signup"
            className="mt-6 px-6 py-3 bg-[#b8e6c1] text-gray-900 text-lg font-semibold rounded-lg shadow-md hover:bg-[#a2d4b0] transition inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      <img
        src={Farmer}
        alt="Happy Farmer"
        className="absolute bottom-0 right-0 w-[50%] md:w-[70%] lg:w-[50%] z-0"
      />
    </section>
  );
};

export default Dashboard;